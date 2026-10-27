import { NextResponse } from "next/server";
import {
  getAllCheckoutSettings,
  getAllCheckoutSettingsWithMeta,
  saveCheckoutSettings,
  syncLocalSettingsToSupabase,
} from "@/lib/checkout-settings";

export const dynamic = "force-dynamic";

const noCacheHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

/**
 * GET /api/admin/checkout-settings
 * Returns all shipping and payment configurations across all markets with Supabase status
 */
export async function GET() {
  try {
    const { settings, fromSupabase, dbTableMissing, supabaseCount } =
      await getAllCheckoutSettingsWithMeta();

    return NextResponse.json(
      {
        success: true,
        settings,
        fromSupabase,
        dbTableMissing,
        supabaseCount,
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
 * Updates shipping and payment settings in Supabase public.checkout_settings table
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

    // Special action: force sync local defaults to Supabase
    if (body.action === "sync_to_supabase") {
      const result = await syncLocalSettingsToSupabase();
      return NextResponse.json(
        {
          success: result.success,
          savedToSupabase: result.savedToSupabase,
          dbTableMissing: result.dbTableMissing,
          message: result.savedToSupabase
            ? "Successfully synced all market configurations to Supabase."
            : result.dbTableMissing
            ? "Table 'public.checkout_settings' does not exist in Supabase yet. Please run supabase/checkout_settings.sql."
            : result.error || "Failed to sync to Supabase.",
        },
        { headers: noCacheHeaders }
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

    const saveResult = await saveCheckoutSettings(newSettings);

    const message = saveResult.savedToSupabase
      ? "Shipping & payment settings successfully saved to Supabase database!"
      : saveResult.dbTableMissing
      ? "Saved locally, but 'public.checkout_settings' table was not found in Supabase. Run supabase/checkout_settings.sql to persist in DB."
      : "Settings saved locally.";

    return NextResponse.json(
      {
        success: saveResult.success,
        savedToSupabase: saveResult.savedToSupabase,
        savedLocal: saveResult.savedLocal,
        dbTableMissing: saveResult.dbTableMissing,
        message,
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
