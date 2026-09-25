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

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const orientation = searchParams.get("orientation");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "250", 10);
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
    const enrichedProducts = products.map((item) => {
      const local = catalog.find((c) => c.id === item.id || c.slug === item.slug) || {};
      return { ...local, ...item };
    });

    return NextResponse.json({
      success: true,
      count: enrichedProducts.length,
      products: enrichedProducts,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    // Ensure id is provided or automatically generated from max id
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

    const res = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
      method: "POST",
      headers: {
        ...headers,
        Prefer: "return=representation",
      },
      body: JSON.stringify(body),
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

    // Persist immediately to local products-catalog.json so storefront displays the product
    try {
      const catalogPath = path.join(process.cwd(), "src", "data", "products-catalog.json");
      if (fs.existsSync(catalogPath)) {
        const raw = fs.readFileSync(catalogPath, "utf-8");
        const list = JSON.parse(raw);
        const idx = list.findIndex((p) => String(p.id) === String(newProductRecord.id));
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...newProductRecord };
        } else {
          list.push(newProductRecord);
        }
        fs.writeFileSync(catalogPath, JSON.stringify(list, null, 2), "utf-8");
      }
    } catch (fsErr) {
      console.warn("[Admin Products POST] Could not write to products-catalog.json:", fsErr.message);
    }

    return NextResponse.json({
      success: true,
      product: newProductRecord,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
