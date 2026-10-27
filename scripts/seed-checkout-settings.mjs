import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Load .env.local
const envPath = path.join(rootDir, ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx > -1) {
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      process.env[key] = val;
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  const settingsPath = path.join(
    rootDir,
    "src",
    "data",
    "shipping_payment_settings.json"
  );
  if (!fs.existsSync(settingsPath)) {
    console.error("Local settings file not found:", settingsPath);
    process.exit(1);
  }

  const settings = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
  console.log("Found local configurations for locales:", Object.keys(settings));

  // Test if table exists
  const { error: testErr } = await supabase
    .from("checkout_settings")
    .select("locale")
    .limit(1);

  if (testErr) {
    console.error(
      "\n❌ Table 'public.checkout_settings' does not exist in your Supabase database."
    );
    console.log(
      "👉 Please open your Supabase SQL Editor and run the script in: supabase/checkout_settings.sql\n"
    );
    process.exit(1);
  }

  console.log("Connected to Supabase. Seeding checkout_settings...");

  for (const [locale, config] of Object.entries(settings)) {
    const { error } = await supabase.from("checkout_settings").upsert(
      {
        locale,
        config,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "locale" }
    );

    if (error) {
      console.error(`❌ Failed to upsert [${locale}]:`, error.message);
    } else {
      console.log(`✅ Seeded [${locale}] (${config.countryName})`);
    }
  }

  console.log("\n🎉 All checkout settings successfully synced to Supabase!");
}

seed().catch((err) => {
  console.error("Error during seed:", err);
  process.exit(1);
});
