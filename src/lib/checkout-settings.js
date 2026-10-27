import fs from "fs";
import path from "path";
import { supabaseAdmin } from "./supabase.js";

const SETTINGS_FILE = path.join(
  process.cwd(),
  "src",
  "data",
  "shipping_payment_settings.json"
);

/**
 * Read local JSON settings file with /tmp fallback
 */
export function getLocalCheckoutSettings() {
  try {
    const tmpPath = path.join("/tmp", "shipping_payment_settings.json");
    if (fs.existsSync(tmpPath)) {
      const raw = fs.readFileSync(tmpPath, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    // /tmp might not exist on Windows local, perfectly normal
  }

  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const raw = fs.readFileSync(SETTINGS_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("[checkout-settings] Error reading local settings file:", err);
  }
  return {};
}

/**
 * Write to local JSON settings file with /tmp serverless fallback
 */
export function saveLocalCheckoutSettings(settings) {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.warn("[checkout-settings] Read-only filesystem, caching in /tmp:", err.message);
    try {
      const tmpPath = path.join("/tmp", "shipping_payment_settings.json");
      fs.writeFileSync(tmpPath, JSON.stringify(settings, null, 2), "utf-8");
      return true;
    } catch (tmpErr) {
      console.warn("[checkout-settings] Cannot write to /tmp:", tmpErr.message);
    }
    return false;
  }
}

/**
 * Get all checkout settings with database connection metadata
 */
export async function getAllCheckoutSettingsWithMeta() {
  const localSettings = getLocalCheckoutSettings();
  let settings = { ...localSettings };
  let fromSupabase = false;
  let dbTableMissing = false;
  let supabaseCount = 0;
  let errorMsg = null;

  try {
    const { data, error } = await supabaseAdmin
      .from("checkout_settings")
      .select("*");

    if (error) {
      if (error.code === "PGRST205" || error.message?.includes("not find")) {
        dbTableMissing = true;
      }
      errorMsg = error.message;
      console.warn("[checkout-settings] Supabase table query notice:", error.message);
    } else if (Array.isArray(data) && data.length > 0) {
      fromSupabase = true;
      supabaseCount = data.length;
      data.forEach((row) => {
        if (row.locale && row.config) {
          settings[row.locale] = {
            ...settings[row.locale],
            ...row.config,
            locale: row.locale,
          };
        }
      });
    } else {
      // Table exists but is empty
      fromSupabase = false;
    }
  } catch (err) {
    dbTableMissing = true;
    errorMsg = err.message;
    console.warn("[checkout-settings] Supabase error:", err.message);
  }

  return {
    settings,
    fromSupabase,
    dbTableMissing,
    supabaseCount,
    errorMsg,
  };
}

/**
 * Get all checkout settings for all locales
 * Primarily loads from Supabase public.checkout_settings, fallback to local JSON
 */
export async function getAllCheckoutSettings() {
  const { settings } = await getAllCheckoutSettingsWithMeta();
  return settings;
}

/**
 * Get checkout settings for a specific locale
 */
export async function getCheckoutSettingsForLocale(locale = "en") {
  const normLocale = (locale || "en").toLowerCase();
  const { settings, fromSupabase } = await getAllCheckoutSettingsWithMeta();

  const config =
    settings[normLocale] ||
    settings.en ||
    Object.values(settings)[0] ||
    null;

  return { config, fromSupabase };
}

/**
 * Save settings for all or a specific locale
 * Primarily syncs to Supabase, also writes to local/tmp fallback
 */
export async function saveCheckoutSettings(updatedSettings) {
  // 1. Save locally or in serverless /tmp
  const savedLocal = saveLocalCheckoutSettings(updatedSettings);

  // 2. Save directly to Supabase checkout_settings table
  let savedToSupabase = false;
  let dbTableMissing = false;
  let supabaseError = null;

  try {
    const upsertRows = Object.entries(updatedSettings).map(([locale, config]) => ({
      locale,
      config,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabaseAdmin
      .from("checkout_settings")
      .upsert(upsertRows, { onConflict: "locale" });

    if (error) {
      if (error.code === "PGRST205" || error.message?.includes("not find")) {
        dbTableMissing = true;
      }
      supabaseError = error.message;
      console.warn("[checkout-settings] Supabase table sync failed:", error.message);
    } else {
      savedToSupabase = true;
    }
  } catch (err) {
    supabaseError = err.message;
    dbTableMissing = true;
    console.warn("[checkout-settings] Supabase table sync exception:", err.message);
  }

  return {
    success: savedToSupabase || savedLocal,
    savedToSupabase,
    savedLocal,
    dbTableMissing,
    error: supabaseError,
  };
}

/**
 * Sync initial local settings file into Supabase checkout_settings table
 */
export async function syncLocalSettingsToSupabase() {
  const localSettings = getLocalCheckoutSettings();
  return await saveCheckoutSettings(localSettings);
}
