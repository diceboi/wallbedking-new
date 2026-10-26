import fs from "fs";
import path from "path";
import { RAW_CATALOG } from "@/data/products";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabaseHeaders = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

const BUNDLES_FILE = path.join(process.cwd(), "src", "data", "bundles.json");

/**
 * Read local fallback bundles.json
 */
export function readLocalBundlesFile() {
  try {
    if (fs.existsSync(BUNDLES_FILE)) {
      const data = fs.readFileSync(BUNDLES_FILE, "utf8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn("[bundles] Warning reading bundles.json:", err.message);
  }
  return [];
}

/**
 * Write to local bundles.json fallback
 */
export function writeLocalBundlesFile(bundles) {
  try {
    fs.writeFileSync(BUNDLES_FILE, JSON.stringify(bundles, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("[bundles] Error writing bundles.json:", err.message);
    return false;
  }
}

/**
 * Fetch product records for a given list of product IDs
 */
export async function fetchProductsForComponents(productIds = []) {
  const ids = Array.from(new Set(productIds.filter(Boolean)));
  if (ids.length === 0) return {};

  const productMap = {};

  // Try Supabase first
  if (SUPABASE_URL && SERVICE_KEY) {
    try {
      const idParam = ids.join(",");
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/products?id=in.(${idParam})&select=*`,
        { headers: supabaseHeaders, cache: "no-store" }
      );
      if (res.ok) {
        const rows = await res.json();
        for (const row of rows) {
          productMap[row.id] = row;
        }
      }
    } catch (err) {
      console.warn("[bundles] Error fetching products from Supabase:", err.message);
    }
  }

  // Fallback to RAW_CATALOG for any missing IDs
  for (const id of ids) {
    if (!productMap[id]) {
      const fallback = RAW_CATALOG?.find((p) => p.id === id || p.id === Number(id));
      if (fallback) {
        productMap[id] = fallback;
      }
    }
  }

  return productMap;
}

/**
 * Calculate live pricing, subtotals, discounts and customer savings
 */
export function calculateBundlePricing(bundle, componentProducts = []) {
  let subtotal_gbp = 0;
  let subtotal_euro = 0;
  let subtotal_usd = 0;

  for (const item of componentProducts) {
    const qty = Math.max(1, item.quantity || 1);
    const prod = item.product || {};

    const priceGbp = Number(prod.price_gbp || prod.price || 0);
    const priceEuro = Number(prod.price_euro || prod.price || 0);
    const priceUsd = Number(prod.price_usd || prod.price || 0);

    subtotal_gbp += priceGbp * qty;
    subtotal_euro += priceEuro * qty;
    subtotal_usd += priceUsd * qty;
  }

  const discountType = bundle.discount_type || "percent";
  const discountPercent = Number(bundle.discount_percent ?? 10);
  const discountFixGbp = Number(bundle.discount_fix_gbp || 0);
  const discountFixEuro = Number(bundle.discount_fix_euro || 0);
  const discountFixUsd = Number(bundle.discount_fix_usd || 0);

  let final_price_gbp = subtotal_gbp;
  let final_price_euro = subtotal_euro;
  let final_price_usd = subtotal_usd;

  let savings_gbp = 0;
  let savings_euro = 0;
  let savings_usd = 0;

  if (discountType === "percent" && discountPercent > 0) {
    savings_gbp = Math.round(subtotal_gbp * (discountPercent / 100));
    savings_euro = Math.round(subtotal_euro * (discountPercent / 100));
    savings_usd = Math.round(subtotal_usd * (discountPercent / 100));

    final_price_gbp = Math.max(0, subtotal_gbp - savings_gbp);
    final_price_euro = Math.max(0, subtotal_euro - savings_euro);
    final_price_usd = Math.max(0, subtotal_usd - savings_usd);
  } else if (discountType === "fixed") {
    savings_gbp = discountFixGbp;
    savings_euro = discountFixEuro;
    savings_usd = discountFixUsd;

    final_price_gbp = Math.max(0, subtotal_gbp - savings_gbp);
    final_price_euro = Math.max(0, subtotal_euro - savings_euro);
    final_price_usd = Math.max(0, subtotal_usd - savings_usd);
  }

  return {
    subtotal_gbp,
    subtotal_euro,
    subtotal_usd,
    final_price_gbp,
    final_price_euro,
    final_price_usd,
    savings_gbp,
    savings_euro,
    savings_usd,
    discount_type: discountType,
    discount_percent: discountPercent,
    discount_fix_gbp: discountFixGbp,
    discount_fix_euro: discountFixEuro,
    discount_fix_usd: discountFixUsd,
  };
}

/**
 * Calculate bundle stock and component health
 * If ANY component is hidden or has stock <= 0, flag it.
 */
export function calculateBundleStockAndHealth(bundle, componentProducts = []) {
  if (!componentProducts || componentProducts.length === 0) {
    return {
      calculated_stock: 0,
      has_hidden_component: false,
      has_zero_stock_component: false,
      is_purchasable: false,
      health_status: "empty",
      reasons: ["No components assigned to bundle"],
    };
  }

  let minStock = Infinity;
  let hasHidden = false;
  let hasZeroStock = false;
  const reasons = [];

  for (const item of componentProducts) {
    const prod = item.product;
    if (!prod) {
      hasHidden = true;
      minStock = 0;
      reasons.push(`Component product ID ${item.product_id} not found in catalog`);
      continue;
    }

    const stock = Number(prod.stock ?? 0);
    const vis = String(prod.visibility || "").toLowerCase().trim();
    const isVisible = vis !== "hidden" && prod.visibility !== false && prod.is_visible !== false;

    if (!isVisible) {
      hasHidden = true;
      reasons.push(`Component "${prod.name}" is hidden in catalog`);
    }

    if (stock <= 0 || prod.in_stock === false) {
      hasZeroStock = true;
      reasons.push(`Component "${prod.name}" is out of stock (Stock: ${stock})`);
    }

    if (stock < minStock) {
      minStock = stock;
    }
  }

  if (minStock === Infinity) minStock = 0;

  const bundleVis = String(bundle.visibility || "").toLowerCase().trim();
  const bundleIsVisible = bundleVis !== "hidden" && bundle.is_visible !== false;

  const isPurchasable = bundleIsVisible && !hasHidden && !hasZeroStock && minStock > 0;

  let healthStatus = "active";
  if (!bundleIsVisible) {
    healthStatus = "bundle_hidden";
  } else if (hasHidden) {
    healthStatus = "component_hidden";
  } else if (hasZeroStock || minStock <= 0) {
    healthStatus = "out_of_stock";
  }

  return {
    calculated_stock: minStock,
    has_hidden_component: hasHidden,
    has_zero_stock_component: hasZeroStock,
    is_purchasable: isPurchasable,
    health_status: healthStatus,
    reasons,
  };
}

/**
 * Enriches a bundle object with live component data, pricing and stock
 */
export function enrichBundleWithProducts(bundle, productMap = {}) {
  const items = (bundle.items || []).map((item) => {
    const prod = productMap[item.product_id] || null;
    return {
      product_id: item.product_id,
      quantity: Number(item.quantity || 1),
      is_required: item.is_required !== false,
      sort_order: Number(item.sort_order || 0),
      product: prod,
    };
  });

  const pricing = calculateBundlePricing(bundle, items);
  const health = calculateBundleStockAndHealth(bundle, items);

  return {
    ...bundle,
    items,
    pricing,
    health,
    // Top-level helpers for quick consumption
    calculated_price_gbp: pricing.final_price_gbp,
    calculated_price_euro: pricing.final_price_euro,
    calculated_price_usd: pricing.final_price_usd,
    calculated_subtotal_gbp: pricing.subtotal_gbp,
    calculated_subtotal_euro: pricing.subtotal_euro,
    calculated_subtotal_usd: pricing.subtotal_usd,
    calculated_savings_gbp: pricing.savings_gbp,
    calculated_savings_euro: pricing.savings_euro,
    calculated_savings_usd: pricing.savings_usd,
    calculated_stock: health.calculated_stock,
    is_purchasable: health.is_purchasable,
    has_hidden_component: health.has_hidden_component,
    has_zero_stock_component: health.has_zero_stock_component,
  };
}

/**
 * Load all bundles with full enrichment
 */
export async function getAllEnrichedBundles({ includeHidden = true } = {}) {
  let rawBundles = [];
  let isFromSupabase = false;

  // 1. Try Supabase
  if (SUPABASE_URL && SERVICE_KEY) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/bundles?select=*,bundle_items(*)&order=sort_order.asc,id.asc`,
        { headers: supabaseHeaders, cache: "no-store" }
      );
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows)) {
          isFromSupabase = true;
          rawBundles = rows.map((b) => ({
            ...b,
            items: (b.bundle_items || []).map((bi) => ({
              product_id: bi.product_id,
              quantity: bi.quantity || 1,
              is_required: bi.is_required !== false,
              sort_order: bi.sort_order || 0,
            })),
          }));
        }
      }
    } catch (err) {
      console.warn("[bundles] Supabase query notice:", err.message);
    }
  }

  // 2. Fallback to local bundles.json if Supabase table not created or query failed
  if (!isFromSupabase || rawBundles.length === 0) {
    rawBundles = readLocalBundlesFile();
  }

  // Collect all referenced product IDs
  const allProductIds = [];
  for (const b of rawBundles) {
    for (const it of b.items || []) {
      if (it.product_id) allProductIds.push(it.product_id);
    }
  }

  const productMap = await fetchProductsForComponents(allProductIds);

  let enriched = rawBundles.map((b) => enrichBundleWithProducts(b, productMap));

  if (!includeHidden) {
    // Only return bundles that are visible and have no hidden components
    enriched = enriched.filter(
      (b) =>
        b.visibility !== "Hidden" &&
        b.is_visible !== false &&
        !b.has_hidden_component
    );
  }

  return enriched;
}

/**
 * Get single enriched bundle by slug
 */
export async function getEnrichedBundleBySlug(slug, { includeHidden = true } = {}) {
  const bundles = await getAllEnrichedBundles({ includeHidden });
  return bundles.find((b) => b.slug === slug) || null;
}
