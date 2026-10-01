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
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          (p.slug && p.slug.toLowerCase().includes(q))
      );
    }

    // Sort by ID ascending
    products.sort((a, b) => Number(a.id || 0) - Number(b.id || 0));

    if (format === "json") {
      return NextResponse.json({
        success: true,
        count: products.length,
        products,
      });
    }

    // Define CSV Headers
    const columns = [
      { key: "id", label: "ID" },
      { key: "sku", label: "SKU" },
      { key: "name", label: "Product Name" },
      { key: "slug", label: "Slug" },
      { key: "parent_category", label: "Category" },
      { key: "sub_category", label: "Sub Category" },
      { key: "type", label: "Type" },
      { key: "orientation", label: "Orientation" },
      { key: "width", label: "Width (mm)" },
      { key: "length", label: "Length (mm)" },
      {
        key: "dimensions_cm",
        label: "Dimensions (cm)",
        getValue: (p) =>
          p.width && p.length ? `${Math.round(p.width / 10)}x${Math.round(p.length / 10)}` : "",
      },
      { key: "weight", label: "Weight (kg)" },
      { key: "stock", label: "Stock" },
      { key: "visibility", label: "Visibility" },
      {
        key: "available_locales",
        label: "Target Countries",
        getValue: (p) =>
          Array.isArray(p.available_locales) && p.available_locales.length > 0
            ? p.available_locales.join(", ")
            : "ALL (en, us, de, fr, es, por, it)",
      },
      { key: "price_gbp", label: "Price GBP" },
      { key: "sale_price_gbp", label: "Sale Price GBP" },
      { key: "price_euro", label: "Price EUR" },
      { key: "sale_price_euro", label: "Sale Price EUR" },
      { key: "price_usd", label: "Price USD" },
      { key: "sale_price_usd", label: "Sale Price USD" },
      { key: "sale_percent", label: "Sale %" },
      { key: "ean", label: "Master EAN" },
      { key: "ean_uk", label: "EAN UK" },
      { key: "ean_us", label: "EAN US" },
      { key: "ean_de", label: "EAN DE" },
      { key: "ean_fr", label: "EAN FR" },
      { key: "ean_es", label: "EAN ES" },
      { key: "ean_it", label: "EAN IT" },
      { key: "ean_pt", label: "EAN PT" },
      { key: "package_dimensions", label: "Package Dimensions" },
      { key: "pack_1", label: "Box 1" },
      { key: "pack_2", label: "Box 2" },
      { key: "pack_3", label: "Box 3" },
      { key: "pack_4", label: "Box 4" },
      {
        key: "tags",
        label: "Tags",
        getValue: (p) => (Array.isArray(p.tags) ? p.tags.join(", ") : ""),
      },
      { key: "warranty", label: "Warranty" },
      { key: "image", label: "Image URL" },
      { key: "description", label: "Description" },
      { key: "created_at", label: "Created At" },
      { key: "updated_at", label: "Updated At" },
    ];

    const headerLine = columns.map((col) => escapeCsvField(col.label)).join(",");
    const rows = products.map((prod) => {
      return columns
        .map((col) => {
          const val = col.getValue ? col.getValue(prod) : prod[col.key];
          return escapeCsvField(val);
        })
        .join(",");
    });

    // UTF-8 BOM (\uFEFF) ensures proper character rendering in Microsoft Excel & Google Sheets
    const csvContent = "\uFEFF" + [headerLine, ...rows].join("\r\n");

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
