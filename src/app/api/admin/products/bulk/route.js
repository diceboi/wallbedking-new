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

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      ids,
      action = "update",
      updates = {},
      tagAction,
      tags = [],
      priceAdjustment,
      stockAdjustment,
    } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "No product IDs provided." },
        { status: 400 }
      );
    }

    const catalogPath = path.join(process.cwd(), "src", "data", "products-catalog.json");
    let catalog = [];
    if (fs.existsSync(catalogPath)) {
      try {
        catalog = JSON.parse(fs.readFileSync(catalogPath, "utf-8"));
      } catch (e) {
        console.error("Error reading products-catalog.json:", e);
      }
    }

    // Handle Bulk Delete
    if (action === "delete") {
      const idSet = new Set(ids.map(Number));
      const filtered = catalog.filter((p) => !idSet.has(Number(p.id)));
      fs.writeFileSync(catalogPath, JSON.stringify(filtered, null, 2), "utf-8");

      if (SUPABASE_URL && SERVICE_KEY) {
        try {
          const idListStr = `(${ids.join(",")})`;
          await fetch(`${SUPABASE_URL}/rest/v1/products?id=in.${idListStr}`, {
            method: "DELETE",
            headers,
          });
        } catch (sbErr) {
          console.warn("[Bulk Delete] Supabase error:", sbErr.message);
        }
      }

      return NextResponse.json({
        success: true,
        deletedCount: ids.length,
        message: `${ids.length} products deleted.`,
      });
    }

    // Handle Bulk Updates
    const updatedProducts = [];
    const idSet = new Set(ids.map(Number));

    // Clean updates object (remove null/undefined unless explicitly set)
    const cleanUpdates = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    }
    delete cleanUpdates.id;

    // Apply updates to local catalog
    catalog = catalog.map((p) => {
      if (!idSet.has(Number(p.id))) return p;

      let item = { ...p, ...cleanUpdates };

      // Tag actions
      if (tagAction && Array.isArray(tags)) {
        const currentTags = Array.isArray(item.tags) ? [...item.tags] : [];
        if (tagAction === "replace") {
          item.tags = [...tags];
        } else if (tagAction === "add") {
          item.tags = Array.from(new Set([...currentTags, ...tags]));
        } else if (tagAction === "remove") {
          item.tags = currentTags.filter((t) => !tags.includes(t));
        }
      }

      // Price adjustment (% increase or decrease)
      if (priceAdjustment && priceAdjustment.type === "percent" && priceAdjustment.percent) {
        const multiplier = 1 + Number(priceAdjustment.percent) / 100;
        if (item.price_gbp) item.price_gbp = Math.round(Number(item.price_gbp) * multiplier);
        if (item.price_euro) item.price_euro = Math.round(Number(item.price_euro) * multiplier);
        if (item.price_usd) item.price_usd = Math.round(Number(item.price_usd) * multiplier);

        if (item.sale_price_gbp) item.sale_price_gbp = Math.round(Number(item.sale_price_gbp) * multiplier);
        if (item.sale_price_euro) item.sale_price_euro = Math.round(Number(item.sale_price_euro) * multiplier);
        if (item.sale_price_usd) item.sale_price_usd = Math.round(Number(item.sale_price_usd) * multiplier);
      }

      // Stock adjustment
      if (stockAdjustment) {
        if (stockAdjustment.type === "set" && stockAdjustment.amount !== undefined) {
          item.stock = Math.max(0, Number(stockAdjustment.amount));
        } else if (stockAdjustment.type === "adjust" && stockAdjustment.amount !== undefined) {
          item.stock = Math.max(0, (Number(item.stock) || 0) + Number(stockAdjustment.amount));
        }
      }

      item.updated_at = new Date().toISOString();
      updatedProducts.push(item);
      return item;
    });

    // Save updated local JSON catalog
    fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), "utf-8");

    // Sync updates to Supabase
    let sbSyncedCount = 0;
    if (SUPABASE_URL && SERVICE_KEY && updatedProducts.length > 0) {
      for (const prod of updatedProducts) {
        try {
          const payload = { ...prod };
          delete payload.id;

          let res = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${prod.id}`, {
            method: "PATCH",
            headers: {
              ...headers,
              Prefer: "return=representation",
            },
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            const errTxt = await res.text();
            // Fallback if tags or specific enriched column doesn't exist yet in Supabase
            if (errTxt.includes("does not exist") || errTxt.includes("Could not find")) {
              delete payload.tags;
              delete payload.sku;
              delete payload.ean_uk;
              delete payload.ean_us;
              delete payload.ean_de;
              delete payload.ean_fr;
              delete payload.ean_es;
              delete payload.ean_it;
              delete payload.ean_pt;

              res = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${prod.id}`, {
                method: "PATCH",
                headers,
                body: JSON.stringify(payload),
              });
            }
          }

          if (res.ok) {
            sbSyncedCount++;
          }
        } catch (sbErr) {
          console.warn(`[Bulk Update] Error syncing product #${prod.id} to Supabase:`, sbErr.message);
        }
      }
    }

    return NextResponse.json({
      success: true,
      updatedCount: updatedProducts.length,
      sbSyncedCount,
      products: updatedProducts,
    });
  } catch (error) {
    console.error("[Bulk API Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
