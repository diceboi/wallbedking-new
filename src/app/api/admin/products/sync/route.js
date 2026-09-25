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

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&order=id.asc`, {
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ success: false, error: err }, { status: res.status });
    }

    const dbProducts = await res.json();
    const catalogPath = path.join(process.cwd(), "src", "data", "products-catalog.json");

    let localCatalog = [];
    if (fs.existsSync(catalogPath)) {
      try {
        localCatalog = JSON.parse(fs.readFileSync(catalogPath, "utf-8"));
      } catch (_) {
        localCatalog = [];
      }
    }

    // Merge: for every DB product, update or add to localCatalog
    for (const p of dbProducts) {
      const idx = localCatalog.findIndex((c) => String(c.id) === String(p.id));
      if (idx !== -1) {
        localCatalog[idx] = { ...localCatalog[idx], ...p };
      } else {
        localCatalog.push(p);
      }
    }

    fs.writeFileSync(catalogPath, JSON.stringify(localCatalog, null, 2), "utf-8");

    return NextResponse.json({
      success: true,
      message: `Successfully synchronized ${dbProducts.length} products between Supabase and the storefront catalog.`,
      count: localCatalog.length,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
