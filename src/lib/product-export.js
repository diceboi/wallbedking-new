/**
 * Product Catalog Export Definitions and Utilities
 * Ensures 100% complete column parity with Supabase `products` database table
 * Supports Microsoft Excel, Google Sheets, CSV, and TSV formats
 */

export const PRODUCT_EXPORT_COLUMNS = [
  // 1. Core Identification & Localized Names
  { key: "id", label: "ID" },
  { key: "sku", label: "SKU" },
  { key: "name", label: "Product Name (Default)" },
  { key: "name_en", label: "Name EN (UK)" },
  { key: "name_us", label: "Name US" },
  { key: "name_de", label: "Name DE" },
  { key: "name_fr", label: "Name FR" },
  { key: "name_es", label: "Name ES" },
  { key: "name_por", label: "Name POR" },
  {
    key: "name_pt",
    label: "Name PT",
    getValue: (p) => p.name_pt || p.name_por || p.name || "",
  },
  { key: "name_it", label: "Name IT" },
  { key: "slug", label: "Slug" },

  // 2. Taxonomy & Categorization
  { key: "category", label: "Category Path" },
  { key: "parent_category", label: "Parent Category" },
  { key: "sub_category", label: "Sub Category" },
  { key: "type", label: "Type" },
  { key: "orientation", label: "Orientation" },
  { key: "color", label: "Color" },

  // 3. Technical Specs & Dimensions
  { key: "width", label: "Width (mm)" },
  { key: "length", label: "Length (mm)" },
  { key: "height", label: "Height (mm)" },
  {
    key: "dimensions_cm",
    label: "Dimensions (cm)",
    getValue: (p) =>
      p.width && p.length ? `${Math.round(p.width / 10)}x${Math.round(p.length / 10)}` : "",
  },
  { key: "frame_width", label: "Frame Width (mm)" },
  { key: "folded_up_height", label: "Folded Up Height (mm)" },
  { key: "folded_up_projection", label: "Folded Up Projection (mm)" },
  { key: "folded_down_projection", label: "Folded Down Projection (mm)" },
  { key: "frame_distance_from_ground", label: "Frame Distance From Ground (mm)" },
  { key: "mounting_frame_height", label: "Mounting Frame Height (mm)" },
  { key: "maximum_mattress_depth", label: "Maximum Mattress Depth (mm)" },
  { key: "weight", label: "Weight (kg)" },

  // 4. Inventory, Visibility & Target Markets
  { key: "stock", label: "Stock" },
  { key: "visibility", label: "Visibility" },
  {
    key: "backorder",
    label: "Backorder Allowed",
    getValue: (p) =>
      p.backorder === false || p.backorder === "FALSE" || p.backorder === "false"
        ? "FALSE"
        : "TRUE",
  },
  {
    key: "available_locales",
    label: "Target Countries",
    getValue: (p) => {
      if (Array.isArray(p.available_locales) && p.available_locales.length > 0) {
        return p.available_locales.join(", ");
      }
      if (typeof p.available_locales === "string" && p.available_locales.trim()) {
        return p.available_locales;
      }
      return "ALL (en, us, de, fr, es, por, it)";
    },
  },

  // 5. Pricing, Sales & Fixed Discounts
  { key: "price_gbp", label: "Price GBP" },
  { key: "sale_price_gbp", label: "Sale Price GBP" },
  { key: "sale_fix_gbp", label: "Sale Fix GBP" },
  { key: "price_euro", label: "Price EUR" },
  { key: "sale_price_euro", label: "Sale Price EUR" },
  { key: "sale_fix_euro", label: "Sale Fix EUR" },
  { key: "price_usd", label: "Price USD" },
  { key: "sale_price_usd", label: "Sale Price USD" },
  { key: "sale_fix_usd", label: "Sale Fix USD" },
  { key: "sale_percent", label: "Sale %" },

  // 6. GTIN & Regional Barcodes
  { key: "gtin_en", label: "GTIN EN (UK)" },
  { key: "gtin_us", label: "GTIN US" },
  { key: "gtin_de", label: "GTIN DE" },
  { key: "gtin_fr", label: "GTIN FR" },
  { key: "gtin_es", label: "GTIN ES" },
  { key: "gtin_por", label: "GTIN POR" },
  {
    key: "gtin_pt",
    label: "GTIN PT",
    getValue: (p) => p.gtin_pt || p.gtin_por || p.ean_pt || p.ean || "",
  },
  { key: "gtin_it", label: "GTIN IT" },
  { key: "ean", label: "Master EAN" },
  { key: "ean_uk", label: "Legacy EAN UK" },
  { key: "ean_us", label: "Legacy EAN US" },
  { key: "ean_de", label: "Legacy EAN DE" },
  { key: "ean_fr", label: "Legacy EAN FR" },
  { key: "ean_es", label: "Legacy EAN ES" },
  { key: "ean_it", label: "Legacy EAN IT" },
  { key: "ean_pt", label: "Legacy EAN PT" },

  // 7. Packaging & Dimensions
  { key: "package_dimensions", label: "Package Dimensions" },
  { key: "pack_1", label: "Box 1" },
  { key: "pack_2", label: "Box 2" },
  { key: "pack_3", label: "Box 3" },
  { key: "pack_4", label: "Box 4" },

  // 8. Tags, Warranty & Descriptions
  {
    key: "tags",
    label: "Tags",
    getValue: (p) => (Array.isArray(p.tags) ? p.tags.join(", ") : p.tags || ""),
  },
  { key: "warranty", label: "Warranty" },
  { key: "description", label: "Description" },

  // 9. Media & SEO
  { key: "image", label: "Image URL" },
  { key: "hover_image", label: "Hover Image URL" },
  {
    key: "product_images",
    label: "Gallery Images",
    getValue: (p) =>
      Array.isArray(p.product_images)
        ? p.product_images.join("; ")
        : p.product_images || "",
  },
  { key: "product_image_alt", label: "Product Image Alt" },
  { key: "meta_title", label: "Meta Title" },
  { key: "meta_description", label: "Meta Description" },
  {
    key: "has_3d",
    label: "Has 3D Model",
    getValue: (p) =>
      p.has_3d === true || p.has_3d === "TRUE" || p.has_3d === "true"
        ? "TRUE"
        : "FALSE",
  },

  // 10. Audit Timestamps
  { key: "created_at", label: "Created At" },
  { key: "updated_at", label: "Updated At" },
];

/**
 * RFC-4180 compatible CSV field escaping
 */
export function escapeCsvField(val) {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (
    str.includes(",") ||
    str.includes('"') ||
    str.includes("\n") ||
    str.includes("\r")
  ) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * TSV field escaping (safe for clipboard paste into Excel & Google Sheets)
 */
export function escapeTsvField(val) {
  if (val === null || val === undefined) return "";
  return String(val).replace(/[\t\r\n]+/g, " ");
}

/**
 * Generate UTF-8 CSV string with BOM for Excel/Google Sheets compatibility
 */
export function generateCsvContent(products, columns = PRODUCT_EXPORT_COLUMNS) {
  const headerLine = columns.map((col) => escapeCsvField(col.label)).join(",");
  const rows = products.map((prod) =>
    columns
      .map((col) => {
        const val = col.getValue ? col.getValue(prod) : prod[col.key];
        return escapeCsvField(val);
      })
      .join(",")
  );

  return "\uFEFF" + [headerLine, ...rows].join("\r\n");
}

/**
 * Generate TSV string for instant clipboard copy into Excel/Google Sheets
 */
export function generateTsvContent(products, columns = PRODUCT_EXPORT_COLUMNS) {
  const headerLine = columns.map((col) => escapeTsvField(col.label)).join("\t");
  const rows = products.map((prod) =>
    columns
      .map((col) => {
        const val = col.getValue ? col.getValue(prod) : prod[col.key];
        return escapeTsvField(val);
      })
      .join("\t")
  );

  return [headerLine, ...rows].join("\n");
}
