// Supported locales and storefront market definitions for WallBedKing

export const LOCALES = ["en", "us", "de", "fr", "es", "por", "it"];
export const DEFAULT_LOCALE = "en";

export const MARKETS = {
  en: {
    code: "en",
    label: "UK",
    name: "English (UK)",
    currency: "GBP",
    currencySymbol: "£",
    countryCode: "GB",
    flag: "🇬🇧",
    defaultShippingNote: "Free UK Mainland Delivery",
  },
  us: {
    code: "us",
    label: "US",
    name: "English (US)",
    currency: "USD",
    currencySymbol: "$",
    countryCode: "US",
    flag: "🇺🇸",
    defaultShippingNote: "US Nationwide Delivery",
  },
  de: {
    code: "de",
    label: "DE",
    name: "Deutsch",
    currency: "EUR",
    currencySymbol: "€",
    countryCode: "DE",
    flag: "🇩🇪",
    defaultShippingNote: "Kostenlose EU-Lieferung",
  },
  fr: {
    code: "fr",
    label: "FR",
    name: "Français",
    currency: "EUR",
    currencySymbol: "€",
    countryCode: "FR",
    flag: "🇫🇷",
    defaultShippingNote: "Livraison gratuite en France",
  },
  es: {
    code: "es",
    label: "ES",
    name: "Español",
    currency: "EUR",
    currencySymbol: "€",
    countryCode: "ES",
    flag: "🇪🇸",
    defaultShippingNote: "Envío gratuito a España",
  },
  por: {
    code: "por",
    label: "POR",
    name: "Português",
    currency: "EUR",
    currencySymbol: "€",
    countryCode: "PT",
    flag: "🇵🇹",
    defaultShippingNote: "Envio gratuito para Portugal",
  },
  it: {
    code: "it",
    label: "IT",
    name: "Italiano",
    currency: "EUR",
    currencySymbol: "€",
    countryCode: "IT",
    flag: "🇮🇹",
    defaultShippingNote: "Spedizione gratuita in Italia",
  },
};

/**
 * Checks if a string is a valid supported locale.
 */
export function isValidLocale(locale) {
  return LOCALES.includes(locale);
}

/**
 * Normalizes locale, handling aliases like 'pt' -> 'por'.
 */
export function normalizeLocale(locale) {
  if (!locale) return DEFAULT_LOCALE;
  const lower = locale.toLowerCase();
  if (lower === "pt") return "por";
  return isValidLocale(lower) ? lower : DEFAULT_LOCALE;
}

/**
 * Formats a monetary amount for the given locale / market.
 */
export function formatPrice(amount, locale = DEFAULT_LOCALE) {
  const normLocale = normalizeLocale(locale);
  const market = MARKETS[normLocale] || MARKETS.en;
  const num = Number(amount) || 0;

  if (market.currency === "GBP") {
    return `£${num.toLocaleString("en-GB")}`;
  }

  if (market.currency === "USD") {
    return `$${num.toLocaleString("en-US")}`;
  }

  // European format: 799 € or €799
  return `${num.toLocaleString("de-DE")} €`;
}

/**
 * Resolves a product's price strictly from backend / Supabase columns.
 * Supports:
 * - Base prices: price_gbp, price_euro, price_usd
 * - Direct sale prices: sale_price_gbp, sale_price_euro, sale_price_usd
 * - Fixed discounts: sale_fix_gbp, sale_fix_euro, sale_fix_usd
 * - Percentage discount: sale_percent
 */
export function getProductPrice(product, locale = DEFAULT_LOCALE) {
  if (!product) {
    return {
      display: "£0",
      raw: 0,
      regularRaw: 0,
      saleRaw: null,
      regularDisplay: "£0",
      saleDisplay: null,
      currency: "GBP",
      isOnSale: false,
      discountPercent: 0,
      discountType: null,
      discountAmount: 0,
      discountLabel: "",
    };
  }

  const normLocale = normalizeLocale(locale);
  const market = MARKETS[normLocale] || MARKETS.en;
  const currency = market.currency; // "GBP", "EUR", "USD"

  // 1. Resolve base regular price strictly from currency columns
  let regularPrice = null;
  let explicitSalePrice = null;
  let fixedDiscount = null;

  if (currency === "USD") {
    regularPrice = product.price_usd != null ? Number(product.price_usd) : null;
    explicitSalePrice = product.sale_price_usd != null ? Number(product.sale_price_usd) : null;
    fixedDiscount = product.sale_fix_usd != null ? Number(product.sale_fix_usd) : null;
  } else if (currency === "EUR") {
    regularPrice = product.price_euro != null ? Number(product.price_euro) : null;
    explicitSalePrice = product.sale_price_euro != null ? Number(product.sale_price_euro) : null;
    fixedDiscount = product.sale_fix_euro != null ? Number(product.sale_fix_euro) : null;
  } else {
    // Default GBP
    regularPrice = product.price_gbp != null ? Number(product.price_gbp) : null;
    explicitSalePrice = product.sale_price_gbp != null ? Number(product.sale_price_gbp) : null;
    fixedDiscount = product.sale_fix_gbp != null ? Number(product.sale_fix_gbp) : null;
  }

  // Fallback if price is not populated yet in that currency in the DB:
  if (regularPrice == null || isNaN(regularPrice)) {
    const rawFallback = product.price_gbp || product.price || product.numericPrice || 799;
    regularPrice = Number(String(rawFallback).replace(/[^0-9.]/g, "")) || 799;
  }

  // 2. Resolve sale price strictly from Supabase discount columns
  let finalSalePrice = null;
  let discountType = null; // "percent" | "fixed"
  let discountAmount = 0;
  const percentDiscount = product.sale_percent != null ? Number(product.sale_percent) : null;

  if (percentDiscount != null && !isNaN(percentDiscount) && percentDiscount > 0 && percentDiscount < 100) {
    // Percentage discount (e.g. sale_percent)
    finalSalePrice = Math.round(regularPrice * (1 - percentDiscount / 100));
    discountType = "percent";
    discountAmount = percentDiscount;
  } else if (fixedDiscount != null && !isNaN(fixedDiscount) && fixedDiscount > 0) {
    // Fixed discount amount (e.g. sale_fix_gbp)
    finalSalePrice = Math.max(0, regularPrice - fixedDiscount);
    discountType = "fixed";
    discountAmount = fixedDiscount;
  } else if (explicitSalePrice != null && !isNaN(explicitSalePrice) && explicitSalePrice > 0 && explicitSalePrice < regularPrice) {
    // Exact sale price set in backend (e.g. sale_price_gbp)
    finalSalePrice = explicitSalePrice;
    if (product.sale_percent != null && Number(product.sale_percent) > 0) {
      discountType = "percent";
      discountAmount = Number(product.sale_percent);
    } else if (fixedDiscount != null && fixedDiscount > 0) {
      discountType = "fixed";
      discountAmount = fixedDiscount;
    } else {
      const diff = regularPrice - finalSalePrice;
      if (diff % 10 === 0) {
        discountType = "fixed";
        discountAmount = diff;
      } else {
        discountType = "percent";
        discountAmount = Math.round((diff / regularPrice) * 100);
      }
    }
  }

  const isOnSale = finalSalePrice != null && finalSalePrice < regularPrice;
  const effectivePrice = isOnSale ? finalSalePrice : regularPrice;

  let discountLabel = "";
  if (isOnSale) {
    if (discountType === "fixed" && discountAmount > 0) {
      discountLabel = `-${formatPrice(discountAmount, normLocale)}`;
    } else if (discountType === "percent" && discountAmount > 0) {
      discountLabel = `-${discountAmount}%`;
    } else {
      const calculatedPct = Math.round(((regularPrice - finalSalePrice) / regularPrice) * 100);
      discountLabel = calculatedPct > 0 ? `-${calculatedPct}%` : "";
    }
  }

  return {
    raw: effectivePrice,
    regularRaw: regularPrice,
    saleRaw: finalSalePrice,
    display: formatPrice(effectivePrice, normLocale),
    regularDisplay: formatPrice(regularPrice, normLocale),
    saleDisplay: isOnSale ? formatPrice(finalSalePrice, normLocale) : null,
    isOnSale,
    discountType,
    discountAmount,
    discountPercent: percentDiscount || (isOnSale ? Math.round(((regularPrice - finalSalePrice) / regularPrice) * 100) : 0),
    discountLabel,
    currency,
  };
}

import { mapUrlToLocale } from "@/data/slugs";

/**
 * Helper to build locale-aware internal links with slug translation.
 * e.g. localizedHref("/products/beds", "de") -> "/de/products/schrankbetten"
 * e.g. localizedHref("/about", "de") -> "/de/ueber-uns"
 */
export function localizedHref(href, locale = DEFAULT_LOCALE) {
  if (!href || typeof href !== "string") return `/${locale}`;
  if (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  ) {
    return href;
  }

  return mapUrlToLocale(href, locale);
}
