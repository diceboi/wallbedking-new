import { NextResponse } from "next/server";
import {
  getAllEnrichedBundles,
  getEnrichedBundleById,
  readLocalBundlesFile,
  writeLocalBundlesFile,
  sanitizeBundleForSupabase,
} from "@/lib/bundles";
import { revalidateProductsCache } from "@/lib/products-db";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseHeaders = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get("search") || "").trim().toLowerCase();
    const visibility = searchParams.get("visibility");

    const bundles = await getAllEnrichedBundles({ includeHidden: true });

    let filtered = bundles;

    if (search) {
      filtered = filtered.filter(
        (b) =>
          b.name?.toLowerCase().includes(search) ||
          b.slug?.toLowerCase().includes(search) ||
          b.sku?.toLowerCase().includes(search) ||
          b.items?.some((it) => it.product?.name?.toLowerCase().includes(search))
      );
    }

    if (visibility && visibility !== "all") {
      filtered = filtered.filter((b) => b.visibility === visibility);
    }

    return NextResponse.json({
      success: true,
      count: filtered.length,
      bundles: filtered,
    });
  } catch (error) {
    console.error("[admin/bundles GET] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { success: false, error: "Bundle name is required" },
        { status: 400 }
      );
    }

    // Auto-generate slug if not provided
    const slug = (
      body.slug ||
      body.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    ).trim();

    const items = Array.isArray(body.items) ? body.items : [];
    if (items.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one component product must be selected" },
        { status: 400 }
      );
    }

    const bundleData = {
      sku: body.sku || `BDL-${slug.toUpperCase().slice(0, 12)}`,
      slug,
      name: body.name.trim(),
      name_en: body.name_en || body.name,
      name_us: body.name_us || body.name_en || body.name,
      name_de: body.name_de || "",
      name_fr: body.name_fr || "",
      name_es: body.name_es || "",
      name_por: body.name_por || "",
      name_it: body.name_it || "",

      description: body.description || "",
      description_en: body.description_en || body.description || "",
      description_us: body.description_us || body.description_en || "",
      description_de: body.description_de || "",
      description_fr: body.description_fr || "",
      description_es: body.description_es || "",
      description_por: body.description_por || "",
      description_it: body.description_it || "",

      category: "bundles",
      parent_category: "bundles",
      sub_category: body.sub_category || "Bed & Cabinet Sets",
      badge: body.badge || "Bundle & Save",
      tagline: body.tagline || "",

      image: body.image || "",
      hover_image: body.hover_image || body.image || "",
      product_images: Array.isArray(body.product_images) ? body.product_images : (body.image ? [body.image] : []),

      meta_title: body.meta_title || `${body.name} | WallBedKing`,
      meta_description: body.meta_description || body.description || "",

      warranty: body.warranty || "5-year manufacturer warranty",
      visibility: body.visibility || "Visible",
      is_visible: body.visibility !== "Hidden",
      available_locales: Array.isArray(body.available_locales) ? body.available_locales : ["en", "us", "de", "fr", "es", "por", "it"],
      tags: Array.isArray(body.tags) ? body.tags : ["bundle"],
      features: Array.isArray(body.features) ? body.features : [],

      discount_type: body.discount_type || "percent",
      discount_percent: Number(body.discount_percent ?? 10),
      discount_fix_gbp: Number(body.discount_fix_gbp || 0),
      discount_fix_euro: Number(body.discount_fix_euro || 0),
      discount_fix_usd: Number(body.discount_fix_usd || 0),

      sort_order: Number(body.sort_order || 0),
      items: items.map((it, idx) => ({
        product_id: Number(it.product_id),
        quantity: Math.max(1, Number(it.quantity || 1)),
        is_required: it.is_required !== false,
        sort_order: it.sort_order ?? idx + 1,
      })),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 1. Try persisting to Supabase
    let supabaseSuccess = false;
    let finalBundleId = body.id || null;

    if (SUPABASE_URL && SERVICE_KEY) {
      try {
        const cleanRow = sanitizeBundleForSupabase(bundleData);
        // Do not pass ID so Supabase uses its serial sequence
        delete cleanRow.id;

        const res = await fetch(`${SUPABASE_URL}/rest/v1/bundles`, {
          method: "POST",
          headers: {
            ...supabaseHeaders,
            Prefer: "return=representation",
          },
          body: JSON.stringify(cleanRow),
        });

        if (res.ok) {
          const createdBundle = await res.json();
          if (createdBundle && createdBundle[0]?.id) {
            finalBundleId = createdBundle[0].id;
            bundleData.id = finalBundleId;

            // Insert items
            const itemsPayload = bundleData.items.map((it) => ({
              bundle_id: finalBundleId,
              product_id: it.product_id,
              quantity: it.quantity,
              is_required: it.is_required,
              sort_order: it.sort_order,
            }));

            const itemsRes = await fetch(`${SUPABASE_URL}/rest/v1/bundle_items`, {
              method: "POST",
              headers: supabaseHeaders,
              body: JSON.stringify(itemsPayload),
            });

            if (itemsRes.ok) {
              supabaseSuccess = true;
            } else {
              console.warn("[admin/bundles POST] Items insert error:", await itemsRes.text());
            }
          }
        } else {
          console.warn("[admin/bundles POST] Bundle insert error:", await res.text());
        }
      } catch (err) {
        console.warn("[admin/bundles POST] Supabase write notice:", err.message);
      }
    }

    if (!finalBundleId) {
      finalBundleId = Date.now();
      bundleData.id = finalBundleId;
    }

    // 2. Always synchronize local bundles.json fallback
    try {
      const localBundles = readLocalBundlesFile();
      const existingIdx = localBundles.findIndex((b) => b.id === bundleData.id || b.slug === bundleData.slug);
      if (existingIdx >= 0) {
        localBundles[existingIdx] = bundleData;
      } else {
        localBundles.push(bundleData);
      }
      writeLocalBundlesFile(localBundles);
    } catch (_) {}

    // Revalidate Next.js cache
    try {
      revalidateProductsCache();
    } catch (_) {}

    // Fetch fresh enriched bundle
    const enriched = await getEnrichedBundleById(finalBundleId, { includeHidden: true });

    return NextResponse.json({
      success: true,
      bundle: enriched || bundleData,
      persisted_to_supabase: supabaseSuccess,
    });
  } catch (error) {
    console.error("[admin/bundles POST] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
