import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

const getLocalCategories = () => {
  try {
    const filePath = path.join(process.cwd(), "src", "data", "categories.json");
    if (!fs.existsSync(filePath)) return [];
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading local categories.json:", err);
    return [];
  }
};

const formatCategory = (row, idx) => {
  const slug = row.slug || row.id;
  const href = row.href
    ? row.href
    : slug.startsWith("/")
    ? slug
    : slug.includes("?")
    ? `/products/${slug}`
    : `/products/${slug}`;

  // Generate translation key helper (e.g. morphy-beds -> morphyBeds)
  const key =
    row.key ||
    row.id
      .replace(/-([a-z])/g, (_, char) => char.toUpperCase())
      .replace(/[^a-zA-Z0-9]/g, "");

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
    image: row.image || "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
    grid_image: row.grid_image || row.image || "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
    subcategories: Array.isArray(row.subcategories) ? row.subcategories : [],
    display_order: Number(row.display_order ?? idx + 1),
    is_visible: row.is_visible !== false,
    is_featured: row.is_featured !== false,
  };
};

export async function GET() {
  try {
    if (SUPABASE_URL && SERVICE_KEY) {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/categories?select=*&order=display_order.asc,name.asc`,
          { headers, next: { revalidate: 60 } }
        );

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const formatted = data.map(formatCategory).filter((c) => c.is_visible !== false);
            return NextResponse.json(
              {
                success: true,
                categories: formatted,
                fromSupabase: true,
              },
              {
                headers: {
                  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
                },
              }
            );
          }
        }
      } catch (sbErr) {
        console.warn("[Public Categories API] Supabase query note:", sbErr.message);
      }
    }

    // Fallback to local categories.json
    const local = getLocalCategories();
    const formatted = local.map(formatCategory).filter((c) => c.is_visible !== false);
    return NextResponse.json(
      {
        success: true,
        categories: formatted,
        fromSupabase: false,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
