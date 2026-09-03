import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const LOCALES = ["en", "us", "de", "fr", "es", "por", "it"];

function getDictionariesPath() {
  return path.join(process.cwd(), "src/data/dictionaries");
}

function loadLocalDictionaries() {
  const dir = getDictionariesPath();
  const result = {};
  for (const loc of LOCALES) {
    const filePath = path.join(dir, `${loc}.json`);
    if (fs.existsSync(filePath)) {
      result[loc] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } else {
      result[loc] = {};
    }
  }
  return result;
}

// Flatten nested JSON object into dot-notated keys (e.g. "nav.beds": "Murphy Beds")
function flattenObject(obj, prefix = "") {
  let flattened = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(flattened, flattenObject(value, fullKey));
    } else {
      flattened[fullKey] = String(value);
    }
  }
  return flattened;
}

// Rebuild nested JSON object from dot-notated keys
function unflattenObject(flattened) {
  const result = {};
  for (const [key, value] of Object.entries(flattened)) {
    const parts = key.split(".");
    let current = result;
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i];
      if (!current[p] || typeof current[p] !== "object") {
        current[p] = {};
      }
      current = current[p];
    }
    current[parts[parts.length - 1]] = value;
  }
  return result;
}

export async function GET(request) {
  try {
    const dicts = loadLocalDictionaries();
    const flattenedByLocale = {};
    const allKeysSet = new Set();

    for (const loc of LOCALES) {
      flattenedByLocale[loc] = flattenObject(dicts[loc] || {});
      Object.keys(flattenedByLocale[loc]).forEach((k) => allKeysSet.add(k));
    }

    const rows = Array.from(allKeysSet).map((key) => {
      const category = key.includes(".") ? key.split(".")[0] : "common";
      return {
        key,
        category,
        en: flattenedByLocale.en?.[key] || "",
        us: flattenedByLocale.us?.[key] || "",
        de: flattenedByLocale.de?.[key] || "",
        fr: flattenedByLocale.fr?.[key] || "",
        es: flattenedByLocale.es?.[key] || "",
        por: flattenedByLocale.por?.[key] || "",
        it: flattenedByLocale.it?.[key] || "",
      };
    });

    return NextResponse.json({
      success: true,
      locales: LOCALES,
      count: rows.length,
      rows,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { rows } = body;

    if (!Array.isArray(rows)) {
      return NextResponse.json(
        { success: false, error: "Invalid payload format: rows must be an array" },
        { status: 400 }
      );
    }

    const dir = getDictionariesPath();

    // Reconstruct dictionaries for each locale
    for (const loc of LOCALES) {
      const flatDict = {};
      for (const row of rows) {
        if (row.key && row[loc] !== undefined) {
          flatDict[row.key] = row[loc];
        }
      }

      const unflattened = unflattenObject(flatDict);
      const filePath = path.join(dir, `${loc}.json`);
      fs.writeFileSync(filePath, JSON.stringify(unflattened, null, 2), "utf-8");
    }

    // Also attempt to upsert to Supabase translations table if service role key is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    let supabaseUpdated = false;
    if (supabaseUrl && serviceKey) {
      try {
        const patchRes = await fetch(`${supabaseUrl}/rest/v1/translations`, {
          method: "POST",
          headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
            "Content-Type": "application/json",
            Prefer: "resolution=merge-duplicates",
          },
          body: JSON.stringify(rows),
        });
        if (patchRes.ok) supabaseUpdated = true;
      } catch (sbErr) {
        // Fallback gracefully if table not created yet
      }
    }

    return NextResponse.json({
      success: true,
      message: "Translations saved successfully to local dictionaries.",
      supabaseSynced: supabaseUpdated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
