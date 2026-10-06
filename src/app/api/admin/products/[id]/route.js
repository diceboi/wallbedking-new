import { NextResponse } from "next/server";
import { triggerRestockNotification } from "@/lib/restock";
import { revalidateProductsCache } from "@/lib/products-db";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

const ALLOWED_SUPABASE_COLUMNS = new Set([
  "ean", "name", "slug", "width", "length", "height", "frame_width",
  "folded_up_height", "folded_up_projection", "folded_down_projection",
  "frame_distance_from_ground", "mounting_frame_height", "maximum_mattress_depth",
  "orientation", "type", "color", "weight", "stock", "package_dimensions",
  "price_gbp", "price_euro", "price_usd", "sale_percent", "sale_fix_gbp",
  "sale_fix_euro", "sale_fix_usd", "sale_price_gbp", "sale_price_euro", "sale_price_usd",
  "category", "parent_category", "sub_category", "backorder", "visibility",
  "warranty", "description", "image", "hover_image", "product_images",
  "product_image_alt", "meta_title", "meta_description", "has_3d",
  "sku", "ean_uk", "ean_us", "ean_de", "ean_fr", "ean_es", "ean_it", "ean_pt",
  "pack_1", "pack_2", "pack_3", "pack_4", "tags", "available_locales",
  "name_en", "name_us", "name_de", "name_fr", "name_es", "name_por", "name_pt", "name_it",
  "gtin_en", "gtin_us", "gtin_de", "gtin_fr", "gtin_es", "gtin_por", "gtin_pt", "gtin_it"
]);

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Prevent overwriting id
    delete body.id;

    // Check if restock notification was explicitly requested
    const shouldForceNotify = Boolean(body.notifyRestock);
    delete body.notifyRestock;

    // Fetch previous stock from Supabase if needed for restock detection
    let previousStock = null;
    let existingSlug = null;
    try {
      const prevRes = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}&select=stock,slug`, {
        headers,
        cache: "no-store",
      });
      if (prevRes.ok) {
        const rows = await prevRes.json();
        if (rows?.[0]) {
          previousStock = rows[0].stock !== undefined ? Number(rows[0].stock) : null;
          existingSlug = rows[0].slug || null;
        }
      }
    } catch (_) {}

    const supabasePayload = {};
    for (const [key, val] of Object.entries(body)) {
      if (ALLOWED_SUPABASE_COLUMNS.has(key) && val !== undefined) {
        supabasePayload[key] = val;
      }
    }
    if (body.hoverImage && !supabasePayload.hover_image) {
      supabasePayload.hover_image = body.hoverImage;
    }

    let res = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
      method: "PATCH",
      headers: {
        ...headers,
        Prefer: "return=representation",
      },
      body: JSON.stringify(supabasePayload),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ success: false, error: err }, { status: res.status });
    }

    const updated = await res.json();
    const finalProduct = { ...body, ...(updated[0] || updated), id: Number(id) };

    // Invalidate Next.js cache so storefront reflects changes immediately
    revalidateProductsCache();

    // Check if product was restocked from 0 (or explicitly triggered)
    const newStock = body.stock !== undefined ? Number(body.stock) : null;
    const isRestocked =
      shouldForceNotify ||
      (previousStock !== null && previousStock <= 0 && newStock !== null && newStock > 0);

    let restockNotifiedCount = 0;
    if (isRestocked) {
      try {
        console.log(`[Admin Stock Update] Restock detected for #${id}. Triggering waitlist notifications...`);
        const notifyResult = await triggerRestockNotification({
          productId: id,
          productSlug: finalProduct.slug || existingSlug,
        });
        restockNotifiedCount = notifyResult.notifiedCount || 0;
      } catch (notifyErr) {
        console.error("[Admin Stock Update] Restock notification error:", notifyErr);
      }
    }

    return NextResponse.json({
      success: true,
      product: finalProduct,
      restockNotifiedCount,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
      method: "DELETE",
      headers,
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ success: false, error: err }, { status: res.status });
    }

    // Invalidate Next.js cache
    revalidateProductsCache();

    return NextResponse.json({
      success: true,
      message: `Product ${id} deleted successfully.`,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
