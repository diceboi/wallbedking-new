import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendOrderConfirmationEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

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
    const effectiveCurrency = (currency || (effectiveLocale === "en" ? "GBP" : "EUR")).toUpperCase();
    console.log(`[PayPal Capture] Finalizing payment for order: ${orderId || "new"} (PayPal TX: ${paypalOrderId}, Entity: ${companyEntity || "N/A"}, Currency: ${effectiveCurrency})`);

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

      const paymentTxId = paypalOrderId || captureData?.id || null;

      if (order) {
        // 2a. Update existing order to paid
        const updatePayload = {
          status: "paid",
          payment_status: "paid",
          payment_method: "paypal",
          payment_id: paymentTxId,
          updated_at: new Date().toISOString(),
        };
        if (effectiveCurrency) updatePayload.currency = effectiveCurrency;
        if (companyEntity || locale) {
          updatePayload.admin_notes = `[Entity: ${companyEntity || "N/A"}] [Locale: ${effectiveLocale}]`;
        }
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
          country: shipping?.address?.country_code || (effectiveLocale === "en" ? "United Kingdom" : "International"),
          locale: effectiveLocale,
          company_entity: companyEntity || "INTERNATIONAL",
        };

        const newOrderId = orderId || `WBK-${Math.floor(100000 + Math.random() * 900000)}`;
        const orderAmount = Number(total || captureData?.amount?.value || 0);

        const newOrderRecord = {
          id: newOrderId,
          user_id: customer?.userId || null,
          status: "paid",
          payment_status: "paid",
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
          admin_notes: `[Entity: ${companyEntity || "INTERNATIONAL"}] [Locale: ${effectiveLocale}]`,
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

      // 3. Decrement stock for ordered items
      if (finalOrder && Array.isArray(finalOrder.items)) {
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

      // 4. Send email confirmation to customer & alert to admin
      if (finalOrder && finalOrder.customer_email) {
        console.log(`[PayPal Capture] Dispatching order confirmation email to ${finalOrder.customer_email} (${effectiveLocale})...`);
        try {
          await sendOrderConfirmationEmail(finalOrder, effectiveLocale);
        } catch (emailErr) {
          console.error("[PayPal Capture] Confirmation email error:", emailErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      orderId: finalOrder?.id || orderId || "WBK-UNKNOWN",
      status: "paid",
    });
  } catch (err) {
    console.error("[PayPal Capture Route Exception]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to finalize PayPal capture" },
      { status: 500 }
    );
  }
}
