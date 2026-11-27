import { NextResponse } from "next/server";
import {
  findCouponByCode,
  recordAffiliateClick,
  toPublicCouponInfo,
} from "@/lib/coupons-server";

export const dynamic = "force-dynamic";

/**
 * POST /api/affiliate/track
 * Records an affiliate link visit (?ref=CODE) and returns safe public influencer offer details
 * (name, avatar, discount label, cookie duration, auto-apply flag).
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      code = "",
      locale = "en",
      currency = "GBP",
      landingPath = "",
      skipClickIncrement = false,
    } = body || {};

    const coupon = await findCouponByCode(code);
    if (!coupon || !coupon.active) {
      return NextResponse.json({ success: true, found: false, offer: null });
    }

    // Check date window
    const now = Date.now();
    if (coupon.start_date && now < new Date(coupon.start_date).getTime()) {
      return NextResponse.json({ success: true, found: false, offer: null });
    }
    if (coupon.end_date && now > new Date(coupon.end_date).getTime()) {
      return NextResponse.json({ success: true, found: false, offer: null });
    }

    // Check market restriction
    const normLocale = String(locale || "en").toLowerCase();
    if (
      Array.isArray(coupon.target_markets) &&
      coupon.target_markets.length > 0 &&
      !coupon.target_markets.includes(normLocale)
    ) {
      return NextResponse.json({ success: true, found: false, offer: null });
    }

    if (!skipClickIncrement) {
      try {
        await recordAffiliateClick(coupon.code, { locale: normLocale, landingPath });
      } catch (clickErr) {
        console.warn("[api/affiliate/track] Click log notice:", clickErr?.message);
      }
    }

    const curr = (currency || (normLocale === "us" ? "USD" : normLocale === "en" ? "GBP" : "EUR")).toUpperCase();
    const offer = toPublicCouponInfo(coupon, curr);

    return NextResponse.json({
      success: true,
      found: true,
      offer,
    });
  } catch (err) {
    console.error("[api/affiliate/track] Error:", err);
    return NextResponse.json(
      { success: false, found: false, error: "Tracking error" },
      { status: 500 }
    );
  }
}
