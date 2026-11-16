import { cache } from "react";
import { revalidateTag, revalidatePath } from "next/cache";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

/**
 * Fetch all products directly from Supabase (deduplicated per request via React cache).
 * Avoids Next.js unstable_cache's 2MB payload limit so live stock/visibility never fall back to stale data.
 */
export const getStorefrontProducts = cache(async () => {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.warn("[products-db] Missing Supabase credentials in environment.");
    return null;
  }

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/products?select=*&order=id.asc`,
      {
        headers,
        cache: "no-store",
      }
    );

    if (!res.ok) {
      console.error(
        "[products-db] Supabase query failed:",
        res.status,
        await res.text()
      );
      return null;
    }

    const rows = await res.json();
    if (!Array.isArray(rows)) return null;

    // Filter out hidden products so they NEVER enter the storefront
    const visibleRows = rows.filter((p) => {
      const vis = String(p.visibility || "").trim().toLowerCase();
      return vis !== "hidden" && p.visibility !== false && p.is_visible !== false;
    });

    // Normalize fields for storefront compatibility
    return visibleRows.map((p) => ({
      ...p,
      installation_manual: p.installation_manual || null,
      installation_video: p.installation_video || null,
      hoverImage: p.hoverImage || p.hover_image,
      available_locales:
        Array.isArray(p.available_locales) && p.available_locales.length > 0
          ? p.available_locales
          : ["en", "us", "de", "fr", "es", "por", "it"],
      tags: Array.isArray(p.tags) ? p.tags : [],
    }));
  } catch (err) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") throw err;
    console.error("[products-db] Exception fetching products:", err.message);
    return null;
  }
});

/**
 * Fetch all bundles directly from Supabase (deduplicated per request).
 */
export const getStorefrontBundles = cache(async () => {
  if (!SUPABASE_URL || !SERVICE_KEY) return null;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/bundles?select=*,bundle_items(*)&order=sort_order.asc,id.asc`,
      {
        headers,
        cache: "no-store",
      }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    if (!Array.isArray(rows)) return null;

    return rows.map((b) => ({
      ...b,
      items: (b.bundle_items || []).map((bi) => ({
        product_id: bi.product_id,
        quantity: bi.quantity || 1,
        is_required: bi.is_required !== false,
        sort_order: bi.sort_order || 0,
      })),
    }));
  } catch (err) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") throw err;
    console.error("[products-db] Exception fetching bundles:", err.message);
    return null;
  }
});

/**
 * Revalidates the Next.js cache across the entire application immediately.
 * Call this in admin mutation routes (create, update, delete, bulk).
 */
export function revalidateProductsCache() {
  try {
    revalidateTag("products");
    revalidateTag("bundles");
    revalidatePath("/", "layout");
    revalidatePath("/[locale]/products", "page");
    revalidatePath("/[locale]/products/[category]", "page");
    revalidatePath("/[locale]/products/[category]/[product]", "page");
  } catch (err) {
    console.warn("[products-db] Cache revalidation notice:", err.message);
  }
}

