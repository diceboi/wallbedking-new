import { supabaseAdmin } from "@/lib/supabase";
import { ALL_PRODUCTS, RAW_CATALOG } from "@/data/products";

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
 * Recalculate and validate prices against database or catalog
 */
export async function validateOrderTotals(items = [], deliveryOptionId = "delivery_option_economy", promoCode = "") {
  let subtotal = 0;
  const validatedItems = [];

  for (const item of items) {
    const qty = Math.max(1, parseInt(item.quantity || 1, 10));
    let unitPrice = null;

    // Try finding product in Supabase
    try {
      if (supabaseAdmin) {
        const queryId = item.rawId || item.id;
        const { data: dbProd } = await supabaseAdmin
          .from("products")
          .select("id, price_gbp, sale_price_gbp, name")
          .or(`id.eq.${parseInt(queryId, 10) || 0},slug.eq.${item.slug || ""}`)
          .maybeSingle();

        if (dbProd) {
          unitPrice = dbProd.sale_price_gbp != null ? Number(dbProd.sale_price_gbp) : Number(dbProd.price_gbp);
        }
      }
    } catch {
      // Ignore and fallback
    }

    // Fallback to local catalog if not found in DB
    if (unitPrice == null) {
      const foundInCatalog = RAW_CATALOG?.find(
        (p) => String(p.id) === String(item.rawId || item.id) || p.slug === item.slug
      );
      if (foundInCatalog) {
        unitPrice = foundInCatalog.numericPrice || Number(foundInCatalog.price_gbp) || Number(item.price) || 0;
      } else {
        unitPrice = Number(item.price) || 0;
      }
    }

    const itemTotal = unitPrice * qty;
    subtotal += itemTotal;

    validatedItems.push({
      id: item.id || item.rawId,
      rawId: item.rawId || item.id,
      slug: item.slug || "",
      title: item.title || "Wall Bed King Item",
      image: item.image || "",
      price: unitPrice,
      quantity: qty,
      options: item.options || {},
      itemTotal,
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

  return {
    items: validatedItems,
    subtotal,
    discountAmount,
    promoCode: promo ? normalizedPromo : null,
    delivery: selectedDelivery,
    shippingAmount,
    vatAmount,
    totalAmount,
  };
}
