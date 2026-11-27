import { NextResponse } from "next/server";
import {
  getAllCoupons,
  saveAllCoupons,
  sanitizeCouponPayload,
  normalizeCouponCode,
  computeCouponsAnalytics,
  addAffiliatePayoutRecord,
} from "@/lib/coupons-server";

export const dynamic = "force-dynamic";

const noCacheHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function GET() {
  try {
    const coupons = await getAllCoupons();
    const analytics = await computeCouponsAnalytics(coupons);
    return NextResponse.json(
      {
        success: true,
        coupons,
        analytics,
      },
      { headers: noCacheHeaders }
    );
  } catch (err) {
    console.error("[api/admin/coupons GET] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load coupons" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    // Optional action: record a commission payout to an influencer
    if (body?.action === "record_payout") {
      const payouts = await addAffiliatePayoutRecord(body.code, {
        amount: body.amount,
        currency: body.currency,
        note: body.note,
      });
      const coupons = await getAllCoupons();
      const analytics = await computeCouponsAnalytics(coupons);
      return NextResponse.json({ success: true, payouts, coupons, analytics });
    }

    const couponInput = body?.coupon || body;
    const coupons = await getAllCoupons();
    const existingIdx = couponInput?.id
      ? coupons.findIndex((c) => c.id === couponInput.id)
      : -1;
    const existing = existingIdx >= 0 ? coupons[existingIdx] : null;
    const sanitized = sanitizeCouponPayload(couponInput, existing);

    // Ensure unique coupon code
    const duplicate = coupons.find(
      (c) =>
        normalizeCouponCode(c.code) === sanitized.code &&
        c.id !== sanitized.id
    );
    if (duplicate) {
      return NextResponse.json(
        { success: false, error: `Coupon code "${sanitized.code}" already exists.` },
        { status: 400 }
      );
    }

    const updated = [...coupons];
    if (existingIdx >= 0) {
      updated[existingIdx] = sanitized;
    } else {
      updated.unshift(sanitized);
    }

    await saveAllCoupons(updated);
    const analytics = await computeCouponsAnalytics(updated);

    return NextResponse.json({
      success: true,
      coupon: sanitized,
      coupons: updated,
      analytics,
    });
  } catch (err) {
    console.error("[api/admin/coupons POST] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to save coupon" },
      { status: 400 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing coupon id" }, { status: 400 });
    }

    const coupons = await getAllCoupons();
    const filtered = coupons.filter((c) => c.id !== id);
    await saveAllCoupons(filtered);
    const analytics = await computeCouponsAnalytics(filtered);

    return NextResponse.json({
      success: true,
      coupons: filtered,
      analytics,
    });
  } catch (err) {
    console.error("[api/admin/coupons DELETE] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete coupon" },
      { status: 500 }
    );
  }
}
