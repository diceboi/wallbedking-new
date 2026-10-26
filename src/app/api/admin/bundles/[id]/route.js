import { NextResponse } from "next/server";
import {
  readLocalBundlesFile,
  writeLocalBundlesFile,
  enrichBundleWithProducts,
  fetchProductsForComponents,
} from "@/lib/bundles";
import { revalidateProductsCache } from "@/lib/products-db";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseHeaders = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

export async function GET(request, { params }) {
  try {
    const rawId = (await params)?.id;
    if (!rawId) {
      return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
    }

    const localBundles = readLocalBundlesFile();
    const bundle = localBundles.find((b) => String(b.id) === String(rawId) || b.slug === rawId);

    if (!bundle) {
      return NextResponse.json({ success: false, error: "Bundle not found" }, { status: 404 });
    }

    const allProdIds = (bundle.items || []).map((it) => it.product_id);
    const pMap = await fetchProductsForComponents(allProdIds);
    const enriched = enrichBundleWithProducts(bundle, pMap);

    return NextResponse.json({ success: true, bundle: enriched });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const rawId = (await params)?.id;
    if (!rawId) {
      return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
    }

    const body = await request.json();
    const localBundles = readLocalBundlesFile();
    const targetIdx = localBundles.findIndex((b) => String(b.id) === String(rawId) || b.slug === rawId);

    if (targetIdx < 0) {
      return NextResponse.json({ success: false, error: "Bundle not found" }, { status: 404 });
    }

    const existing = localBundles[targetIdx];

    const items = Array.isArray(body.items) ? body.items : existing.items || [];
    if (items.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one component product must be selected" },
        { status: 400 }
      );
    }

    const updatedBundle = {
      ...existing,
      ...body,
      id: existing.id,
      slug: (body.slug || existing.slug || body.name || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-"),
      name: body.name || existing.name,
      visibility: body.visibility || existing.visibility || "Visible",
      is_visible: (body.visibility || existing.visibility) !== "Hidden",
      items: items.map((it, idx) => ({
        product_id: Number(it.product_id),
        quantity: Math.max(1, Number(it.quantity || 1)),
        is_required: it.is_required !== false,
        sort_order: it.sort_order ?? idx + 1,
      })),
      updated_at: new Date().toISOString(),
    };

    // 1. Update in Supabase
    let supabaseSuccess = false;
    if (SUPABASE_URL && SERVICE_KEY) {
      try {
        const { items: _, pricing: __, health: ___, ...bundleRow } = updatedBundle;
        const res = await fetch(`${SUPABASE_URL}/rest/v1/bundles?id=eq.${existing.id}`, {
          method: "PATCH",
          headers: {
            ...supabaseHeaders,
            Prefer: "return=representation",
          },
          body: JSON.stringify(bundleRow),
        });

        if (res.ok) {
          // Delete old items and insert updated items
          await fetch(`${SUPABASE_URL}/rest/v1/bundle_items?bundle_id=eq.${existing.id}`, {
            method: "DELETE",
            headers: supabaseHeaders,
          });

          const itemsPayload = updatedBundle.items.map((it) => ({
            bundle_id: existing.id,
            product_id: it.product_id,
            quantity: it.quantity,
            is_required: it.is_required,
            sort_order: it.sort_order,
          }));

          await fetch(`${SUPABASE_URL}/rest/v1/bundle_items`, {
            method: "POST",
            headers: supabaseHeaders,
            body: JSON.stringify(itemsPayload),
          });

          supabaseSuccess = true;
        }
      } catch (err) {
        console.warn("[admin/bundles PUT] Supabase update notice:", err.message);
      }
    }

    // 2. Synchronize local fallback
    localBundles[targetIdx] = updatedBundle;
    writeLocalBundlesFile(localBundles);

    // Revalidate Next.js cache
    try {
      revalidateProductsCache();
    } catch (_) {}

    // Enrich and return
    const allProdIds = updatedBundle.items.map((it) => it.product_id);
    const pMap = await fetchProductsForComponents(allProdIds);
    const enriched = enrichBundleWithProducts(updatedBundle, pMap);

    return NextResponse.json({
      success: true,
      bundle: enriched,
      persisted_to_supabase: supabaseSuccess,
    });
  } catch (error) {
    console.error("[admin/bundles PUT] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const rawId = (await params)?.id;
    if (!rawId) {
      return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
    }

    // 1. Delete from Supabase
    if (SUPABASE_URL && SERVICE_KEY) {
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/bundles?id=eq.${rawId}`, {
          method: "DELETE",
          headers: supabaseHeaders,
        });
      } catch (err) {
        console.warn("[admin/bundles DELETE] Supabase delete notice:", err.message);
      }
    }

    // 2. Delete from local fallback
    const localBundles = readLocalBundlesFile();
    const updated = localBundles.filter((b) => String(b.id) !== String(rawId) && b.slug !== rawId);
    writeLocalBundlesFile(updated);

    try {
      revalidateProductsCache();
    } catch (_) {}

    return NextResponse.json({ success: true, message: "Bundle deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
