import { supabaseAdmin } from "@/lib/supabase";
import { ALL_PRODUCTS, RAW_CATALOG } from "@/data/products";
import { calculateSofaPrice } from "@/lib/products";

export const DELIVERY_OPTIONS = {
  delivery_option_economy: {
    id: "delivery_option_economy",
    label: "Free delivery",
    cost: 0,
    message: "Delivery within 2 - 4 weeks",
  },
  delivery_option_standard: {
    id: "delivery_option_standard",
    label: "Standard delivery",
    cost: 49,
    message: "Delivery within 1 - 2 weeks",
  },
  delivery_option_express: {
    id: "delivery_option_express",
    label: "Express delivery",
    cost: 79,
    message: "Delivery within 2 - 5 working days",
  },
  delivery_option_pickup: {
    id: "delivery_option_pickup",
    label: "Warehouse Collection",
    cost: 0,
    address: "Wall Bed King, Harlow, CM20 2HU. Mon - Fri, 10am - 4pm.",
    message: "To be collected from our warehouse in Harlow, CM20 2HU.",
  },
};

export const PROMO_CODES = {
  WBK10: { type: "percent", value: 10, label: "10% Welcome Discount" },
  SAVE50: { type: "fixed", value: 50, label: "£50 Off Orders" },
  FREEDELIVERY: { type: "fixed", value: 0, label: "Free UK Delivery" },
};

const LEGACY_RANDOM_IDS = new Set([
  "WBK-170692", "WBK-837390", "WBK-289712", "WBK-848749",
  "WBK-435497", "WBK-435336", "WBK-811614", "WBK-844907",
  "WBK-665523", "WBK-842190", "WBK-629511"
]);

/**
 * Generate sequential order reference starting from WBK-1000 (e.g. WBK-1000, WBK-1001...)
 */
export async function generateOrderNumber() {
  const START_NUMBER = 1000;
  try {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("orders")
        .select("id")
        .like("id", "WBK-%");

      if (!error && Array.isArray(data) && data.length > 0) {
        let maxSequential = 0;
        for (const row of data) {
          if (!row?.id) continue;
          const match = row.id.match(/^WBK-(\d+)$/);
          if (match) {
            const num = parseInt(match[1], 10);
            // Sequential orders start at 1000. Ignore legacy 6-digit random orders.
            if (num >= START_NUMBER && (num < 100000 || !LEGACY_RANDOM_IDS.has(row.id))) {
              if (num > maxSequential) {
                maxSequential = num;
              }
            }
          }
        }

        if (maxSequential >= START_NUMBER) {
          return `WBK-${maxSequential + 1}`;
        }
      }
    }
  } catch (err) {
    console.error("[generateOrderNumber] Error querying sequential orders:", err);
  }

  return `WBK-${START_NUMBER}`;
}

/**
 * Helper to resolve product identifier (id and slug) from cart item
 */
export function resolveProductIdentifiers(item) {
  let numericId = null;
  let slug = item.slug || null;

  for (const field of [item.rawId, item.productId, item.id]) {
    if (typeof field === "number" && field > 0) {
      numericId = field;
      break;
    }
    if (typeof field === "string") {
      const clean = field.replace(/^wbk-/i, "");
      if (/^\d+$/.test(clean)) {
        numericId = parseInt(clean, 10);
        break;
      }
    }
  }

  if (!slug && typeof item.productId === "string" && !/^\d+$/.test(item.productId)) {
    slug = item.productId.replace(/^wbk-/i, "");
  }

  if (!numericId || !slug) {
    const found = RAW_CATALOG?.find((p) => {
      if (numericId && p.id === numericId) return true;
      if (slug && p.slug === slug) return true;
      if (typeof item.id === "string" && p.slug && (item.id === p.slug || item.id.startsWith(p.slug + "-"))) return true;
      if (typeof item.rawId === "string" && p.slug && item.rawId === p.slug) return true;
      return false;
    });
    if (found) {
      if (!numericId) numericId = found.id;
      if (!slug) slug = found.slug;
    }
  }

  return { numericId, slug };
}

/**
 * Recalculate and validate prices against database or catalog strictly matching the requested currency
 */
export async function validateOrderTotals(
  items = [],
  deliveryOptionId = "delivery_option_economy",
  promoCode = "",
  targetCurrency = "GBP",
  targetLocale = "en"
) {
  let subtotal = 0;
  const validatedItems = [];
  const curr = String(targetCurrency || (targetLocale === "us" ? "USD" : (targetLocale === "en" ? "GBP" : "EUR"))).toUpperCase();

  for (const item of items) {
    const qty = Math.max(1, parseInt(item.quantity || 1, 10));
    const { numericId, slug } = resolveProductIdentifiers(item);
    let dbProd = null;

    // 1. Try finding product in Supabase directly
    try {
      if (supabaseAdmin && (numericId || slug)) {
        const orClauses = [];
        if (numericId) orClauses.push(`id.eq.${numericId}`);
        if (slug) orClauses.push(`slug.eq.${slug}`);

        const { data } = await supabaseAdmin
          .from("products")
          .select("id, slug, name, price_gbp, price_euro, price_usd, sale_price_gbp, sale_price_euro, sale_price_usd, sale_percent, sale_fix_gbp, sale_fix_euro, sale_fix_usd, stock, in_stock, visibility, is_visible")
          .or(orClauses.join(","))
          .maybeSingle();

        if (data) {
          dbProd = data;
        }
      }
    } catch (err) {
      console.warn("[validateOrderTotals] Supabase query notice:", err?.message);
    }

    // 2. Fallback to local catalog if not found in DB
    const prodSource = dbProd || RAW_CATALOG?.find(
      (p) => (numericId && p.id === numericId) || (slug && p.slug === slug)
    );

    let unitPrice = 0;

    if (prodSource) {
      let regularPrice = null;
      let explicitSalePrice = null;
      let fixedDiscount = null;

      if (curr === "USD") {
        regularPrice = prodSource.price_usd != null ? Number(prodSource.price_usd) : null;
        explicitSalePrice = prodSource.sale_price_usd != null ? Number(prodSource.sale_price_usd) : null;
        fixedDiscount = prodSource.sale_fix_usd != null ? Number(prodSource.sale_fix_usd) : null;
      } else if (curr === "EUR") {
        regularPrice = prodSource.price_euro != null ? Number(prodSource.price_euro) : null;
        explicitSalePrice = prodSource.sale_price_euro != null ? Number(prodSource.sale_price_euro) : null;
        fixedDiscount = prodSource.sale_fix_euro != null ? Number(prodSource.sale_fix_euro) : null;
      } else {
        regularPrice = prodSource.price_gbp != null ? Number(prodSource.price_gbp) : null;
        explicitSalePrice = prodSource.sale_price_gbp != null ? Number(prodSource.sale_price_gbp) : null;
        fixedDiscount = prodSource.sale_fix_gbp != null ? Number(prodSource.sale_fix_gbp) : null;
      }

      // Fallback if price is not populated yet in that currency in DB
      if (regularPrice == null || isNaN(regularPrice) || regularPrice <= 0) {
        regularPrice = Number(prodSource.price_gbp) || Number(prodSource.numericPrice) || Number(item.price) || 0;
      }

      let finalPrice = regularPrice;
      const percentDiscount = prodSource.sale_percent != null ? Number(prodSource.sale_percent) : null;

      if (percentDiscount != null && !isNaN(percentDiscount) && percentDiscount > 0 && percentDiscount < 100) {
        finalPrice = Math.round(regularPrice * (1 - percentDiscount / 100));
      } else if (fixedDiscount != null && !isNaN(fixedDiscount) && fixedDiscount > 0) {
        finalPrice = Math.max(0, regularPrice - fixedDiscount);
      } else if (explicitSalePrice != null && !isNaN(explicitSalePrice) && explicitSalePrice > 0 && explicitSalePrice < regularPrice) {
        finalPrice = explicitSalePrice;
      }

      // Morphy sofa surcharge if included
      const isSofaIncluded = Boolean(item.options?.sofaIncluded);
      let sofaSurcharge = 0;
      if (isSofaIncluded) {
        sofaSurcharge = calculateSofaPrice(
          prodSource || item,
          item.options?.orientation,
          item.options?.size
        );
      }

      unitPrice = finalPrice + sofaSurcharge;
    } else {
      // Custom or modular items not in products catalog (e.g. modular sofa components)
      unitPrice = Math.max(0, Number(item.price) || 0);
    }

    const itemTotal = unitPrice * qty;
    subtotal += itemTotal;

    const isHidden =
      prodSource &&
      (String(prodSource.visibility || "").toLowerCase() === "hidden" ||
        prodSource.visibility === false ||
        prodSource.is_visible === false);

    const isStockZero =
      prodSource &&
      ((prodSource.stock !== undefined &&
        prodSource.stock !== null &&
        Number(prodSource.stock) <= 0) ||
        prodSource.in_stock === false);

    const isOutOfStock = Boolean(isHidden || isStockZero);

    validatedItems.push({
      id: item.id || (numericId ? `wbk-${numericId}` : slug),
      rawId: numericId || item.rawId || item.id,
      slug: slug || item.slug || "",
      title: item.title || prodSource?.name || "Wall Bed King Item",
      image: item.image || prodSource?.image || "",
      price: unitPrice,
      quantity: qty,
      options: item.options || {},
      itemTotal,
      isOutOfStock,
      stock: prodSource?.stock ?? null,
    });
  }

  // Calculate discount
  let discountAmount = 0;
  const normalizedPromo = (promoCode || "").toUpperCase().trim();
  const promo = PROMO_CODES[normalizedPromo];
  if (promo) {
    if (promo.type === "percent") {
      discountAmount = Math.round((subtotal * (promo.value / 100)) * 100) / 100;
    } else if (promo.type === "fixed") {
      discountAmount = Math.min(subtotal, promo.value);
    }
  }

  // Calculate delivery
  const selectedDelivery = DELIVERY_OPTIONS[deliveryOptionId] || DELIVERY_OPTIONS.delivery_option_economy;
  const shippingAmount = selectedDelivery.cost;

  const totalAmount = Math.max(0, Math.round((subtotal - discountAmount + shippingAmount) * 100) / 100);
  const vatAmount = Math.round((totalAmount / 6) * 100) / 100; // 20% included UK VAT is 1/6th of gross

  const hasOutOfStockItems = validatedItems.some((it) => it.isOutOfStock);
  const outOfStockItems = validatedItems.filter((it) => it.isOutOfStock);

  return {
    items: validatedItems,
    hasOutOfStockItems,
    outOfStockItems,
    subtotal,
    discountAmount,
    promoCode: promo ? normalizedPromo : null,
    delivery: selectedDelivery,
    shippingAmount,
    vatAmount,
    totalAmount,
    currency: curr,
  };
}
