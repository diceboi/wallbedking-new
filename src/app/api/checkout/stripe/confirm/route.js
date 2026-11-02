import { NextResponse } from "next/server";
import {
  retrieveStripeCheckoutSession,
  fulfillPaidStripeSession,
} from "@/lib/stripe-fulfillment";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const { session_id, order_id, cart_id, locale = "en" } = body || {};

    if (!session_id && !order_id) {
      return NextResponse.json(
        { success: false, error: "Missing session_id or order_id parameter." },
        { status: 400 }
      );
    }

    console.log(
      `[Confirm Session] Verifying Stripe session: ${session_id || "N/A"} (Order: ${order_id || "N/A"})`
    );

    const sessionData = await retrieveStripeCheckoutSession({
      sessionId: session_id,
      orderId: order_id,
      preferredLocale: locale,
    });

    if (!sessionData) {
      return NextResponse.json(
        {
          success: false,
          error: "Could not retrieve verified Stripe session details.",
        },
        { status: 404 }
      );
    }

    const clientIp =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "";
    const userAgent = request.headers.get("user-agent") || "";

    const fulfillment = await fulfillPaidStripeSession({
      sessionData,
      fallbackOrderId: order_id,
      fallbackCartId: cart_id,
      fallbackLocale: locale,
      clientIp,
      userAgent,
      source: "thanks-confirm",
    });

    if (!fulfillment.success) {
      return NextResponse.json(
        {
          success: false,
          pendingPayment: Boolean(fulfillment.pendingPayment),
          paymentStatus: fulfillment.paymentStatus || sessionData.payment_status,
          error: fulfillment.error || "Payment is not yet confirmed.",
        },
        { status: fulfillment.pendingPayment ? 202 : 400 }
      );
    }

    return NextResponse.json({
      success: true,
      order: fulfillment.order,
      emailSent: fulfillment.emailSent,
      alreadyPaid: fulfillment.alreadyPaid,
      session: {
        paymentIntent: sessionData.payment_intent || sessionData.session_id,
        amount: sessionData.amount_total,
        currency: sessionData.currency,
      },
    });
  } catch (error) {
    console.error("[Confirm Session Fatal Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
