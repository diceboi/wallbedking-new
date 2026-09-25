import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { sendOrderConfirmationEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey) {
    return NextResponse.json(
      { error: "Stripe is not configured on this server." },
      { status: 500 }
    );
  }

  const stripe = new Stripe(stripeSecretKey);
  const sig = request.headers.get("stripe-signature");

  let event;
  try {
    const rawBody = await request.text();
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } else {
      // In development without webhook secret, parse payload safely
      event = JSON.parse(rawBody);
    }
  } catch (err) {
    console.error("[Stripe Webhook] Verification failure:", err.message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle successful checkout
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.order_id || session.client_reference_id;
    const customerEmail = session.customer_details?.email;
    const paymentIntentId = session.payment_intent;

    console.log(`[Stripe Webhook] Payment confirmed for Order ${orderId}`);

    if (supabaseAdmin && orderId) {
      try {
        // 1. Fetch current order
        const { data: order } = await supabaseAdmin
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .maybeSingle();

        // 2. Mark order as paid
        const updateData = {
          status: "paid",
          payment_status: "paid",
          payment_id: session.id || paymentIntentId || null,
          updated_at: new Date().toISOString(),
        };
        if (session.metadata?.company_entity) updateData.company_entity = session.metadata.company_entity;
        if (session.currency) updateData.currency = session.currency.toUpperCase();
        if (session.metadata?.locale) updateData.locale = session.metadata.locale;

        const { error: updateError } = await supabaseAdmin
          .from("orders")
          .update(updateData)
          .eq("id", orderId);

        if (updateError) {
          console.error("[Stripe Webhook] Failed to update order status:", updateError.message);
        }

        // 3. Decrement stock for items if order found
        if (order && Array.isArray(order.items)) {
          for (const it of order.items) {
            const rawId = it.rawId || it.id;
            const qty = Number(it.quantity) || 1;
            if (rawId) {
              try {
                // Fetch product stock
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
              } catch (stockErr) {
                console.warn("[Stripe Webhook] Stock decrement notice:", stockErr.message);
              }
            }
          }

          // 4. Trigger modular order confirmation email (logs or sends)
          await sendOrderConfirmationEmail(order);
        }
      } catch (dbErr) {
        console.error("[Stripe Webhook] Database processing error:", dbErr);
      }
    }
  }

  return NextResponse.json({ received: true });
}
