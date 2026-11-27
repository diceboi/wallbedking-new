#!/usr/bin/env node
/**
 * Ready-to-run publisher for Sileopod Acoustic Pods & Moonchair.
 * DO NOT run until you are ready to make them live in Supabase!
 *
 * Usage:
 *   node scripts/publish-specialty-to-supabase.mjs
 */
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const envPath = path.resolve(process.cwd(), ".env.local");
const env = fs
  .readFileSync(envPath, "utf8")
  .split("\n")
  .reduce((acc, line) => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) acc[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
    return acc;
  }, {});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

const specialty = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), "src/data/specialty-catalog.json"), "utf8")
);

const ALLOWED_PRODUCT_COLS = [
  "id", "ean", "name", "slug", "width", "length", "height", "orientation", "type",
  "color", "weight", "stock", "package_dimensions", "price_gbp", "price_euro", "price_usd",
  "category", "parent_category", "sub_category", "visibility", "description", "image",
  "hover_image", "product_images", "product_image_alt", "meta_title", "meta_description",
  "sku", "tags", "available_locales",
  "name_en", "name_us", "name_de", "name_fr", "name_es", "name_por", "name_pt", "name_it",
  "description_en", "description_us", "description_de", "description_fr", "description_es",
  "description_por", "description_pt", "description_it",
  "extended_description_en", "extended_description_us", "extended_description_de",
  "extended_description_fr", "extended_description_es", "extended_description_por",
  "extended_description_pt", "extended_description_it",
  "size_us", "is_unlisted",
];

async function main() {
  const nowIso = new Date().toISOString();

  // 1. Upsert products (UI1-XL stays visibility='Hidden'; all others Visible)
  const rows = specialty.variants.map((v) => {
    const row = { updated_at: nowIso };
    for (const k of ALLOWED_PRODUCT_COLS) {
      if (v[k] !== undefined) row[k] = v[k];
    }
    row.is_unlisted = false;
    return row;
  });

  const { error: prodErr } = await supabase
    .from("products")
    .upsert(rows, { onConflict: "id" });
  if (prodErr) throw new Error(`Products upsert failed: ${prodErr.message}`);
  console.log(`Upserted ${rows.length} specialty products into Supabase.`);

  // 2. Upsert categories
  const { error: catErr } = await supabase.from("categories").upsert(
    [
      { id: "acoustic-booths", slug: "acoustic-booths", name: "Acoustic Pods", is_visible: true },
      { id: "moonchair", slug: "moonchair", name: "Moonchair", is_visible: true },
    ],
    { onConflict: "id" }
  );
  if (catErr) console.warn("Categories upsert notice:", catErr.message);
  else console.log("Upserted categories: acoustic-booths, moonchair");

  // 3. Upsert navigation menu items (Moonchair links directly to product page!)
  const { error: navErr } = await supabase.from("navigation_menu").upsert(
    [
      {
        id: "acousticBooths",
        title: "Acoustic Pods",
        type: "category",
        category_id: "acoustic-booths",
        slug: "acoustic-booths",
        href: "/products/acoustic-booths",
        order_index: 5,
        is_visible: true,
        has_submenu: true,
        badge: "",
        available_locales: ["en", "us", "de", "fr", "es", "por", "it"],
      },
      {
        id: "moonchair",
        title: "Moonchair",
        type: "category",
        category_id: "moonchair",
        slug: "moonchair",
        href: "/products/moonchair/moonchair-bluetooth-lounge-chair",
        order_index: 6,
        is_visible: true,
        has_submenu: false,
        badge: "",
        available_locales: ["en", "us", "de", "fr", "es", "por", "it"],
      },
    ],
    { onConflict: "id" }
  );
  if (navErr) console.warn("Navigation menu upsert notice:", navErr.message);
  else console.log("Upserted navigation_menu: Acoustic Pods & Moonchair");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
