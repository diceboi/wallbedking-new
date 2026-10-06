import { unstable_cache, revalidateTag, revalidatePath } from "next/cache";

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
 * Fetch all products directly from Supabase with Next.js data cache.
 * Cache is tagged with 'products' and revalidated on demand whenever an admin edit occurs.
 */
export const getStorefrontProducts = unstable_cache(
  async () => {
    if (!SUPABASE_URL || !SERVICE_KEY) {
      console.warn("[products-db] Missing Supabase credentials in environment.");
      return null;
    }

    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/products?select=*&order=id.asc`,
        {
          headers,
          next: { tags: ["products"] },
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

      // Normalize fields for storefront compatibility
      return rows.map((p) => ({
        ...p,
        hoverImage: p.hoverImage || p.hover_image,
        available_locales:
          Array.isArray(p.available_locales) && p.available_locales.length > 0
            ? p.available_locales
            : ["en", "us", "de", "fr", "es", "por", "it"],
        tags: Array.isArray(p.tags) ? p.tags : [],
      }));
    } catch (err) {
      console.error("[products-db] Exception fetching products:", err.message);
      return null;
    }
  },
  ["storefront-products-catalog-v1"],
  { tags: ["products"], revalidate: 3600 }
);

/**
 * Revalidates the Next.js cache across the entire application immediately.
 * Call this in admin mutation routes (create, update, delete, bulk).
 */
export function revalidateProductsCache() {
  try {
    revalidateTag("products");
    revalidatePath("/", "layout");
    revalidatePath("/[locale]/products", "page");
    revalidatePath("/[locale]/products/[category]", "page");
    revalidatePath("/[locale]/products/[category]/[product]", "page");
  } catch (err) {
    console.warn("[products-db] Cache revalidation notice:", err.message);
  }
}
