"use client";

export const GTM_ID_UK = process.env.NEXT_PUBLIC_GTM_ID_UK || "GTM-NF5VPKX";
export const GTM_ID_EU = process.env.NEXT_PUBLIC_GTM_ID_EU || "GTM-WBV7QDZL";
export const GTM_ID_US = process.env.NEXT_PUBLIC_GTM_ID_US || "GTM-NFQT94XD";
export const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID || "G-G6BY900NX4";
export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "AW-1027644124";
export const GOOGLE_ADS_ID_FR = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID_FR || "AW-16657832054";
export const GOOGLE_ADS_CONV_LABEL_UK = "AW-1027644124/gxpBCL3v2XMQ3LWC6gM";
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "1241080515923812";

/**
 * Get GTM Container ID for the current locale/market
 */
export function getGtmContainerId(locale = "en") {
  if (locale === "us") return GTM_ID_US;
  if (locale === "en") return GTM_ID_UK;
  return GTM_ID_EU;
}

/**
 * SHA-256 hash helper for browser environment (used for Google Ads Enhanced Conversions)
 */
async function hashEmailBrowser(email) {
  if (!email || typeof window === "undefined" || !window.crypto?.subtle) return "";
  try {
    const msgBuffer = new TextEncoder().encode(email.trim().toLowerCase());
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return "";
  }
}

/**
 * Update Google Consent Mode v2 and Meta Pixel consent
 */
export function updateConsent({ analytics = false, marketing = false }) {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function () {
      window.dataLayer.push(arguments);
    };

  // Google Consent Mode v2 Update
  window.gtag("consent", "update", {
    ad_storage: marketing ? "granted" : "denied",
    ad_user_data: marketing ? "granted" : "denied",
    ad_personalization: marketing ? "granted" : "denied",
    analytics_storage: analytics ? "granted" : "denied",
  });

  // Meta Pixel Consent Update
  if (typeof window.fbq === "function") {
    window.fbq("consent", marketing ? "grant" : "revoke");
  }

  // Notify GTM listeners of consent change
  window.dataLayer.push({
    event: "consent_update",
    consent_analytics: analytics,
    consent_marketing: marketing,
  });
}

/**
 * Track PageView event
 */
export function trackPageView(url = "") {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "page_view",
    page_path: url || window.location.pathname,
  });

  if (typeof window.fbq === "function") {
    window.fbq("track", "PageView");
  }
}

/**
 * Track Product View (GA4 `view_item` + Meta `ViewContent`)
 */
export function trackViewItem({
  id = "",
  name = "",
  category = "",
  variant = "",
  price = 0,
  currency = "EUR",
}) {
  if (typeof window === "undefined") return;

  const itemPrice = Number(price) || 0;
  const sku = id.startsWith("SKU_") ? id : `SKU_${id}`;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "view_item",
    ecommerce: {
      currency: currency.toUpperCase(),
      value: itemPrice,
      items: [
        {
          item_id: sku,
          item_name: name,
          item_category: category,
          item_variant: variant,
          price: itemPrice,
          quantity: 1,
        },
      ],
    },
  });

  if (typeof window.fbq === "function") {
    window.fbq("track", "ViewContent", {
      content_name: name,
      content_category: category,
      content_ids: [sku],
      content_type: "product",
      value: itemPrice,
      currency: currency.toUpperCase(),
    });
  }
}

/**
 * Track Add to Cart (GA4 `add_to_cart` + Meta `AddToCart`)
 */
export function trackAddToCart({
  id = "",
  name = "",
  category = "",
  variant = "",
  price = 0,
  quantity = 1,
  currency = "EUR",
}) {
  if (typeof window === "undefined") return;

  const itemPrice = Number(price) || 0;
  const itemQty = Number(quantity) || 1;
  const sku = id.startsWith("SKU_") ? id : `SKU_${id}`;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "add_to_cart",
    ecommerce: {
      currency: currency.toUpperCase(),
      value: itemPrice * itemQty,
      items: [
        {
          item_id: sku,
          item_name: name,
          item_category: category,
          item_variant: variant,
          price: itemPrice,
          quantity: itemQty,
        },
      ],
    },
  });

  if (typeof window.fbq === "function") {
    window.fbq("track", "AddToCart", {
      content_name: name,
      content_category: category,
      content_ids: [sku],
      content_type: "product",
      value: itemPrice * itemQty,
      currency: currency.toUpperCase(),
    });
  }
}

/**
 * Track Remove from Cart (GA4 `remove_from_cart`)
 */
export function trackRemoveFromCart({
  id = "",
  name = "",
  price = 0,
  quantity = 1,
  currency = "EUR",
}) {
  if (typeof window === "undefined") return;

  const itemPrice = Number(price) || 0;
  const itemQty = Number(quantity) || 1;
  const sku = id.startsWith("SKU_") ? id : `SKU_${id}`;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "remove_from_cart",
    ecommerce: {
      currency: currency.toUpperCase(),
      value: itemPrice * itemQty,
      items: [
        {
          item_id: sku,
          item_name: name,
          price: itemPrice,
          quantity: itemQty,
        },
      ],
    },
  });
}

/**
 * Track Purchase (GA4 `purchase` + Meta `Purchase` + Google Ads Conversion)
 */
export async function trackPurchase({
  orderId = "",
  total = 0,
  currency = "EUR",
  items = [],
  email = "",
  locale = "en",
}) {
  if (typeof window === "undefined" || !orderId) return;

  const numTotal = Number(total) || 0;
  const upperCurrency = currency.toUpperCase();
  const hashedEmail = await hashEmailBrowser(email);

  // Normalize items array to GA4 standard
  const formattedItems = (items || []).map((it) => ({
    item_id: String(it.id || it.productId || "").startsWith("SKU_")
      ? String(it.id || it.productId)
      : `SKU_${it.id || it.productId || "WBK"}`,
    item_name: it.title || it.name || "Wall Bed King Product",
    item_category: it.options?.type || it.category || "Wall Bed",
    item_variant: it.options?.size || it.variant || "",
    price: Number(it.price) || 0,
    quantity: Number(it.quantity) || 1,
    affiliation: locale.toUpperCase(),
  }));

  // 1. GA4 & GTM Ecommerce Purchase
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "purchase",
    ecommerce: {
      transaction_id: String(orderId),
      value: numTotal,
      currency: upperCurrency,
      items: formattedItems,
    },
    sha256ConversionMail: hashedEmail || undefined,
  });

  // 2. Meta Pixel Purchase (deduplicated via eventID)
  if (typeof window.fbq === "function") {
    window.fbq(
      "track",
      "Purchase",
      {
        value: numTotal,
        currency: upperCurrency,
        content_type: "product",
        contents: formattedItems.map((i) => ({
          id: i.item_id,
          quantity: i.quantity,
          item_price: i.price,
        })),
      },
      {
        eventID: String(orderId),
      }
    );
  }

  // 3. Google Ads Conversion Event
  if (typeof window.gtag === "function") {
    const sendTo =
      locale === "fr"
        ? `${GOOGLE_ADS_ID_FR}/purchase`
        : GOOGLE_ADS_CONV_LABEL_UK;

    window.gtag("event", "conversion", {
      send_to: sendTo,
      value: numTotal,
      currency: upperCurrency,
      transaction_id: String(orderId),
    });
  }
}
