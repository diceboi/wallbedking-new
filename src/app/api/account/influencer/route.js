import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAllCoupons, computeCouponsAnalytics } from "@/lib/coupons-server";

export const dynamic = "force-dynamic";

/**
 * GET /api/account/influencer
 * Authenticated endpoint for an influencer partner to inspect their own codes,
 * affiliate links, clicks, conversion rate, attributed orders, and commissions.
 */
export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!token || !supabaseAdmin) {
      return NextResponse.json({ success: true, isInfluencer: false, campaigns: [] });
    }

    const { data: userRes, error: authErr } = await supabaseAdmin.auth.getUser(token);
    if (authErr || !userRes?.user?.email) {
      return NextResponse.json({ success: true, isInfluencer: false, campaigns: [] });
    }

    const userEmail = String(userRes.user.email).trim().toLowerCase();
    const allCoupons = await getAllCoupons();

    // Match all coupons assigned to this influencer's email
    const myCoupons = allCoupons.filter(
      (c) =>
        c.is_influencer &&
        String(c.influencer_email || "").trim().toLowerCase() === userEmail
    );

    if (myCoupons.length === 0) {
      return NextResponse.json({ success: true, isInfluencer: false, campaigns: [] });
    }

    const analytics = await computeCouponsAnalytics(myCoupons);

    const campaigns = myCoupons.map((c) => ({
      id: c.id,
      code: c.code,
      active: c.active,
      discount_type: c.discount_type,
      discount_value: c.discount_value,
      fixed_amounts: c.fixed_amounts,
      target_markets: c.target_markets,
      commission_percent: c.commission_percent,
      cookie_days: c.cookie_days,
      influencer_name: c.influencer_name,
      influencer_handle: c.influencer_handle,
      influencer_avatar: c.influencer_avatar,
      influencer_message: c.influencer_message,
      start_date: c.start_date,
      end_date: c.end_date,
      stats: analytics[c.code] || {
        clicks: 0,
        ordersCount: 0,
        paidOrdersCount: 0,
        conversionRate: 0,
        revenueByCurrency: {},
        commissionByCurrency: {},
        payableCommissionByCurrency: {},
        pendingCommissionByCurrency: {},
        paidOutByCurrency: {},
        payouts: [],
        recentOrders: [],
      },
    }));

    return NextResponse.json({
      success: true,
      isInfluencer: true,
      email: userEmail,
      campaigns,
    });
  } catch (err) {
    console.error("[api/account/influencer] Error:", err);
    return NextResponse.json(
      { success: false, isInfluencer: false, error: "Failed to load influencer data" },
      { status: 500 }
    );
  }
}
