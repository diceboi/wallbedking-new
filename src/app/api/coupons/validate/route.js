import { NextResponse } from "next/server";
import { evaluateCouponServer } from "@/lib/coupons-server";
import { validateOrderTotals } from "@/lib/orders";

export const dynamic = "force-dynamic";

/**
 * POST /api/coupons/validate
 * Server-side coupon validation (never exposes the full list of secret coupons to the browser).
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      code = "",
      items = [],
      currency = "GBP",
      locale = "en",
      deliveryOption = "delivery_option_economy",
      customerEmail = "",
    } = body || {};

    if (!code || !String(code).trim()) {
      return NextResponse.json(
        { success: false, valid: false, error: "Please enter a discount code." },
        { status: 400 }
      );
    }

    // If cart has items, validate through authoritative validateOrderTotals so sale-item flags & prices are 100% accurate
    if (Array.isArray(items) && items.length > 0) {
      const calc = await validateOrderTotals(
        items,
        deliveryOption,
        code,
        currency,
        locale,
        customerEmail
      );

      if (!calc.couponResult?.valid) {
        return NextResponse.json({
          success: true,
          valid: false,
          error: calc.couponResult?.error || "Invalid or expired discount code.",
        });
      }

      return NextResponse.json({
        success: true,
        valid: true,
        coupon: calc.couponResult.publicInfo,
        couponDiscountAmount: calc.couponDiscountAmount,
        deliveryDiscountAmount: calc.deliveryDiscountAmount,
        discountAmount: calc.discountAmount,
        subtotal: calc.subtotal,
        totalAmount: calc.totalAmount,
      });
    }

    // Empty cart pre-validation (e.g., landing via ?ref=ANNA10 before adding items)
    const evalRes = await evaluateCouponServer({
      rawCode: code,
      items: [],
      subtotal: 0,
      currency,
      locale,
      customerEmail,
    });

    if (!evalRes.valid) {
      return NextResponse.json({
        success: true,
        valid: false,
        error: evalRes.error || "Invalid or expired discount code.",
      });
    }

    return NextResponse.json({
      success: true,
      valid: true,
      coupon: evalRes.publicInfo,
      couponDiscountAmount: 0,
      discountAmount: 0,
    });
  } catch (err) {
    console.error("[api/coupons/validate] Error:", err);
    return NextResponse.json(
      { success: false, valid: false, error: "Failed to validate discount code." },
      { status: 500 }
    );
  }
}
