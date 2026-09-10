import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendOrderConfirmationEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const { orderId, paypalOrderId, payer, shipping, captureData } = body || {};

    if (!orderId && !paypalOrderId) {
      return NextResponse.json(
        { success: false, error: "Missing order identifiers" },
        { status: 400 }
      );
    }

    const targetOrderId = orderId;
    console.log(`[PayPal Capture] Finalizing payment for order: ${targetOrderId}`);

    if (supabaseAdmin && targetOrderId) {
      // 1. Fetch current order
      const { data: order } = await supabaseAdmin
        .from("orders")
        .select("*")
        .eq("id", targetOrderId)
        .maybeSingle();

      // 2. Mark order as paid
      await supabaseAdmin
        .from("orders")
        .update({
          status: "paid",
          payment_status: "paid",
          payment_method: "paypal",
          payment_id: paypalOrderId || captureData?.id || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", targetOrderId);

      // 3. Decrement stock
      if (order && Array.isArray(order.items)) {
        for (const it of order.items) {
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

        // 4. Send email confirmation (logs or sends)
        await sendOrderConfirmationEmail(order);
      }
    }

    return NextResponse.json({
      success: true,
      orderId: targetOrderId,
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
