import { unstable_cache, revalidateTag, revalidatePath } from "next/cache";
import fallbackCategories from "@/data/categories.json";
import {
  getLocalizedCategoryTitle,
  getLocalizedCategoryDescription,
} from "./categories-utils";

export { getLocalizedCategoryTitle, getLocalizedCategoryDescription };

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

const getLocalCategories = () => {
  return Array.isArray(fallbackCategories) ? fallbackCategories : [];
};

const normalizeCategory = (row, idx) => {
  const slug = row.slug || row.id;
  const href = row.href
    ? row.href
    : slug.startsWith("/")
    ? slug
    : slug.includes("?")
    ? `/products/${slug}`
    : `/products/${slug}`;

  const key =
    row.key ||
    row.id
      .replace(/-([a-z])/g, (_, char) => char.toUpperCase())
      .replace(/[^a-zA-Z0-9]/g, "");

  const image = row.image || "/category-images/morphy-beds.webp";
  const gridImage = row.grid_image || row.image || image;

  return {
    ...row,
    id: row.id,
    key,
    name: row.name || row.title,
    title: row.title || row.name,
    title_en: row.title_en || row.title || row.name,
    title_us: row.title_us || row.title_en || row.title || row.name,
    title_de: row.title_de,
    title_fr: row.title_fr,
    title_es: row.title_es,
    title_por: row.title_por || row.title_pt,
    title_pt: row.title_pt || row.title_por,
    title_it: row.title_it,
    description: row.description || "",
    description_en: row.description_en || row.description || "",
    description_us: row.description_us || row.description_en || row.description || "",
    description_de: row.description_de,
    description_fr: row.description_fr,
    description_es: row.description_es,
    description_por: row.description_por || row.description_pt,
    description_pt: row.description_pt || row.description_por,
    description_it: row.description_it,
    slug,
    href,
    image,
    grid_image: gridImage,
    gridImage,
    subcategories: Array.isArray(row.subcategories) ? row.subcategories : [],
    display_order: Number(row.display_order ?? idx + 1),
    is_featured: row.is_featured !== false && !row.is_unlisted && row.visibility !== "Unlisted",
    is_visible: row.is_visible !== false,
    is_unlisted: Boolean(row.is_unlisted || row.visibility === "Unlisted"),
    visibility: row.visibility || (row.is_unlisted ? "Unlisted" : row.is_visible === false ? "Hidden" : "Visible"),
  };
};


/**
 * Fetch all categories directly from Supabase with Next.js data cache.
 * Cache is tagged with 'categories' and revalidated on demand whenever an admin edit occurs.
 */
export const getStorefrontCategories = unstable_cache(
  async () => {
    const isStorefrontVisible = (c) => c.is_visible !== false && !c.is_unlisted && c.visibility !== "Unlisted";

    if (!SUPABASE_URL || !SERVICE_KEY) {
      console.warn("[categories-db] Missing Supabase credentials in environment, using local fallback.");
      return getLocalCategories().map(normalizeCategory).filter(isStorefrontVisible);
    }

    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/categories?select=*&order=display_order.asc,name.asc`,
        {
          headers,
          next: { tags: ["categories"] },
        }
      );

      if (!res.ok) {
        console.error(
          "[categories-db] Supabase query failed:",
          res.status,
          await res.text()
        );
        return getLocalCategories().map(normalizeCategory).filter(isStorefrontVisible);
      }

      const rows = await res.json();
      if (!Array.isArray(rows) || rows.length === 0) {
        return getLocalCategories().map(normalizeCategory).filter(isStorefrontVisible);
      }

      let result = rows.map(normalizeCategory).filter(isStorefrontVisible);
      return result;
    } catch (err) {
      console.error("[categories-db] Exception fetching categories:", err.message);
      return getLocalCategories().map(normalizeCategory);
    }
  },
  ["storefront-categories"],
  {
    tags: ["categories"],
    revalidate: 60,
  }
);

/**
 * Trigger cache revalidation after category updates in admin.
 */
export async function revalidateCategoriesCache() {
  try {
    revalidateTag("categories");
    revalidatePath("/", "layout");
    revalidatePath("/products");
    revalidatePath("/[locale]/products", "layout");
    revalidatePath("/[locale]/products/[category]", "page");
    revalidatePath("/[locale]", "page");
  } catch (err) {
    console.warn("[categories-db] Cache revalidation note:", err.message);
  }
}
