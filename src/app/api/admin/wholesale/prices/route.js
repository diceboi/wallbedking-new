import { NextResponse } from "next/server";
import {
  getWholesaleProductPricesMap,
  saveWholesaleProductPrice,
} from "@/lib/wholesale-server";

export const dynamic = "force-dynamic";

const noCacheHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const prices = await getWholesaleProductPricesMap();

    if (productId) {
      return NextResponse.json(
        { success: true, price: prices[String(productId)] || null },
        { headers: noCacheHeaders }
      );
    }

    return NextResponse.json(
      { success: true, count: Object.keys(prices).length, prices },
      { headers: noCacheHeaders }
    );
  } catch (err) {
    console.error("[api/admin/wholesale/prices] GET error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500, headers: noCacheHeaders }
    );
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { productId, ...fields } = body || {};
    if (!productId) {
      return NextResponse.json(
        { success: false, error: "productId is required" },
        { status: 400, headers: noCacheHeaders }
      );
    }

    const updated = await saveWholesaleProductPrice(productId, fields);
    return NextResponse.json(
      { success: true, price: updated },
      { headers: noCacheHeaders }
    );
  } catch (err) {
    console.error("[api/admin/wholesale/prices] PATCH error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500, headers: noCacheHeaders }
    );
  }
}
