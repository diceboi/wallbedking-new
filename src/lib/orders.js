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

/**
 * Generate unique order reference (e.g. WBK-741920)
 */
export function generateOrderNumber() {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `WBK-${randomNum}`;
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
