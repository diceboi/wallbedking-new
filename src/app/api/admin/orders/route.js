import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import {
  sendOrderConfirmationEmail,
  sendShippingNotificationEmail,
  sendProductionNotificationEmail,
  sendDeliveryNotificationEmail,
  isOwnDelivery,
} from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/orders
 * Returns list of orders and aggregate stats
 */
export async function GET(request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: "Database client unavailable" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    const search = searchParams.get("search") || "";
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    let query = supabaseAdmin
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (status !== "all") {
      query = query.eq("status", status);
    }

    if (search.trim()) {
      const s = search.trim();
      query = query.or(`id.ilike.%${s}%,customer_name.ilike.%${s}%,customer_email.ilike.%${s}%`);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.warn("[Admin Orders] Fetch warning:", error.message);
      return NextResponse.json({
        success: true,
        orders: [],
        stats: { total: 0, revenue: 0, pending: 0, paid: 0, shipped: 0 },
        message: "Orders table empty or initializing",
      });
    }

    const orderList = orders || [];

    // Calculate stats
    let totalRevenue = 0;
    let pendingCount = 0;
    let paidCount = 0;
    let shippedCount = 0;

    for (const o of orderList) {
      if (["paid", "processing", "shipped", "completed"].includes(o.status) || o.payment_status === "paid") {
        totalRevenue += Number(o.total_amount || 0);
      }
      if (o.status === "pending" || o.payment_status === "unpaid") pendingCount++;
      if (o.status === "paid" || o.status === "processing") paidCount++;
      if (o.status === "shipped") shippedCount++;
    }

    return NextResponse.json({
      success: true,
      orders: orderList,
      stats: {
        total: orderList.length,
        revenue: Math.round(totalRevenue * 100) / 100,
        pending: pendingCount,
        paid: paidCount,
        shipped: shippedCount,
      },
    });
  } catch (err) {
    console.error("[Admin Orders] Exception:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/orders
 * Updates status, tracking info, or admin notes for an order,
 * or handles on-demand resending of notification emails.
 *
 * Rules:
 * 1. First time moving to a status -> notification email is sent automatically (no checkbox needed).
 * 2. If email for that status was already sent -> NO email is sent on subsequent edits unless
 *    sendUpdateEmail is explicitly checked or an on-demand resend action is triggered.
 * 3. Any resent/update email includes the [MÓDOSÍTÁS] / [UPDATED] subject tag and top banner.
 */
export async function PATCH(request) {
  try {
    const body = await request.json();
    const {
      orderId,
      status,
      trackingNumber,
      trackingCarrier,
      adminNotes,
      paymentStatus,
      sendUpdateEmail,
      action,
      emailType,
      isUpdate: explicitIsUpdate,
    } = body || {};

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Missing orderId parameter" },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: "Database client unavailable" },
        { status: 500 }
      );
    }

    // 1. Fetch current order
    const { data: currentOrder, error: fetchErr } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (fetchErr || !currentOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Parse existing shipping address and notification timestamps
    let shippingAddr = {};
    if (typeof currentOrder.shipping_address === "string") {
      try {
        shippingAddr = JSON.parse(currentOrder.shipping_address);
      } catch (e) {
        shippingAddr = {};
      }
    } else if (currentOrder.shipping_address && typeof currentOrder.shipping_address === "object") {
      shippingAddr = { ...currentOrder.shipping_address };
    }

    const notificationsSent = { ...(shippingAddr.notifications_sent || {}) };
    const wasProcessingSent = Boolean(notificationsSent.processing);
    const wasShippedSent = Boolean(currentOrder.dispatched_at || notificationsSent.shipped);
    const wasDeliveredSent = Boolean(currentOrder.delivered_at || notificationsSent.completed);

    // ==========================================
    // ACTION: Direct Resend of Notification Email
    // ==========================================
    if (action === "resend_email") {
      const targetType = emailType || "confirmation";
      const isUpdate = explicitIsUpdate !== undefined ? Boolean(explicitIsUpdate) : true;
      let emailResult = null;
      const nowIso = new Date().toISOString();

      if (targetType === "confirmation") {
        emailResult = await sendOrderConfirmationEmail(currentOrder, null, isUpdate);
        notificationsSent.confirmation = nowIso;
      } else if (targetType === "production") {
        emailResult = await sendProductionNotificationEmail(currentOrder, null, isUpdate);
        notificationsSent.processing = nowIso;
      } else if (targetType === "shipped") {
        const activeCarrier = currentOrder.tracking_carrier || "UPS";
        const ownFleet = isOwnDelivery(activeCarrier);
        const activeTracking = ownFleet ? "" : (currentOrder.tracking_number || "");
        emailResult = await sendShippingNotificationEmail(currentOrder, activeTracking, activeCarrier, isUpdate);
        notificationsSent.shipped = nowIso;
      } else if (targetType === "delivery" || targetType === "completed") {
        emailResult = await sendDeliveryNotificationEmail(currentOrder, null, isUpdate);
        notificationsSent.completed = nowIso;
      } else {
        return NextResponse.json({ success: false, error: `Unknown email type: ${targetType}` }, { status: 400 });
      }

      // Persist notifications_sent in DB
      const updatedShipping = { ...shippingAddr, notifications_sent: notificationsSent };
      const { data: updatedOrder, error: updateErr } = await supabaseAdmin
        .from("orders")
        .update({
          shipping_address: updatedShipping,
          updated_at: nowIso,
        })
        .eq("id", orderId)
        .select()
        .single();

      return NextResponse.json({
        success: true,
        message: `${targetType.toUpperCase()} notification email resent (${isUpdate ? "marked as updated" : "standard"}).`,
        emailResult,
        order: updatedOrder || currentOrder,
      });
    }

    // ==========================================
    // STANDARD UPDATE: Status / Tracking / Notes
    // ==========================================
    const nowIso = new Date().toISOString();
    const updates = {
      updated_at: nowIso,
    };

    if (status !== undefined) updates.status = status;
    if (paymentStatus !== undefined) updates.payment_status = paymentStatus;
    if (trackingNumber !== undefined) updates.tracking_number = trackingNumber;
    if (trackingCarrier !== undefined) updates.tracking_carrier = trackingCarrier;
    if (adminNotes !== undefined) updates.admin_notes = adminNotes;

    // Determine notification intentions
    // 1. In Production (processing)
    const isNowProcessingFirstTime = status === "processing" && currentOrder.status !== "processing" && !wasProcessingSent;
    const isProcessingUpdate = (status === "processing" || (status === undefined && currentOrder.status === "processing")) && wasProcessingSent && Boolean(sendUpdateEmail);
    const willSendProcessing = isNowProcessingFirstTime || isProcessingUpdate;

    // 2. Dispatched (shipped)
    const isNowShippedFirstTime = status === "shipped" && !wasShippedSent;
    const isShippedUpdate = (status === "shipped" || (status === undefined && currentOrder.status === "shipped")) && wasShippedSent && Boolean(sendUpdateEmail);
    const willSendShipped = isNowShippedFirstTime || isShippedUpdate;

    // 3. Delivered (completed)
    const isNowCompletedFirstTime = status === "completed" && !wasDeliveredSent;
    const isCompletedUpdate = (status === "completed" || (status === undefined && currentOrder.status === "completed")) && wasDeliveredSent && Boolean(sendUpdateEmail);
    const willSendCompleted = isNowCompletedFirstTime || isCompletedUpdate;

    // Set timestamps in DB
    if ((status === "shipped" || willSendShipped) && !currentOrder.dispatched_at) {
      updates.dispatched_at = nowIso;
    }
    if ((status === "completed" || willSendCompleted) && !currentOrder.delivered_at) {
      updates.delivered_at = nowIso;
    }

    // Record notification timestamps
    if (willSendProcessing) notificationsSent.processing = nowIso;
    if (willSendShipped) notificationsSent.shipped = nowIso;
    if (willSendCompleted) notificationsSent.completed = nowIso;

    updates.shipping_address = { ...shippingAddr, notifications_sent: notificationsSent };

    // Apply DB update
    const { data: updatedOrder, error: updateErr } = await supabaseAdmin
      .from("orders")
      .update(updates)
      .eq("id", orderId)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json(
        { success: false, error: updateErr.message },
        { status: 500 }
      );
    }

    // Execute email sending with updated data
    let emailResult = null;
    let notificationType = null;
    let wasUpdatedFlag = false;

    if (willSendProcessing) {
      const isUpdate = !isNowProcessingFirstTime;
      wasUpdatedFlag = isUpdate;
      try {
        emailResult = await sendProductionNotificationEmail(updatedOrder, null, isUpdate);
        notificationType = "production";
        console.log(`[Production Email] Sent to ${updatedOrder.customer_email} (isUpdate: ${isUpdate}):`, emailResult);
      } catch (mailErr) {
        console.error("[Production Email Error]", mailErr);
      }
    } else if (willSendShipped) {
      const isUpdate = !isNowShippedFirstTime;
      wasUpdatedFlag = isUpdate;
      const activeCarrier = trackingCarrier || updatedOrder.tracking_carrier || "UPS";
      const ownFleet = isOwnDelivery(activeCarrier);
      const activeTracking = ownFleet ? "" : (trackingNumber !== undefined ? trackingNumber : (updatedOrder.tracking_number || ""));
      try {
        emailResult = await sendShippingNotificationEmail(updatedOrder, activeTracking, activeCarrier, isUpdate);
        notificationType = "shipped";
        console.log(`[Dispatch Email] Sent to ${updatedOrder.customer_email} (isUpdate: ${isUpdate}):`, emailResult);
      } catch (mailErr) {
        console.error("[Dispatch Email Error]", mailErr);
      }
    } else if (willSendCompleted) {
      const isUpdate = !isNowCompletedFirstTime;
      wasUpdatedFlag = isUpdate;
      try {
        emailResult = await sendDeliveryNotificationEmail(updatedOrder, null, isUpdate);
        notificationType = "delivered";
        console.log(`[Delivery Email] Sent to ${updatedOrder.customer_email} (isUpdate: ${isUpdate}):`, emailResult);
      } catch (mailErr) {
        console.error("[Delivery Email Error]", mailErr);
      }
    }

    let feedbackMessage = "Order updated successfully";
    if (notificationType === "production") {
      feedbackMessage = wasUpdatedFlag
        ? "Order updated and [UPDATED] Production email sent to customer!"
        : "Order marked as In Production and customer notified by email!";
    } else if (notificationType === "shipped") {
      feedbackMessage = wasUpdatedFlag
        ? "Order updated and [UPDATED] Dispatch email sent to customer!"
        : "Order marked as Dispatched and tracking email sent to customer!";
    } else if (notificationType === "delivered") {
      feedbackMessage = wasUpdatedFlag
        ? "Order updated and [UPDATED] Delivery email sent to customer!"
        : "Order marked as Delivered and confirmation email sent to customer!";
    }

    return NextResponse.json({
      success: true,
      message: feedbackMessage,
      notificationType,
      emailSent: Boolean(emailResult?.success),
      order: updatedOrder,
    });
  } catch (err) {
    console.error("[Admin Orders PATCH Exception]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update order" },
      { status: 500 }
    );
  }
}
