import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

export async function GET(request, { params }) {
  try {
    const { feedId } = await params;
    let items = [];

    // 1. Try Supabase
    try {
      if (SUPABASE_URL && SERVICE_KEY) {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/marketplace_feed_items?feed_id=eq.${encodeURIComponent(feedId)}&order=row_number.asc`,
          { headers, cache: "no-store" }
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            items = data;
          }
        }
      }
    } catch (dbErr) {
      // fallback
    }

    // 2. Fallback to local JSON
    const jsonPath = path.join(process.cwd(), "src", "data", "feeds", `${feedId}.json`);
    if (items.length === 0 && fs.existsSync(jsonPath)) {
      const raw = fs.readFileSync(jsonPath, "utf-8");
      items = JSON.parse(raw);
    }

    const parents = items.filter((p) => p.parent_child === "parent");
    const children = items.filter((p) => p.parent_child === "child");

    return NextResponse.json({
      success: true,
      feed_id: feedId,
      total: items.length,
      parentCount: parents.length,
      childCount: children.length,
      items,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { feedId } = await params;
    const body = await request.json();

    if (!body.item_sku) {
      return NextResponse.json({ success: false, error: "item_sku is required." }, { status: 400 });
    }

    const jsonPath = path.join(process.cwd(), "src", "data", "feeds", `${feedId}.json`);
    let items = [];
    if (fs.existsSync(jsonPath)) {
      items = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    }

    const newItem = {
      id: `item_${Date.now()}`,
      feed_id: feedId,
      updated_at: new Date().toISOString(),
      ...body,
    };

    items.push(newItem);
    fs.writeFileSync(jsonPath, JSON.stringify(items, null, 2), "utf-8");

    // Also attempt Supabase insert if configured
    try {
      if (SUPABASE_URL && SERVICE_KEY) {
        await fetch(`${SUPABASE_URL}/rest/v1/marketplace_feed_items`, {
          method: "POST",
          headers,
          body: JSON.stringify(newItem),
        });
      }
    } catch (e) {}

    return NextResponse.json({ success: true, item: newItem });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
