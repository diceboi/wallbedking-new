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

export async function PATCH(request, { params }) {
  try {
    const { feedId, sku } = await params;
    const body = await request.json();

    const decodedSku = decodeURIComponent(sku);
    const jsonPath = path.join(process.cwd(), "src", "data", "feeds", `${feedId}.json`);

    if (!fs.existsSync(jsonPath)) {
      return NextResponse.json({ success: false, error: "Feed not found" }, { status: 404 });
    }

    const items = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    const idx = items.findIndex((p) => p.item_sku === decodedSku);

    if (idx === -1) {
      return NextResponse.json({ success: false, error: `Item "${decodedSku}" not found in feed.` }, { status: 404 });
    }

    items[idx] = {
      ...items[idx],
      ...body,
      updated_at: new Date().toISOString(),
    };

    fs.writeFileSync(jsonPath, JSON.stringify(items, null, 2), "utf-8");

    // Also attempt Supabase update
    try {
      if (SUPABASE_URL && SERVICE_KEY) {
        await fetch(
          `${SUPABASE_URL}/rest/v1/marketplace_feed_items?feed_id=eq.${encodeURIComponent(feedId)}&item_sku=eq.${encodeURIComponent(decodedSku)}`,
          {
            method: "PATCH",
            headers,
            body: JSON.stringify(items[idx]),
          }
        );
      }
    } catch (dbErr) {}

    return NextResponse.json({ success: true, item: items[idx] });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { feedId, sku } = await params;
    const decodedSku = decodeURIComponent(sku);
    const jsonPath = path.join(process.cwd(), "src", "data", "feeds", `${feedId}.json`);

    if (!fs.existsSync(jsonPath)) {
      return NextResponse.json({ success: false, error: "Feed not found" }, { status: 404 });
    }

    let items = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    items = items.filter((p) => p.item_sku !== decodedSku);

    fs.writeFileSync(jsonPath, JSON.stringify(items, null, 2), "utf-8");

    // Also attempt Supabase delete
    try {
      if (SUPABASE_URL && SERVICE_KEY) {
        await fetch(
          `${SUPABASE_URL}/rest/v1/marketplace_feed_items?feed_id=eq.${encodeURIComponent(feedId)}&item_sku=eq.${encodeURIComponent(decodedSku)}`,
          {
            method: "DELETE",
            headers,
          }
        );
      }
    } catch (e) {}

    return NextResponse.json({ success: true, message: `Item "${decodedSku}" deleted.` });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
