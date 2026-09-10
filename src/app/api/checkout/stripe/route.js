import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const { line_items, cartId, orderId, success_url, cancel_url } = body;

    if (!line_items || !Array.isArray(line_items) || line_items.length === 0) {
      return NextResponse.json(
        { error: "Missing or empty line_items in request." },
        { status: 400 }
      );
    }

    const referenceId = orderId || cartId || `WBK-${Date.now()}`;
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    // 1. Direct Stripe Checkout Session creation if secret key is present
    if (stripeSecretKey) {
      const stripe = new Stripe(stripeSecretKey);

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: line_items.map((item) => ({
          price_data: {
            currency: item.price_data?.currency || "gbp",
            product_data: {
              name: item.price_data?.product_data?.name || "Wall Bed King Product",
              description: item.price_data?.product_data?.description || undefined,
            },
            unit_amount: item.price_data?.unit_amount,
          },
          quantity: item.quantity || 1,
        })),
        mode: "payment",
        success_url:
          success_url ||
          `https://www.wallbedking.co.uk/thanks?session_id={CHECKOUT_SESSION_ID}&order_id=${encodeURIComponent(
            referenceId
          )}`,
        cancel_url: cancel_url || "https://www.wallbedking.co.uk/cart",
        client_reference_id: referenceId,
        metadata: {
          order_id: referenceId,
          cart_id: cartId || "",
        },
        phone_number_collection: {
          enabled: true,
        },
      });

      // Optionally attach payment_id to pending order if orderId exists
      if (orderId && supabaseAdmin) {
        try {
          await supabaseAdmin
            .from("orders")
            .update({ payment_id: session.id, payment_method: "stripe" })
            .eq("id", orderId);
        } catch (e) {
          console.warn("[Stripe Session] Order payment_id link notice:", e.message);
        }
      }

      return NextResponse.json({
        id: session.id,
        url: session.url,
      });
    }

    // 2. Fallback to existing Wall Bed King OnRender Stripe microservice
    const response = await fetch("https://stripe-uk.onrender.com/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://www.wallbedking.co.uk",
        Referer: "https://www.wallbedking.co.uk/cart",
      },
      body: JSON.stringify({
        line_items,
        success_url:
          success_url ||
          `https://www.wallbedking.co.uk/thanks?session_id={CHECKOUT_SESSION_ID}&order_id=${encodeURIComponent(
            referenceId
          )}`,
        cancel_url: cancel_url || "https://www.wallbedking.co.uk/cart",
        cartId: referenceId,
        collect_phone: true,
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      console.error("Stripe microservice response error:", data);
      return NextResponse.json(
        { error: data.error || `Payment gateway responded with status ${response.status}` },
        { status: response.status || 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Internal Stripe route error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error connecting to payment gateway" },
      { status: 500 }
    );
  }
}
