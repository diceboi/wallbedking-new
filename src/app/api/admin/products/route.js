import { NextResponse } from "next/server";

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
    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const res = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
      method: "POST",
      headers: {
        ...headers,
        Prefer: "return=representation",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ success: false, error: err }, { status: res.status });
    }

    const created = await res.json();
    return NextResponse.json({
      success: true,
      product: created[0] || created,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
