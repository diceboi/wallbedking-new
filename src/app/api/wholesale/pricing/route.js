import { NextResponse } from "next/server";
import {
  resolveWholesaleUserFromRequest,
  getWholesaleProductPricesMap,
  getWholesaleCheckoutSettings,
  computeWholesaleProductPricing,
} from "@/lib/wholesale-server";

export const dynamic = "force-dynamic";

const noCacheHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

/**
 * GET /api/wholesale/pricing?locale=fr
 * Protected B2B pricing endpoint:
 * - Unauthenticated or regular retail customers receive ZERO wholesale prices.
 * - Approved wholesale partners and admins receive net prices (excl. VAT)
 *   computed for their market & partner tier (with HK USD fallback).
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const reqLocale = searchParams.get("locale") || "en";

    const [authState, rawPricesMap, paymentSettings] = await Promise.all([
      resolveWholesaleUserFromRequest(request, reqLocale),
      getWholesaleProductPricesMap(),
      getWholesaleCheckoutSettings(),
    ]);

    const hiddenProductIds = Object.entries(rawPricesMap)
      .filter(([, rec]) => rec?.wholesale_visible === false)
      .map(([id]) => Number(id) || id);

    if (!authState.isWholesale || !authState.partner) {
      return NextResponse.json(
        {
          success: true,
          authenticated: authState.authenticated,
          authorized: false,
          partner: null,
          prices: {},
          hiddenProductIds,
          paymentSettings: null,
        },
        { headers: noCacheHeaders }
      );
    }

    const computedPrices = {};
    for (const [id, rec] of Object.entries(rawPricesMap)) {
      const computed = computeWholesaleProductPricing(rec, authState.partner);
      if (computed && computed.wholesaleVisible !== false) {
        computedPrices[id] = computed;
      }
    }

    return NextResponse.json(
      {
        success: true,
        authenticated: true,
        authorized: true,
        isAdmin: authState.isAdmin,
        partner: authState.partner,
        prices: computedPrices,
        hiddenProductIds,
        paymentSettings,
      },
      { headers: noCacheHeaders }
    );
  } catch (err) {
    console.error("[api/wholesale/pricing] GET error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load wholesale pricing" },
      { status: 500, headers: noCacheHeaders }
    );
  }
}
