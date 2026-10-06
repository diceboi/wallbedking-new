import { NextResponse } from "next/server";
import { revalidateProductsCache } from "@/lib/products-db";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

const ALLOWED_SUPABASE_COLUMNS = new Set([
  "id", "ean", "name", "slug", "width", "length", "height", "frame_width",
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

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const orientation = searchParams.get("orientation");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "1000", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    let queryUrl = `${SUPABASE_URL}/rest/v1/products?select=*&order=id.asc&limit=${limit}&offset=${offset}`;

    if (category && category !== "all") {
      queryUrl += `&parent_category=eq.${encodeURIComponent(category)}`;
    }
    if (orientation && orientation !== "all") {
      queryUrl += `&orientation=eq.${encodeURIComponent(orientation)}`;
    }
    if (search && search.trim()) {
      queryUrl += `&name=ilike.*${encodeURIComponent(search.trim())}*`;
    }

    const res = await fetch(queryUrl, {
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ success: false, error: err }, { status: res.status });
    }

    const products = await res.json();
    const formattedProducts = products.map((item) => ({
      ...item,
      hoverImage: item.hoverImage || item.hover_image,
      available_locales:
        Array.isArray(item.available_locales) && item.available_locales.length > 0
          ? item.available_locales
          : ["en", "us", "de", "fr", "es", "por", "it"],
      tags: Array.isArray(item.tags) ? item.tags : [],
    }));

    return NextResponse.json({
      success: true,
      count: formattedProducts.length,
      products: formattedProducts,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    // Ensure id is provided or automatically generated from max id in database
    if (!body.id) {
      try {
        const maxRes = await fetch(
          `${SUPABASE_URL}/rest/v1/products?select=id&order=id.desc&limit=1`,
          { headers, cache: "no-store" }
        );
        if (maxRes.ok) {
          const rows = await maxRes.json();
          const maxId = rows?.[0]?.id ? Number(rows[0].id) : 0;
          body.id = maxId + 1;
        } else {
          body.id = Math.floor(Date.now() / 1000);
        }
      } catch (idErr) {
        console.warn("[Admin Products POST] ID query warning:", idErr.message);
        body.id = Math.floor(Date.now() / 1000);
      }
    }

    // Ensure slug is clean
    if (!body.slug && body.name) {
      body.slug = body.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }

    // Sanitize payload against Supabase schema columns
    const payload = {};
    for (const [key, val] of Object.entries(body)) {
      if (ALLOWED_SUPABASE_COLUMNS.has(key) && val !== undefined) {
        payload[key] = val;
      }
    }
    if (body.hoverImage && !payload.hover_image) {
      payload.hover_image = body.hoverImage;
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
      method: "POST",
      headers: {
        ...headers,
        Prefer: "return=representation",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      let errMsg = errText;
      try {
        const errObj = JSON.parse(errText);
        errMsg = errObj.message || errObj.details || errText;
      } catch (_) {}
      return NextResponse.json({ success: false, error: errMsg }, { status: res.status });
    }

    const created = await res.json();
    const newProductRecord = created[0] || created;

    // Invalidate storefront cache so new product appears immediately
    revalidateProductsCache();

    return NextResponse.json({
      success: true,
      product: newProductRecord,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
