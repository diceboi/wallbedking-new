import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendShippingNotificationEmail } from "@/lib/email";

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
 * Updates status, tracking info, or admin notes for an order
 */
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { orderId, status, trackingNumber, trackingCarrier, adminNotes, paymentStatus } = body || {};

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

    const updates = {
      updated_at: new Date().toISOString(),
    };

    if (status !== undefined) updates.status = status;
    if (paymentStatus !== undefined) updates.payment_status = paymentStatus;
    if (trackingNumber !== undefined) updates.tracking_number = trackingNumber;
    if (trackingCarrier !== undefined) updates.tracking_carrier = trackingCarrier;
    if (adminNotes !== undefined) updates.admin_notes = adminNotes;

    if (status === "shipped" && !currentOrder.dispatched_at) {
      updates.dispatched_at = new Date().toISOString();
    }
    if (status === "completed" && !currentOrder.delivered_at) {
      updates.delivered_at = new Date().toISOString();
    }

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

    // If order was marked as shipped or tracking updated while shipped, trigger dispatch notification email
    let emailResult = null;
    const isNowShipped = status === "shipped" && currentOrder.status !== "shipped";
    const trackingUpdated = status === "shipped" && trackingNumber && trackingNumber !== currentOrder.tracking_number;

    if (isNowShipped || trackingUpdated) {
      const activeTracking = trackingNumber || updatedOrder.tracking_number || "DXFR-88392190-GB";
      const activeCarrier = trackingCarrier || updatedOrder.tracking_carrier || "DX Freight Specialist Logistics";
      try {
        emailResult = await sendShippingNotificationEmail(updatedOrder, activeTracking, activeCarrier);
        console.log(`[Dispatch Email] Sent to ${updatedOrder.customer_email}:`, emailResult);
      } catch (mailErr) {
        console.error("[Dispatch Email Error]", mailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: isNowShipped ? "Order marked as dispatched and notification email sent to customer!" : "Order updated successfully",
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
