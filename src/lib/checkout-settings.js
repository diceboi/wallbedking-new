import fs from "fs";
import path from "path";
import { supabaseAdmin } from "./supabase";

const SETTINGS_FILE = path.join(
  process.cwd(),
  "src",
  "data",
  "shipping_payment_settings.json"
);

/**
 * Read local JSON settings file
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
 * Get all checkout settings for all locales
 * Attempts to read from Supabase if table exists, otherwise returns local file
 */
export async function getAllCheckoutSettings() {
  let settings = getLocalCheckoutSettings();

  // Try fetching from Supabase table "checkout_settings"
  try {
    const { data, error } = await supabaseAdmin
      .from("checkout_settings")
      .select("*");

    if (!error && data && data.length > 0) {
      data.forEach((row) => {
        if (row.locale && row.config) {
          settings[row.locale] = {
            ...settings[row.locale],
            ...row.config,
            locale: row.locale,
          };
        }
      });
    }
  } catch (e) {
    // Supabase table might not exist yet, perfectly fine to use local file
  }

  return settings;
}

/**
 * Get checkout settings for a specific locale
 */
export async function getCheckoutSettingsForLocale(locale = "en") {
  const normLocale = (locale || "en").toLowerCase();
  const allSettings = await getAllCheckoutSettings();

  if (allSettings[normLocale]) {
    return allSettings[normLocale];
  }

  // Fallback to UK or first available
  return allSettings.en || Object.values(allSettings)[0] || null;
}

/**
 * Save settings for all or a specific locale
 */
export async function saveCheckoutSettings(updatedSettings) {
  // 1. Save locally or in serverless /tmp
  saveLocalCheckoutSettings(updatedSettings);

  // 2. Best-effort sync to Supabase only if table exists
  try {
    const { error: testErr } = await supabaseAdmin
      .from("checkout_settings")
      .select("locale")
      .limit(1);

    if (!testErr) {
      await Promise.allSettled(
        Object.entries(updatedSettings).map(([locale, config]) =>
          supabaseAdmin.from("checkout_settings").upsert(
            {
              locale,
              config,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "locale" }
          )
        )
      );
    }
  } catch (err) {
    console.warn("[checkout-settings] Supabase table sync:", err.message);
  }

  return true;
}

