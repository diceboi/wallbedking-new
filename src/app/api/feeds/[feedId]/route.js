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

// Official Amazon Flat File Column Order
const AMAZON_COLUMNS = [
  "item_sku",
  "external_product_id",
  "external_product_id_type",
  "item_name",
  "brand_name",
  "product_description",
  "bullet_point1",
  "bullet_point2",
  "bullet_point3",
  "bullet_point4",
  "bullet_point5",
  "generic_keywords",
  "main_image_url",
  "other_image_url1",
  "other_image_url2",
  "other_image_url3",
  "other_image_url4",
  "other_image_url5",
  "recommended_browse_nodes",
  "parent_child",
  "parent_sku",
  "relationship_type",
  "variation_theme",
  "size_name",
  "standard_price",
  "currency",
  "quantity",
  "fulfillment_channel",
  "care_instructions",
  "furniture_finish",
  "finish_type",
  "product_type",
  "condition_type",
  "update_delete",
  "warranty_description",
  "safety_warning",
  "country_of_origin",
];

export async function GET(request, { params }) {
  try {
    const { feedId } = await params;
    const { searchParams } = new URL(request.url);
    const format = (searchParams.get("format") || "tsv").toLowerCase();
    const shouldDownload = searchParams.get("download") === "1";

    let items = [];

    // 1. Try Supabase first
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
      // Fallback
    }

    // 2. Fallback to local JSON store
    if (items.length === 0) {
      const jsonPath = path.join(process.cwd(), "src", "data", "feeds", `${feedId}.json`);
      if (fs.existsSync(jsonPath)) {
        const raw = fs.readFileSync(jsonPath, "utf-8");
        items = JSON.parse(raw);
      }
    }

    if (items.length === 0) {
      return NextResponse.json(
        { error: `Feed "${feedId}" not found or contains 0 items.` },
        { status: 404 }
      );
    }

    // JSON Format Output
    if (format === "json") {
      return NextResponse.json({
        feed_id: feedId,
        count: items.length,
        generated_at: new Date().toISOString(),
        items,
      });
    }

    // CSV Format Output
    if (format === "csv") {
      const escapeCsv = (val) => {
        if (val === null || val === undefined) return "";
        const s = String(val).replace(/"/g, '""');
        return `"${s}"`;
      };

      const csvRows = [];
      csvRows.push(AMAZON_COLUMNS.join(","));

      for (const item of items) {
        const line = AMAZON_COLUMNS.map((col) => escapeCsv(item[col]));
        csvRows.push(line.join(","));
      }

      const csvContent = "\uFEFF" + csvRows.join("\r\n"); // UTF-8 BOM
      return new Response(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          ...(shouldDownload && {
            "Content-Disposition": `attachment; filename="${feedId}.csv"`,
          }),
        },
      });
    }

    // TSV Format Output (Official Amazon Inventory Loader / Flat File format)
    const cleanTsv = (val) => {
      if (val === null || val === undefined) return "";
      // Strip newlines and tabs to keep TSV line structure valid
      return String(val).replace(/\r?\n/g, " ").replace(/\t/g, " ");
    };

    const tsvRows = [];
    tsvRows.push(AMAZON_COLUMNS.join("\t"));

    for (const item of items) {
      const line = AMAZON_COLUMNS.map((col) => cleanTsv(item[col]));
      tsvRows.push(line.join("\t"));
    }

    const tsvContent = tsvRows.join("\r\n");
    return new Response(tsvContent, {
      headers: {
        "Content-Type": "text/tab-separated-values; charset=utf-8",
        ...(shouldDownload && {
          "Content-Disposition": `attachment; filename="${feedId}.tsv"`,
        }),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
