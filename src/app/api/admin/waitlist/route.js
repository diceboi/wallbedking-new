import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import {
  triggerRestockNotification,
  getFallbackWaitlist,
  saveFallbackWaitlist,
} from "@/lib/restock";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

function loadLocalCatalogMap() {
  const dataDir = path.join(process.cwd(), "src", "data");
  const files = ["products-catalog.json", "tables-catalog.json", "specialty-catalog.json"];
  const byId = new Map();
  const bySlug = new Map();

  for (const fname of files) {
    try {
      const fullPath = path.join(dataDir, fname);
      if (fs.existsSync(fullPath)) {
        const list = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
        if (Array.isArray(list)) {
          for (const p of list) {
            if (p.id !== undefined && p.id !== null) byId.set(String(p.id), p);
            if (p.slug) bySlug.set(p.slug, p);
          }
        }
      }
    } catch {
      // ignore
    }
  }
  return { byId, bySlug };
}

/**
 * GET /api/admin/waitlist
 * Lists all waitlist subscribers (Supabase + local fallback merged) with live product metadata and grouped summary
 */
export async function GET() {
  try {
    let dbRows = [];
    let source = "fallback";

    if (supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin
          .from("product_waitlist")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && Array.isArray(data)) {
          dbRows = data;
          source = "supabase";
        }
      } catch (dbErr) {
        console.warn("[Admin Waitlist GET] Supabase notice:", dbErr.message);
      }
    }

    const localRows = getFallbackWaitlist();

    // Merge Supabase and local fallback rows, avoiding duplicates by (email + slug + status) or id
    const seenIds = new Set();
    const seenComposite = new Set();
    const merged = [];

    for (const row of [...dbRows, ...localRows]) {
      const idKey = row.id ? String(row.id) : null;
      const email = String(row.customer_email || "").trim().toLowerCase();
      const slug = String(row.product_slug || "").trim();
      const compKey = `${email}::${slug}::${row.status || "waiting"}`;

      if (idKey && seenIds.has(idKey)) continue;
      if (seenComposite.has(compKey)) continue;

      if (idKey) seenIds.add(idKey);
      seenComposite.add(compKey);
      merged.push(row);
    }

    // Sort newest first
    merged.sort((a, b) => {
      const da = new Date(a.created_at || 0).getTime();
      const db = new Date(b.created_at || 0).getTime();
      return db - da;
    });

    // Enrich with live product stock/category from Supabase + local catalogs
    const liveById = new Map();
    const liveBySlug = new Map();

    if (merged.length > 0 && supabaseAdmin) {
      try {
        const ids = [...new Set(merged.map((m) => m.product_id).filter((id) => id && !Number.isNaN(Number(id))))];
        const slugs = [...new Set(merged.map((m) => m.product_slug).filter(Boolean))];

        if (ids.length > 0) {
          const { data: prods } = await supabaseAdmin
            .from("products")
            .select("id, name, slug, stock, price_gbp, parent_category, image")
            .in("id", ids);
          for (const p of prods || []) {
            liveById.set(String(p.id), p);
            if (p.slug) liveBySlug.set(p.slug, p);
          }
        }
        if (slugs.length > 0) {
          const { data: prodsBySlug } = await supabaseAdmin
            .from("products")
            .select("id, name, slug, stock, price_gbp, parent_category, image")
            .in("slug", slugs);
          for (const p of prodsBySlug || []) {
            liveById.set(String(p.id), p);
            if (p.slug) liveBySlug.set(p.slug, p);
          }
        }
      } catch (prodErr) {
        console.warn("[Admin Waitlist GET] Product enrichment notice:", prodErr.message);
      }
    }

    const localCatalog = loadLocalCatalogMap();

    const items = merged.map((row) => {
      const liveProd =
        (row.product_id ? liveById.get(String(row.product_id)) : null) ||
        (row.product_slug ? liveBySlug.get(row.product_slug) : null) ||
        (row.product_id ? localCatalog.byId.get(String(row.product_id)) : null) ||
        (row.product_slug ? localCatalog.bySlug.get(row.product_slug) : null) ||
        null;

      const opts = row.options && typeof row.options === "object" ? row.options : {};
      const isComingSoon = Boolean(opts.comingSoon || liveProd?.is_coming_soon);
      const currentStock =
        liveProd && liveProd.stock !== undefined && liveProd.stock !== null
          ? Number(liveProd.stock)
          : null;

      return {
        ...row,
        customer_name: row.customer_name || opts.customer_name || "",
        parent_category: liveProd?.parent_category || opts.parent_category || "beds",
        current_stock: currentStock,
        is_coming_soon: isComingSoon,
        product_image: row.product_image || liveProd?.image || "",
        in_supabase_products: Boolean(
          (row.product_id && liveById.has(String(row.product_id))) ||
            (row.product_slug && liveBySlug.has(row.product_slug))
        ),
      };
    });

    // Build product groups summary
    const groupMap = new Map();
    for (const item of items) {
      const key = item.product_slug || String(item.product_id || item.product_name || "unknown");
      if (!groupMap.has(key)) {
        groupMap.set(key, {
          key,
          product_id: item.product_id || null,
          product_slug: item.product_slug || "",
          product_name: item.product_name || "Wall Bed King Product",
          product_image: item.product_image || "",
          parent_category: item.parent_category || "beds",
          current_stock: item.current_stock,
          is_coming_soon: item.is_coming_soon,
          totalCount: 0,
          waitingCount: 0,
          notifiedCount: 0,
          latestSignup: item.created_at || null,
          subscribers: [],
        });
      }
      const g = groupMap.get(key);
      g.totalCount++;
      if (item.status === "waiting") g.waitingCount++;
      else g.notifiedCount++;
      if (item.is_coming_soon) g.is_coming_soon = true;
      if (!g.product_image && item.product_image) g.product_image = item.product_image;
      g.subscribers.push({
        id: item.id,
        email: item.customer_email,
        name: item.customer_name,
        variant_name: item.variant_name,
        locale: item.locale || "en",
        status: item.status || "waiting",
        created_at: item.created_at,
        notified_at: item.notified_at,
      });
    }

    const productGroups = Array.from(groupMap.values()).sort(
      (a, b) => b.waitingCount - a.waitingCount || b.totalCount - a.totalCount
    );

    const uniqueEmails = new Set(items.map((i) => String(i.customer_email || "").toLowerCase()).filter(Boolean)).size;
    const stats = {
      total: items.length,
      waiting: items.filter((i) => i.status === "waiting").length,
      notified: items.filter((i) => i.status === "notified").length,
      comingSoon: items.filter((i) => i.is_coming_soon).length,
      uniqueEmails,
      uniqueProducts: productGroups.length,
      resendConfigured: Boolean(process.env.RESEND_API_KEY),
    };

    return NextResponse.json(
      {
        success: true,
        source,
        items,
        productGroups,
        stats,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err) {
    console.error("[Admin Waitlist GET Error]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load waitlist" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

/**
 * POST /api/admin/waitlist
 * Manually send restock/launch notification to a product's waitlist or specific subscriber IDs
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      productId = null,
      productSlug = null,
      waitlistIds = null,
      includeNotified = false,
    } = body || {};

    const result = await triggerRestockNotification({
      productId,
      productSlug,
      waitlistIds,
      includeNotified,
    });

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
      headers: NO_CACHE_HEADERS,
    });
  } catch (err) {
    console.error("[Admin Waitlist POST Error]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to send waitlist notification" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

/**
 * PATCH /api/admin/waitlist
 * Update subscriber status (e.g. reset 'notified' back to 'waiting')
 */
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, status } = body || {};

    if (!id || !["waiting", "notified"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Valid id and status ('waiting' | 'notified') are required" },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const nowIso = new Date().toISOString();
    const patchPayload = {
      status,
      notified_at: status === "notified" ? nowIso : null,
      updated_at: nowIso,
    };

    if (supabaseAdmin && !String(id).startsWith("wl_")) {
      try {
        await supabaseAdmin
          .from("product_waitlist")
          .update(patchPayload)
          .eq("id", id);
      } catch (dbErr) {
        console.warn("[Admin Waitlist PATCH] DB notice:", dbErr.message);
      }
    }

    const local = getFallbackWaitlist();
    const updatedLocal = local.map((it) =>
      String(it.id) === String(id) ? { ...it, ...patchPayload } : it
    );
    saveFallbackWaitlist(updatedLocal);

    return NextResponse.json(
      { success: true, id, status },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update waitlist entry" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

/**
 * DELETE /api/admin/waitlist
 * Permanently remove a waitlist entry
 */
export async function DELETE(request) {
  try {
    let id = null;
    try {
      const body = await request.json();
      id = body?.id;
    } catch {
      // ignore non-JSON body
    }
    if (!id) {
      const { searchParams } = new URL(request.url);
      id = searchParams.get("id");
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing waitlist entry id" },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    if (supabaseAdmin && !String(id).startsWith("wl_")) {
      try {
        await supabaseAdmin.from("product_waitlist").delete().eq("id", id);
      } catch (dbErr) {
        console.warn("[Admin Waitlist DELETE] DB notice:", dbErr.message);
      }
    }

    const local = getFallbackWaitlist();
    const filtered = local.filter((it) => String(it.id) !== String(id));
    saveFallbackWaitlist(filtered);

    return NextResponse.json(
      { success: true, message: "Waitlist entry deleted." },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete waitlist entry" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
