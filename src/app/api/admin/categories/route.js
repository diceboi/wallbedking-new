import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import catalog from "@/data/products-catalog.json";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

const getLocalCategories = () => {
  const filePath = path.join(process.cwd(), "src", "data", "categories.json");
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading local categories.json:", err);
    return [];
  }
};

const saveLocalCategories = (categories) => {
  try {
    const filePath = path.join(process.cwd(), "src", "data", "categories.json");
    fs.writeFileSync(filePath, JSON.stringify(categories, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Categories API] File is read-only (serverless environment):", err.message);
  }
};

// Calculate product counts per category
const enrichCategoryCounts = (categories) => {
  const counts = {};
  if (Array.isArray(catalog)) {
    catalog.forEach((p) => {
      const cat = p.parent_category || p.category;
      if (cat) {
        counts[cat] = (counts[cat] || 0) + 1;
      }
    });
  }
  return categories.map((c) => ({
    ...c,
    count: counts[c.id] || counts[c.slug] || 0,
  }));
};

export async function GET() {
  try {
    let categories = [];
    let fromSupabase = false;

    // Try Supabase first
    if (SUPABASE_URL && SERVICE_KEY) {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/categories?select=*&order=display_order.asc,name.asc`,
          { headers, cache: "no-store" }
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            categories = data;
            fromSupabase = true;
          }
        }
      } catch (sbErr) {
        console.warn("[Admin Categories API] Supabase query warning:", sbErr.message);
      }
    }

    // Fallback to local categories.json
    if (categories.length === 0) {
      categories = getLocalCategories();
    }

    const enriched = enrichCategoryCounts(categories);

    return NextResponse.json({
      success: true,
      categories: enriched,
      count: enriched.length,
      fromSupabase,
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
    const { name, title, description, subcategories, image, display_order } = body;

    if (!name && !title) {
      return NextResponse.json(
        { success: false, error: "Category name is required." },
        { status: 400 }
      );
    }

    const categoryName = name || title;
    const categorySlug = (body.id || body.slug || categoryName)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const newCategory = {
      id: categorySlug,
      name: categoryName,
      title: title || categoryName,
      slug: categorySlug,
      description: description || "",
      subcategories: Array.isArray(subcategories)
        ? subcategories
        : typeof subcategories === "string"
        ? subcategories.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      image: image || "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
      display_order: Number(display_order || 0),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save to local JSON
    const local = getLocalCategories();
    const existingIdx = local.findIndex((c) => c.id === categorySlug);
    if (existingIdx !== -1) {
      local[existingIdx] = { ...local[existingIdx], ...newCategory };
    } else {
      local.push(newCategory);
    }
    saveLocalCategories(local);

    // Try persisting to Supabase
    let sbSuccess = false;
    if (SUPABASE_URL && SERVICE_KEY) {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/categories`, {
          method: "POST",
          headers: {
            ...headers,
            Prefer: "resolution=merge-duplicates,return=representation",
          },
          body: JSON.stringify(newCategory),
        });
        if (res.ok) {
          sbSuccess = true;
        } else {
          console.warn("[Admin Categories API] Supabase POST status:", res.status, await res.text());
        }
      } catch (sbErr) {
        console.warn("[Admin Categories API] Supabase POST warning:", sbErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      category: newCategory,
      syncedWithSupabase: sbSuccess,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
