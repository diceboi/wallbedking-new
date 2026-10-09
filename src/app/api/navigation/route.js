import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { MAIN_NAV_ITEMS } from "@/data/navigation";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("navigation_menu")
      .select("*")
      .eq("is_visible", true)
      .order("order_index", { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      const items = data.map((row, idx) => ({
        id: row.id,
        title: row.title,
        type: row.type || "category",
        category_id: row.category_id || "",
        slug: row.slug || row.id,
        href: row.href || `/products/${row.slug || row.id}`,
        order: row.order_index ?? (idx + 1),
        is_visible: true,
        hasSubmenu: Boolean(row.has_submenu),
        has_submenu: Boolean(row.has_submenu),
        badge: row.badge || "",
      }));

      return NextResponse.json(
        { success: true, items, fromSupabase: true },
        {
          headers: {
            "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
          },
        }
      );
    }
  } catch (err) {
    console.warn("[Public Navigation API] Supabase query note:", err.message);
  }

  // Graceful fallback to default items
  return NextResponse.json(
    {
      success: true,
      items: MAIN_NAV_ITEMS,
      fromSupabase: false,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    }
  );
}
