import { NextResponse } from "next/server";
import { validateOrderTotals } from "@/lib/orders";
import { getPaymentConfig } from "@/lib/payments";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      items = [],
      deliveryOption = "delivery_option_economy",
      promoCode = "",
      currency = null,
      locale = "en",
    } = body || {};

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cart is empty." },
        { status: 400 }
      );
    }

    const paymentConfig = getPaymentConfig(locale, currency);
    const targetCurrency = (currency || paymentConfig.currency).toUpperCase();

    // Recalculate everything strictly against Supabase database for the target currency
    const calculation = await validateOrderTotals(
      items,
      deliveryOption,
      promoCode,
      targetCurrency,
      locale
    );

    return NextResponse.json({
      success: true,
      currency: targetCurrency,
      ...calculation,
    });
  } catch (err) {
    console.error("[Validate Cart API] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to validate cart totals" },
      { status: 500 }
    );
  }
}
