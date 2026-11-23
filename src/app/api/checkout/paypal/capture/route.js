import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { generateOrderNumber } from "@/lib/orders";
import { getPaymentConfig } from "@/lib/payments";

export const dynamic = "force-dynamic";

async function verifyPayPalOrderWithApi(paypalOrderId, paymentConfig) {
  const clientId = paymentConfig?.paypalClientId;
  const secretKey = paymentConfig?.paypalSecretKey;
  if (!paypalOrderId || !clientId || !secretKey) {
    return { skipped: true };
  }

  try {
    const baseUrl =
      process.env.PAYPAL_MODE === "sandbox"
        ? "https://api-m.sandbox.paypal.com"
        : "https://api-m.paypal.com";
    const auth = Buffer.from(`${clientId}:${secretKey}`).toString("base64");
    const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!tokenRes.ok) {
      console.warn(`[PayPal Capture] OAuth token check failed (${tokenRes.status})`);
      return { skipped: true };
    }
    const { access_token: accessToken } = await tokenRes.json();
    if (!accessToken) return { skipped: true };

    const orderRes = await fetch(
      `${baseUrl}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (orderRes.status === 404 || orderRes.status === 422) {
      return {
        verified: false,
        fatal: true,
        reason: `PayPal order ${paypalOrderId} not found (${orderRes.status})`,
      };
    }
    if (!orderRes.ok) {
      console.warn(`[PayPal Capture] Order lookup returned ${orderRes.status}`);
      return { skipped: true };
    }

    const orderJson = await orderRes.json();
    const pu = orderJson?.purchase_units?.[0];
    const capture = pu?.payments?.captures?.[0] || null;
    return {
      verified: true,
      orderStatus: String(orderJson?.status || "").toUpperCase(),
      capture,
    };
  } catch (err) {
    console.warn("[PayPal Capture] Server-side PayPal API verification error:", err.message);
    return { skipped: true };
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      orderId,
      paypalOrderId,
      payer,
      shipping,
      customer,
      shippingAddress: customShippingAddress,
      captureData,
      items,
      total,
      locale,
      currency,
      companyEntity,
    } = body || {};

    if (!orderId && !paypalOrderId) {
      return NextResponse.json(
        { success: false, error: "Missing order identifiers" },
        { status: 400 }
      );
    }

    const effectiveLocale = locale || "en";
    const paymentConfig = getPaymentConfig(effectiveLocale, currency);
    const effectiveCurrency = paymentConfig.currency;
    const effectiveEntity = companyEntity || paymentConfig.entity;

    // Server-side verification when PayPal secret is configured for this entity
    const apiVerification = await verifyPayPalOrderWithApi(paypalOrderId, paymentConfig);
    if (apiVerification?.fatal) {
      console.error(`[PayPal Capture] Rejected unverified order: ${apiVerification.reason}`);
      return NextResponse.json(
        { success: false, error: "PayPal transaction could not be verified." },
        { status: 400 }
      );
    }

    const authoritativeCapture = apiVerification?.capture || captureData || null;
    const captureTxId = authoritativeCapture?.id || null;
    const captureStatus = String(
      authoritativeCapture?.status || apiVerification?.orderStatus || ""
    ).toUpperCase();

    // Never mark declined/failed/voided PayPal captures as paid
    if (["DECLINED", "FAILED", "VOIDED", "DENIED"].includes(captureStatus)) {
      console.warn(`[PayPal Capture] Payment declined/failed (${captureStatus}) for order ${orderId || paypalOrderId}`);
      if (orderId && supabaseAdmin) {
        await supabaseAdmin
          .from("orders")
          .update({
            payment_status: "failed",
            admin_notes: `[Entity: ${effectiveEntity}] [Locale: ${effectiveLocale}] [PayPalOrder: ${paypalOrderId || "N/A"}] [CaptureStatus: ${captureStatus}]`,
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId);
      }
      return NextResponse.json(
        { success: false, error: `PayPal payment was not completed (${captureStatus}).` },
        { status: 402 }
      );
    }

    const hasConfirmedCapture =
      captureStatus === "COMPLETED" && (Boolean(captureTxId) || Boolean(apiVerification?.verified));
    const isPendingCapture = captureStatus === "PENDING" || !hasConfirmedCapture;
    const resolvedOrderStatus = isPendingCapture ? "pending" : "paid";
    const resolvedPaymentStatus = isPendingCapture ? "pending" : "paid";
    // Prioritize actual PayPal Capture Transaction ID (shown in PayPal Activity) over Checkout Order ID
    const paymentTxId = captureTxId || paypalOrderId || null;
    const notesParts = [
      `[Entity: ${effectiveEntity}]`,
      `[Locale: ${effectiveLocale}]`,
      paypalOrderId ? `[PayPalOrder: ${paypalOrderId}]` : null,
      captureStatus && captureStatus !== "COMPLETED" ? `[CaptureStatus: ${captureStatus}]` : null,
      !hasConfirmedCapture && !captureStatus ? `[UnverifiedCapture]` : null,
    ].filter(Boolean);
    const builtAdminNotes = notesParts.join(" ");

    console.log(
      `[PayPal Capture] Finalizing payment for order: ${orderId || "new"} (Capture TX: ${captureTxId || "N/A"}, PayPal Order: ${paypalOrderId || "N/A"}, Status: ${captureStatus || "N/A"}, Entity: ${effectiveEntity}, Currency: ${effectiveCurrency})`
    );

    let finalOrder = null;

    if (supabaseAdmin) {
      // 1. Fetch current order if orderId was provided
      let order = null;
      if (orderId) {
        const { data: existingOrder } = await supabaseAdmin
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .maybeSingle();
        order = existingOrder;
      }

      if (order) {
        // 2a. Update existing order with verified capture status
        const updatePayload = {
          status: resolvedOrderStatus,
          payment_status: resolvedPaymentStatus,
          payment_method: "paypal",
          payment_id: paymentTxId,
          updated_at: new Date().toISOString(),
        };
        if (effectiveCurrency) updatePayload.currency = effectiveCurrency;
        updatePayload.admin_notes = builtAdminNotes;
        if (!order.user_id && customer?.userId) {
          updatePayload.user_id = customer.userId;
        }
        if (customer?.email && (!order.customer_email || order.customer_email.includes("paypal"))) {
          updatePayload.customer_email = customer.email.trim().toLowerCase();
        }
        if (customer?.name && (!order.customer_name || order.customer_name === "Valued Customer")) {
          updatePayload.customer_name = customer.name;
        }

        await supabaseAdmin
          .from("orders")
          .update(updatePayload)
          .eq("id", order.id);

        finalOrder = { ...order, ...updatePayload };
        if ((!finalOrder.items || finalOrder.items.length === 0) && Array.isArray(items) && items.length > 0) {
          finalOrder.items = items;
        }
      } else {
        // 2b. If order record was not pre-created in DB, create it now so it is never lost
        const customerName =
          customer?.name ||
          [payer?.name?.given_name, payer?.name?.surname].filter(Boolean).join(" ") ||
          "Valued Customer";
        const customerEmail =
          (customer?.email || payer?.email_address || "").trim().toLowerCase();
        const customerPhone = customer?.phone || payer?.phone?.phone_number?.national_number || "";
        const shippingAddr = customShippingAddress || {
          address: shipping?.address?.address_line_1 || "PayPal Address",
          city: shipping?.address?.admin_area_2 || shipping?.address?.admin_area_1 || "City",
          postal_code: shipping?.address?.postal_code || "N/A",
          country:
            shipping?.address?.country_code ||
            (effectiveLocale === "en" ? "United Kingdom" : effectiveLocale === "us" ? "United States" : "International"),
          locale: effectiveLocale,
          company_entity: effectiveEntity,
        };

        const newOrderId = orderId || (await generateOrderNumber());
        const orderAmount = Number(total || captureData?.amount?.value || 0);

        const newOrderRecord = {
          id: newOrderId,
          user_id: customer?.userId || null,
          status: resolvedOrderStatus,
          payment_status: resolvedPaymentStatus,
          payment_method: "paypal",
          payment_id: paymentTxId,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          shipping_address: shippingAddr,
          billing_address: shippingAddr,
          items: Array.isArray(items) ? items : [],
          currency: effectiveCurrency,
          subtotal: orderAmount,
          total_amount: orderAmount,
          admin_notes: builtAdminNotes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { error: insertErr } = await supabaseAdmin
          .from("orders")
          .insert([newOrderRecord]);

        if (insertErr) {
          console.error("[PayPal Capture] Fallback insert error:", insertErr.message);
        } else {
          console.log(`[PayPal Capture] Successfully created fallback order ${newOrderId} in Supabase.`);
        }
        finalOrder = newOrderRecord;
      }

      // 3. Decrement stock only when capture is confirmed COMPLETED
      if (hasConfirmedCapture && finalOrder && Array.isArray(finalOrder.items)) {
        for (const it of finalOrder.items) {
          const rawId = it.rawId || it.id;
          const qty = Number(it.quantity) || 1;
          if (rawId) {
            try {
              const { data: p } = await supabaseAdmin
                .from("products")
                .select("id, stock")
                .eq("id", parseInt(rawId, 10))
                .maybeSingle();

              if (p && p.stock != null) {
                const newStock = Math.max(0, p.stock - qty);
                await supabaseAdmin
                  .from("products")
                  .update({ stock: newStock })
                  .eq("id", p.id);
              }
            } catch (e) {
              console.warn("[PayPal Capture] Stock update notice:", e.message);
            }
          }
        }
      }

      // 4. Send email confirmation to customer & admin when COMPLETED; alert admin only if PENDING/unverified
      if (finalOrder) {
        if (hasConfirmedCapture && finalOrder.customer_email) {
          console.log(`[PayPal Capture] Dispatching order confirmation email to ${finalOrder.customer_email} (${effectiveLocale})...`);
          try {
            await sendOrderConfirmationEmail(finalOrder, effectiveLocale);
          } catch (emailErr) {
            console.error("[PayPal Capture] Confirmation email error:", emailErr);
          }
        } else {
          try {
            const { sendAdminOrderAlert } = await import("@/lib/email");
            await sendAdminOrderAlert(finalOrder);
          } catch (adminErr) {
            console.error("[PayPal Capture] Admin alert error:", adminErr);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      orderId: finalOrder?.id || orderId || "WBK-UNKNOWN",
      paymentId: paymentTxId,
      status: resolvedPaymentStatus,
    });
  } catch (err) {
    console.error("[PayPal Capture Route Exception]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to finalize PayPal capture" },
      { status: 500 }
    );
  }
}
