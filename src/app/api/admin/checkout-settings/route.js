import { NextResponse } from "next/server";
import {
  getAllCheckoutSettings,
  saveCheckoutSettings,
} from "@/lib/checkout-settings";

export const dynamic = "force-dynamic";

const noCacheHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

/**
 * GET /api/admin/checkout-settings
 * Returns all shipping and payment configurations across all markets
 */
export async function GET() {
  try {
    const settings = await getAllCheckoutSettings();
    return NextResponse.json(
      {
        success: true,
        settings,
      },
      { headers: noCacheHeaders }
    );
  } catch (error) {
    console.error("[api/admin/checkout-settings] GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: noCacheHeaders }
    );
  }
}

/**
 * POST /api/admin/checkout-settings
 * Updates shipping and payment settings across markets
 */
export async function POST(req) {
  try {
    const body = await req.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid payload" },
        { status: 400, headers: noCacheHeaders }
      );
    }

    // Support single market update or whole object update
    let newSettings;
    if (body.locale && body.config) {
      const current = await getAllCheckoutSettings();
      current[body.locale] = {
        ...current[body.locale],
        ...body.config,
      };
      newSettings = current;
    } else if (body.settings) {
      newSettings = body.settings;
    } else {
      newSettings = body;
    }

    await saveCheckoutSettings(newSettings);

    return NextResponse.json(
      {
        success: true,
        message: "Shipping and payment settings saved successfully.",
        settings: newSettings,
      },
      { headers: noCacheHeaders }
    );
  } catch (error) {
    console.error("[api/admin/checkout-settings] POST error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: noCacheHeaders }
    );
  }
}
