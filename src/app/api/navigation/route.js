import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { supabase } from "@/lib/supabase";
import { MAIN_NAV_ITEMS, normalizeNavLocales } from "@/data/navigation";

export const dynamic = "force-dynamic";

const getLocalNavigationMap = () => {
  try {
    const filePath = path.join(process.cwd(), "src", "data", "navigation_menu.json");
    if (!fs.existsSync(filePath)) return { list: null, map: new Map() };
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    if (!Array.isArray(parsed)) return { list: null, map: new Map() };
    const normalized = parsed.map((it, idx) => {
      const hasSub =
        it.hasSubmenu !== undefined ? Boolean(it.hasSubmenu) : Boolean(it.has_submenu);
      const slug = it.slug || it.category_id || it.id;
      return {
        ...it,
        slug,
        order: it.order ?? it.order_index ?? idx + 1,
        hasSubmenu: hasSub,
        has_submenu: hasSub,
        available_locales: normalizeNavLocales(it.available_locales, it),
      };
    });
    return {
      list: normalized,
      map: new Map(normalized.map((it) => [it.id, it])),
    };
  } catch {
    return { list: null, map: new Map() };
  }
};

export async function GET() {
  const { list: localList, map: localMap } = getLocalNavigationMap();

  try {
    const { data, error } = await supabase
      .from("navigation_menu")
      .select("*")
      .order("order_index", { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      const hasLocalesColumn = Object.prototype.hasOwnProperty.call(
        data[0],
        "available_locales"
      );

      const items = data
        .filter((row) => row.is_visible !== false)
        .map((row, idx) => {
          const localMatch = localMap.get(row.id);
          const rawLocales =
            hasLocalesColumn && Array.isArray(row.available_locales)
              ? row.available_locales
              : localMatch?.available_locales;

          return {
            id: row.id,
            title: row.title,
            type: row.type || "category",
            category_id: row.category_id || "",
            slug: row.slug || row.id,
            href: row.href || `/products/${row.slug || row.id}`,
            order: row.order_index ?? idx + 1,
            is_visible: true,
            hasSubmenu: Boolean(row.has_submenu),
            has_submenu: Boolean(row.has_submenu),
            badge: row.badge || "",
            available_locales: normalizeNavLocales(rawLocales, row),
          };
        });

      return NextResponse.json(
        { success: true, items, fromSupabase: true },
        {
          headers: {
            "Cache-Control": "no-store, max-age=0",
          },
        }
      );
    }
  } catch (err) {
    console.warn("[Public Navigation API] Supabase query note:", err.message);
  }

  // Graceful fallback to local navigation JSON or static defaults
  const fallbackItems = Array.isArray(localList)
    ? localList
        .filter((item) => item.is_visible !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
    : MAIN_NAV_ITEMS;

  return NextResponse.json(
    {
      success: true,
      items: fallbackItems,
      fromSupabase: false,
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
