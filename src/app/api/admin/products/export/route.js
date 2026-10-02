import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import catalog from "@/data/products-catalog.json";
import { PRODUCT_EXPORT_COLUMNS, generateCsvContent } from "@/lib/product-export";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

function escapeCsvField(val) {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get("ids");
    const category = searchParams.get("category");
    const orientation = searchParams.get("orientation");
    const search = searchParams.get("search");
    const format = searchParams.get("format") || "csv";

    // 1. Fetch products from Supabase with catalog enrichment
    let products = [];
    try {
      let queryUrl = `${SUPABASE_URL}/rest/v1/products?select=*&order=id.asc&limit=1000`;
      if (idsParam) {
        const idList = idsParam
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
          .join(",");
        if (idList) queryUrl += `&id=in.(${idList})`;
      }

      const res = await fetch(queryUrl, { headers, cache: "no-store" });
      if (res.ok) {
        const sbProducts = await res.json();
        products = sbProducts.map((item) => {
          const local = catalog.find((c) => c.id === item.id || c.slug === item.slug) || {};
          return { ...local, ...item };
        });
      }
    } catch (sbErr) {
      console.warn("[Admin Export API] Supabase fetch warning, using local catalog:", sbErr.message);
    }

    if (products.length === 0) {
      products = [...catalog];
      if (idsParam) {
        const idSet = new Set(idsParam.split(",").map((id) => Number(id.trim())));
        products = products.filter((p) => idSet.has(Number(p.id)));
      }
    }

    // Apply filters if provided and not "all"
    if (category && category !== "all") {
      products = products.filter((p) => p.parent_category === category);
    }
    if (orientation && orientation !== "all") {
      products = products.filter((p) => p.orientation === orientation);
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      products = products.filter(
        (p) =>
          String(p.id).includes(q) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.name_en && p.name_en.toLowerCase().includes(q)) ||
          (p.name_us && p.name_us.toLowerCase().includes(q)) ||
          (p.name_de && p.name_de.toLowerCase().includes(q)) ||
          (p.name_fr && p.name_fr.toLowerCase().includes(q)) ||
          (p.name_es && p.name_es.toLowerCase().includes(q)) ||
          (p.name_por && p.name_por.toLowerCase().includes(q)) ||
          (p.name_it && p.name_it.toLowerCase().includes(q)) ||
          (p.slug && p.slug.toLowerCase().includes(q)) ||
          (p.gtin_en && p.gtin_en.toLowerCase().includes(q)) ||
          (p.gtin_us && p.gtin_us.toLowerCase().includes(q)) ||
          (p.gtin_de && p.gtin_de.toLowerCase().includes(q)) ||
          (p.gtin_fr && p.gtin_fr.toLowerCase().includes(q)) ||
          (p.gtin_es && p.gtin_es.toLowerCase().includes(q)) ||
          (p.gtin_por && p.gtin_por.toLowerCase().includes(q)) ||
          (p.gtin_it && p.gtin_it.toLowerCase().includes(q)) ||
          (p.ean && p.ean.toLowerCase().includes(q))
      );
    }

    // Sort by ID ascending
    products.sort((a, b) => Number(a.id || 0) - Number(b.id || 0));

    if (format === "json") {
      return NextResponse.json({
        success: true,
        count: products.length,
        columns: PRODUCT_EXPORT_COLUMNS.map((c) => ({ key: c.key, label: c.label })),
        products,
      });
    }

    // Generate CSV Content with complete columns and UTF-8 BOM
    const csvContent = generateCsvContent(products, PRODUCT_EXPORT_COLUMNS);

    const today = new Date().toISOString().split("T")[0];
    const filename = `wallbedking-products-${today}.csv`;

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[Export API Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
