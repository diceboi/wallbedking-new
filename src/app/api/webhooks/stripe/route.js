import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase";
import {
  getConfiguredStripeClients,
  normalizeStripeSession,
  retrieveStripeCheckoutSession,
  fulfillPaidStripeSession,
} from "@/lib/stripe-fulfillment";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const stripeClients = getConfiguredStripeClients("en");
  if (stripeClients.length === 0) {
    return NextResponse.json(
      { error: "Stripe is not configured on this server." },
      { status: 500 }
    );
  }

  const webhookSecrets = [
    process.env.STRIPE_WEBHOOK_SECRET,
    process.env.STRIPE_WEBHOOK_SECRET_UK,
    process.env.STRIPE_WEBHOOK_SECRET_EU,
    process.env.STRIPE_WEBHOOK_SECRET_INTL,
  ]
    .map((s) => (s || "").trim())
    .filter(Boolean);

  const sig = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  let event = null;
  let signatureVerified = false;

  // 1. Primary gate: Cryptographic HMAC signature verification with webhook signing secret(s)
  if (webhookSecrets.length > 0 && sig) {
    const verifierStripe = stripeClients[0].stripe || new Stripe(stripeClients[0].secretKey);
    let lastErr = null;

    for (const secret of webhookSecrets) {
      try {
        event = verifierStripe.webhooks.constructEvent(rawBody, sig, secret);
        signatureVerified = true;
        break;
      } catch (e) {
        lastErr = e;
      }
    }

    if (!signatureVerified) {
      console.warn(
        `[Stripe Webhook] Signature mismatch across ${webhookSecrets.length} configured secret(s): ${lastErr?.message || "unknown"} — falling back to direct Stripe API verification.`
      );
    }
  }

  // 2. Zero-trust fallback if webhook secret is not yet set in deployment environment:
  // NEVER trust unverified JSON directly — parse only the session ID and re-fetch directly from Stripe API!
  if (!event) {
    try {
      const parsed = JSON.parse(rawBody);
      if (!parsed || typeof parsed !== "object" || !parsed.type) {
        return NextResponse.json({ received: true, ignored: true });
      }
      event = parsed;
    } catch (parseErr) {
      return NextResponse.json(
        { error: `Invalid webhook payload: ${parseErr.message}` },
        { status: 400 }
      );
    }
  }

  const eventType = event.type;
  const rawSession = event?.data?.object;

  if (
    eventType === "checkout.session.completed" ||
    eventType === "checkout.session.async_payment_succeeded"
  ) {
    const sessionId = rawSession?.id || "";
    const orderId =
      rawSession?.metadata?.order_id || rawSession?.client_reference_id || "";
    const preferredLocale = rawSession?.metadata?.locale || "en";

    // If HMAC signature was verified, we can normalize directly (or enrich from Stripe);
    // if HMAC secret wasn't configured yet, we MUST retrieve directly from Stripe API over TLS!
    let verifiedSessionData = null;
    if (signatureVerified && rawSession?.id && rawSession?.payment_status === "paid") {
      verifiedSessionData = normalizeStripeSession(
        rawSession,
        rawSession?.metadata?.company_entity || null
      );
    } else {
      verifiedSessionData = await retrieveStripeCheckoutSession({
        sessionId,
        orderId,
        preferredLocale,
      });
    }

    if (!verifiedSessionData) {
      console.error(
        `[Stripe Webhook] Rejected unverified session ${sessionId} (Order: ${orderId || "N/A"})`
      );
      return NextResponse.json(
        { error: "Session could not be verified with Stripe." },
        { status: 400 }
      );
    }

    const fulfillment = await fulfillPaidStripeSession({
      sessionData: verifiedSessionData,
      fallbackOrderId: orderId,
      fallbackCartId: rawSession?.metadata?.cart_id || "",
      fallbackLocale: preferredLocale,
      source: `webhook:${eventType}`,
    });

    console.log(
      `[Stripe Webhook] Processed ${eventType} for Order ${fulfillment.order?.id || orderId}: paid=${fulfillment.success}, newlyPaid=${Boolean(fulfillment.newlyPaid)}`
    );

    return NextResponse.json({
      received: true,
      orderId: fulfillment.order?.id || orderId,
      paid: fulfillment.success,
      newlyPaid: Boolean(fulfillment.newlyPaid),
    });
  }

  if (eventType === "checkout.session.async_payment_failed") {
    const orderId =
      rawSession?.metadata?.order_id || rawSession?.client_reference_id || "";
    console.warn(`[Stripe Webhook] Async payment failed for Order ${orderId || "N/A"}`);

    if (signatureVerified && supabaseAdmin && orderId) {
      try {
        const { data: ord } = await supabaseAdmin
          .from("orders")
          .select("id, payment_status, admin_notes")
          .eq("id", orderId)
          .maybeSingle();

        if (ord && ord.payment_status !== "paid") {
          await supabaseAdmin
            .from("orders")
            .update({
              payment_status: "failed",
              admin_notes: `${ord.admin_notes || ""} [Stripe Async Payment Failed]`.trim(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", orderId);
        }
      } catch (err) {
        console.warn("[Stripe Webhook] Failed payment status update notice:", err.message);
      }
    }
  }

  return NextResponse.json({ received: true });
}
