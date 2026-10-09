import { NextResponse } from "next/server";
import { revalidateProductsCache } from "@/lib/products-db";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

const ALLOWED_SUPABASE_COLUMNS = new Set([
  "ean", "name", "slug", "width", "length", "height", "frame_width",
  "folded_up_height", "folded_up_projection", "folded_down_projection",
  "frame_distance_from_ground", "mounting_frame_height", "maximum_mattress_depth",
  "orientation", "type", "color", "weight", "stock", "package_dimensions",
  "price_gbp", "price_euro", "price_usd", "sale_percent", "sale_fix_gbp",
  "sale_fix_euro", "sale_fix_usd", "sale_price_gbp", "sale_price_euro", "sale_price_usd",
  "category", "parent_category", "sub_category", "backorder", "visibility",
  "warranty", "description", "image", "hover_image", "product_images",
  "product_image_alt", "meta_title", "meta_description", "has_3d",
  "sku", "ean_uk", "ean_us", "ean_de", "ean_fr", "ean_es", "ean_it", "ean_pt",
  "pack_1", "pack_2", "pack_3", "pack_4", "tags", "available_locales",
  "name_en", "name_us", "name_de", "name_fr", "name_es", "name_por", "name_pt", "name_it",
  "gtin_en", "gtin_us", "gtin_de", "gtin_fr", "gtin_es", "gtin_por", "gtin_pt", "gtin_it",
  "installation_manual", "installation_video"
]);

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      ids,
      action = "update",
      updates = {},
      tagAction,
      tags = [],
      localeAction,
      locales = [],
      priceAdjustment,
      stockAdjustment,
    } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "No product IDs provided." },
        { status: 400 }
      );
    }

    // Handle Bulk Delete
    if (action === "delete") {
      const idListStr = `(${ids.join(",")})`;
      const res = await fetch(`${SUPABASE_URL}/rest/v1/products?id=in.${idListStr}`, {
        method: "DELETE",
        headers,
      });

      if (!res.ok) {
        const err = await res.text();
        return NextResponse.json({ success: false, error: err }, { status: res.status });
      }

      revalidateProductsCache();

      return NextResponse.json({
        success: true,
        deletedCount: ids.length,
        message: `${ids.length} products deleted from database.`,
      });
    }

    // Fetch existing records from Supabase for target IDs
    const idListStr = `(${ids.join(",")})`;
    const fetchRes = await fetch(`${SUPABASE_URL}/rest/v1/products?id=in.${idListStr}`, {
      headers,
      cache: "no-store",
    });

    if (!fetchRes.ok) {
      const err = await fetchRes.text();
      return NextResponse.json({ success: false, error: err }, { status: fetchRes.status });
    }

    const existingProducts = await fetchRes.json();
    const updatedProducts = [];

    // Clean updates object (remove undefined or id)
    const cleanUpdates = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    }
    delete cleanUpdates.id;

    for (const existing of existingProducts) {
      let item = { ...existing, ...cleanUpdates };

      // Tag actions
      if (tagAction) {
        const currentTags = Array.isArray(item.tags) ? [...item.tags] : [];
        if (tagAction === "clear") {
          item.tags = [];
        } else if (tagAction === "replace" && Array.isArray(tags)) {
          item.tags = [...tags];
        } else if (tagAction === "add" && Array.isArray(tags)) {
          item.tags = Array.from(new Set([...currentTags, ...tags]));
        } else if (tagAction === "remove" && Array.isArray(tags)) {
          if (tags.length === 0) {
            item.tags = currentTags;
          } else {
            item.tags = currentTags.filter((t) => !tags.includes(t));
          }
        }
      }

      // Locale / Country visibility actions
      if (localeAction && Array.isArray(locales)) {
        const currentLocales = Array.isArray(item.available_locales)
          ? [...item.available_locales]
          : ["en", "us", "de", "fr", "es", "por", "it"];
        if (localeAction === "replace" || localeAction === "set") {
          item.available_locales = [...locales];
        } else if (localeAction === "add") {
          item.available_locales = Array.from(new Set([...currentLocales, ...locales]));
        } else if (localeAction === "remove") {
          item.available_locales = currentLocales.filter((l) => !locales.includes(l));
        } else if (localeAction === "all") {
          item.available_locales = ["en", "us", "de", "fr", "es", "por", "it"];
        }
      }

      // Price adjustment (% increase or decrease)
      if (priceAdjustment && priceAdjustment.type === "percent" && priceAdjustment.percent) {
        const multiplier = 1 + Number(priceAdjustment.percent) / 100;
        if (item.price_gbp) item.price_gbp = Math.round(Number(item.price_gbp) * multiplier);
        if (item.price_euro) item.price_euro = Math.round(Number(item.price_euro) * multiplier);
        if (item.price_usd) item.price_usd = Math.round(Number(item.price_usd) * multiplier);

        if (item.sale_price_gbp) item.sale_price_gbp = Math.round(Number(item.sale_price_gbp) * multiplier);
        if (item.sale_price_euro) item.sale_price_euro = Math.round(Number(item.sale_price_euro) * multiplier);
        if (item.sale_price_usd) item.sale_price_usd = Math.round(Number(item.sale_price_usd) * multiplier);
      }

      // Stock adjustment
      if (stockAdjustment) {
        if (stockAdjustment.type === "set" && stockAdjustment.amount !== undefined) {
          item.stock = Math.max(0, Number(stockAdjustment.amount));
        } else if (stockAdjustment.type === "adjust" && stockAdjustment.amount !== undefined) {
          item.stock = Math.max(0, (Number(item.stock) || 0) + Number(stockAdjustment.amount));
        }
      }

      item.updated_at = new Date().toISOString();

      // Sanitize payload for Supabase PATCH
      const payload = {};
      for (const [key, val] of Object.entries(item)) {
        if (ALLOWED_SUPABASE_COLUMNS.has(key) && val !== undefined) {
          payload[key] = val;
        }
      }
      if (item.hoverImage && !payload.hover_image) {
        payload.hover_image = item.hoverImage;
      }

      let patchRes = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${item.id}`, {
        method: "PATCH",
        headers: {
          ...headers,
          Prefer: "return=representation",
        },
        body: JSON.stringify(payload),
      });

      if (!patchRes.ok) {
        const err = await patchRes.text();
        let retryNeeded = false;
        if (err.includes("installation_video") && payload.installation_video !== undefined) {
          delete payload.installation_video;
          retryNeeded = true;
        }
        if (err.includes("installation_manual") && payload.installation_manual !== undefined) {
          delete payload.installation_manual;
          retryNeeded = true;
        }
        if (retryNeeded) {
          patchRes = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${item.id}`, {
            method: "PATCH",
            headers: {
              ...headers,
              Prefer: "return=representation",
            },
            body: JSON.stringify(payload),
          });
        }
      }

      if (patchRes.ok) {
        updatedProducts.push(item);
      } else {
        console.warn(`[Bulk API] Failed to update #${item.id}:`, await patchRes.text());
      }
    }

    // Invalidate Next.js cache so storefront updates immediately
    revalidateProductsCache();

    return NextResponse.json({
      success: true,
      updatedCount: updatedProducts.length,
      products: updatedProducts,
    });
  } catch (error) {
    console.error("[Bulk API Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
