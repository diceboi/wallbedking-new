import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { supabaseAdmin } from "@/lib/supabase";

const getNavigationFilePath = () =>
  path.join(process.cwd(), "src", "data", "navigation_menu.json");
const getCategoriesFilePath = () =>
  path.join(process.cwd(), "src", "data", "categories.json");

const getLocalNavigation = () => {
  const filePath = getNavigationFilePath();
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading navigation_menu.json:", err);
    return [];
  }
};

const getLocalCategories = () => {
  const filePath = getCategoriesFilePath();
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
};

const saveLocalNavigation = (items) => {
  try {
    const filePath = getNavigationFilePath();
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.warn("Error writing local navigation_menu.json:", err.message);
    return false;
  }
};

/**
 * GET /api/admin/navigation
 * Returns navigation items and categories from Supabase (with graceful local fallback)
 */
export async function GET() {
  try {
    let items = [];
    let categories = [];
    let fromSupabase = false;
    let dbTableMissing = false;

    // 1. Fetch categories (Supabase first)
    try {
      const { data: catData, error: catError } = await supabaseAdmin
        .from("categories")
        .select("*")
        .order("display_order", { ascending: true });

      if (!catError && Array.isArray(catData) && catData.length > 0) {
        categories = catData;
      } else {
        categories = getLocalCategories();
      }
    } catch {
      categories = getLocalCategories();
    }

    // 2. Fetch navigation menu from Supabase
    try {
      const { data: navData, error: navError } = await supabaseAdmin
        .from("navigation_menu")
        .select("*")
        .order("order_index", { ascending: true });

      if (navError) {
        // Table does not exist in Supabase yet (PGRST205)
        if (navError.code === "PGRST205" || navError.message?.includes("not find")) {
          dbTableMissing = true;
        }
        console.warn("[Navigation API] Supabase navigation_menu notice:", navError.message);
        items = getLocalNavigation();
      } else if (Array.isArray(navData) && navData.length > 0) {
        items = navData.map((row, idx) => ({
          id: row.id,
          title: row.title,
          type: row.type || "category",
          category_id: row.category_id || "",
          slug: row.slug || row.id,
          href: row.href || `/products/${row.slug || row.id}`,
          order: row.order_index ?? (idx + 1),
          is_visible: Boolean(row.is_visible),
          has_submenu: Boolean(row.has_submenu),
          badge: row.badge || "",
        }));
        fromSupabase = true;
      } else {
        // Table exists but is empty
        items = getLocalNavigation();
        fromSupabase = true;
      }
    } catch (err) {
      console.warn("[Navigation API] Supabase query exception:", err.message);
      items = getLocalNavigation();
    }

    return NextResponse.json({
      success: true,
      items: Array.isArray(items) ? items : [],
      categories: Array.isArray(categories) ? categories : [],
      fromSupabase,
      dbTableMissing,
    });
  } catch (error) {
    console.error("[Navigation API Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load navigation" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/navigation
 * Saves updated navigation items to Supabase (and syncs local fallback)
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { items } = body || {};

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: "Items must be an array" },
        { status: 400 }
      );
    }

    // Normalize order and fields
    const ordered = items.map((item, index) => ({
      id: item.id || `nav-${Date.now()}-${index}`,
      title: item.title,
      type: item.type || "category",
      category_id: item.category_id || null,
      slug: item.slug || item.id,
      href: item.href || `/products/${item.slug || item.id}`,
      order: index + 1,
      order_index: index + 1,
      is_visible: item.is_visible !== false,
      has_submenu: item.has_submenu !== false,
      badge: item.badge || "",
    }));

    let savedToSupabase = false;
    let dbTableMissing = false;

    // 1. Attempt to save to Supabase navigation_menu table
    try {
      const dbRows = ordered.map((item) => ({
        id: item.id,
        title: item.title,
        type: item.type,
        category_id: item.category_id || null,
        slug: item.slug,
        href: item.href,
        order_index: item.order,
        is_visible: item.is_visible,
        has_submenu: item.has_submenu,
        badge: item.badge,
        updated_at: new Date().toISOString(),
      }));

      // Upsert all rows into Supabase
      const { error: upsertError } = await supabaseAdmin
        .from("navigation_menu")
        .upsert(dbRows, { onConflict: "id" });

      if (upsertError) {
        if (upsertError.code === "PGRST205" || upsertError.message?.includes("not find")) {
          dbTableMissing = true;
        }
        console.warn("[Navigation API] Supabase upsert error:", upsertError.message);
      } else {
        // Remove any items that were deleted in the UI
        const currentIds = dbRows.map((r) => r.id);
        if (currentIds.length > 0) {
          const { data: existingRows } = await supabaseAdmin
            .from("navigation_menu")
            .select("id");
          
          if (Array.isArray(existingRows)) {
            const idsToDelete = existingRows
              .map((r) => r.id)
              .filter((id) => !currentIds.includes(id));

            if (idsToDelete.length > 0) {
              await supabaseAdmin
                .from("navigation_menu")
                .delete()
                .in("id", idsToDelete);
            }
          }
        }

        savedToSupabase = true;
      }
    } catch (err) {
      console.warn("[Navigation API] Supabase write exception:", err.message);
    }

    // 2. Also keep local JSON file synchronized as fallback cache
    saveLocalNavigation(ordered);

    return NextResponse.json({
      success: true,
      message: savedToSupabase
        ? "Navigation menu saved to Supabase database successfully!"
        : "Navigation menu saved locally (database table not ready yet)",
      items: ordered,
      fromSupabase: savedToSupabase,
      dbTableMissing,
    });
  } catch (error) {
    console.error("[Navigation API Save Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save navigation" },
      { status: 500 }
    );
  }
}
