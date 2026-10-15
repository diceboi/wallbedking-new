import { NextResponse } from "next/server";
import {
  getCheckoutSettingsForLocale,
  getAllCheckoutSettings,
} from "@/lib/checkout-settings";

export const dynamic = "force-dynamic";

/**
 * GET /api/checkout/settings?locale=por
 * Returns shipping & payment configuration for a given locale (or all if not specified)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get("locale");

    const headers = {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    };

    if (locale) {
      const config = await getCheckoutSettingsForLocale(locale);
      return NextResponse.json(
        {
          success: true,
          locale,
          config,
        },
        { headers }
      );
    }

    const all = await getAllCheckoutSettings();
    return NextResponse.json(
      {
        success: true,
        settings: all,
      },
      { headers }
    );
  } catch (error) {
    console.error("[api/checkout/settings] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
