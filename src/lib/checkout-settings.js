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
 * Write to local JSON settings file
 */
export function saveLocalCheckoutSettings(settings) {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("[checkout-settings] Error saving local settings file:", err);
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
  // 1. Save locally first to guarantee persistence
  saveLocalCheckoutSettings(updatedSettings);

  // 2. Best-effort sync to Supabase if table exists
  try {
    const entries = Object.entries(updatedSettings);
    for (const [locale, config] of entries) {
      await supabaseAdmin.from("checkout_settings").upsert(
        {
          locale,
          config,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "locale" }
      );
    }
  } catch (err) {
    // If Supabase table isn't created, local file already saved the data successfully
  }

  return true;
}
