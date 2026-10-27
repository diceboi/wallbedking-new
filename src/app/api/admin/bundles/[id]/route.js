import { NextResponse } from "next/server";
import {
  readLocalBundlesFile,
  writeLocalBundlesFile,
  getEnrichedBundleById,
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

export async function GET(request, { params }) {
  try {
    const rawId = (await params)?.id;
    if (!rawId) {
      return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
    }

    const bundle = await getEnrichedBundleById(rawId, { includeHidden: true });
    if (!bundle) {
      return NextResponse.json({ success: false, error: "Bundle not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, bundle });
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
    const existing = await getEnrichedBundleById(rawId, { includeHidden: true });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Bundle not found" }, { status: 404 });
    }

    const hasNewItems = Array.isArray(body.items);
    const items = hasNewItems ? body.items : (existing.items || []);

    if (hasNewItems && items.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one component product must be selected" },
        { status: 400 }
      );
    }

    const newVisibility = body.visibility || existing.visibility || "Visible";
    const newIsVisible = newVisibility !== "Hidden";

    const updatedData = {
      ...existing,
      ...body,
      id: existing.id,
      slug: (body.slug || existing.slug || body.name || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-"),
      name: body.name || existing.name,
      visibility: newVisibility,
      is_visible: newIsVisible,
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
        const cleanRow = sanitizeBundleForSupabase(updatedData);
        const isNumeric = /^\d+$/.test(String(existing.id));
        const filterParam = isNumeric ? `id=eq.${existing.id}` : `slug=eq.${existing.slug}`;

        const res = await fetch(`${SUPABASE_URL}/rest/v1/bundles?${filterParam}`, {
          method: "PATCH",
          headers: {
            ...supabaseHeaders,
            Prefer: "return=representation",
          },
          body: JSON.stringify(cleanRow),
        });

        if (res.ok) {
          const updatedRows = await res.json();
          if (Array.isArray(updatedRows) && updatedRows.length > 0) {
            supabaseSuccess = true;
            const bundleDbId = updatedRows[0].id;

            // Only replace bundle_items if items were explicitly provided in body
            if (hasNewItems) {
              await fetch(`${SUPABASE_URL}/rest/v1/bundle_items?bundle_id=eq.${bundleDbId}`, {
                method: "DELETE",
                headers: supabaseHeaders,
              });

              if (items.length > 0) {
                const itemsPayload = items.map((it, idx) => ({
                  bundle_id: bundleDbId,
                  product_id: Number(it.product_id),
                  quantity: Math.max(1, Number(it.quantity || 1)),
                  is_required: it.is_required !== false,
                  sort_order: it.sort_order ?? idx + 1,
                }));

                await fetch(`${SUPABASE_URL}/rest/v1/bundle_items`, {
                  method: "POST",
                  headers: supabaseHeaders,
                  body: JSON.stringify(itemsPayload),
                });
              }
            }
          }
        } else {
          const errText = await res.text();
          console.warn("[admin/bundles PUT] Supabase patch error:", errText);
        }
      } catch (err) {
        console.warn("[admin/bundles PUT] Supabase update notice:", err.message);
      }
    }

    // 2. Synchronize local fallback bundles.json
    try {
      const localBundles = readLocalBundlesFile();
      const targetIdx = localBundles.findIndex((b) => String(b.id) === String(existing.id) || b.slug === existing.slug);
      const bundleForLocal = {
        ...updatedData,
        items: items.map((it, idx) => ({
          product_id: Number(it.product_id),
          quantity: Math.max(1, Number(it.quantity || 1)),
          is_required: it.is_required !== false,
          sort_order: it.sort_order ?? idx + 1,
        })),
      };
      // Clean up enriched fields before saving to JSON
      delete bundleForLocal.pricing;
      delete bundleForLocal.health;
      delete bundleForLocal.calculated_price_gbp;
      delete bundleForLocal.calculated_price_euro;
      delete bundleForLocal.calculated_price_usd;
      delete bundleForLocal.calculated_subtotal_gbp;
      delete bundleForLocal.calculated_subtotal_euro;
      delete bundleForLocal.calculated_subtotal_usd;
      delete bundleForLocal.calculated_savings_gbp;
      delete bundleForLocal.calculated_savings_euro;
      delete bundleForLocal.calculated_savings_usd;
      delete bundleForLocal.calculated_stock;
      delete bundleForLocal.is_purchasable;
      delete bundleForLocal.has_hidden_component;
      delete bundleForLocal.has_zero_stock_component;

      if (targetIdx >= 0) {
        localBundles[targetIdx] = bundleForLocal;
      } else {
        localBundles.push(bundleForLocal);
      }
      writeLocalBundlesFile(localBundles);
    } catch (_) {}

    // Revalidate Next.js cache
    try {
      revalidateProductsCache();
    } catch (_) {}

    // Fetch and return fresh enriched bundle
    const enriched = await getEnrichedBundleById(existing.id, { includeHidden: true });

    return NextResponse.json({
      success: true,
      bundle: enriched || updatedData,
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
    let supabaseSuccess = false;
    if (SUPABASE_URL && SERVICE_KEY) {
      try {
        const isNumeric = /^\d+$/.test(String(rawId));
        const filterParam = isNumeric ? `id=eq.${rawId}` : `slug=eq.${rawId}`;
        const res = await fetch(`${SUPABASE_URL}/rest/v1/bundles?${filterParam}`, {
          method: "DELETE",
          headers: supabaseHeaders,
        });
        if (res.ok) {
          supabaseSuccess = true;
        }
      } catch (err) {
        console.warn("[admin/bundles DELETE] Supabase delete notice:", err.message);
      }
    }

    // 2. Delete from local fallback
    try {
      const localBundles = readLocalBundlesFile();
      const updated = localBundles.filter((b) => String(b.id) !== String(rawId) && b.slug !== rawId);
      writeLocalBundlesFile(updated);
    } catch (_) {}

    try {
      revalidateProductsCache();
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: "Bundle deleted",
      persisted_to_supabase: supabaseSuccess,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
