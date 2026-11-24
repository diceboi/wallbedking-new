import { NextResponse } from "next/server";
import {
  getWholesaleTiersConfig,
  saveWholesaleTiersConfig,
  getWholesaleCheckoutSettings,
  saveWholesaleCheckoutSettings,
  syncWholesalePricesToProductsTable,
} from "@/lib/wholesale-server";

export const dynamic = "force-dynamic";

const noCacheHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function GET() {
  try {
    const [tiersConfig, paymentSettings] = await Promise.all([
      getWholesaleTiersConfig(),
      getWholesaleCheckoutSettings(),
    ]);
    return NextResponse.json(
      {
        success: true,
        tiersConfig,
        paymentSettings,
      },
      { headers: noCacheHeaders }
    );
  } catch (err) {
    console.error("[api/admin/wholesale/tiers] GET error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500, headers: noCacheHeaders }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (body?.action === "sync_products_columns") {
      const result = await syncWholesalePricesToProductsTable();
      return NextResponse.json(
        { success: !result.error, ...result },
        { headers: noCacheHeaders }
      );
    }

    let tiersConfig = null;
    let paymentSettings = null;

    if (body?.tiersConfig) {
      tiersConfig = await saveWholesaleTiersConfig(body.tiersConfig);
    }
    if (body?.paymentSettings) {
      paymentSettings = await saveWholesaleCheckoutSettings(body.paymentSettings);
    }

    return NextResponse.json(
      {
        success: true,
        tiersConfig: tiersConfig || (await getWholesaleTiersConfig()),
        paymentSettings: paymentSettings || (await getWholesaleCheckoutSettings()),
        message: "Wholesale configuration saved successfully.",
      },
      { headers: noCacheHeaders }
    );
  } catch (err) {
    console.error("[api/admin/wholesale/tiers] POST error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500, headers: noCacheHeaders }
    );
  }
}
