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

/**
 * Helper to resolve country-specific EAN barcode with fallback to default EAN.
 */
export function getProductEan(product, locale = DEFAULT_LOCALE) {
  if (!product) return "";
  const norm = normalizeLocale(locale);

  switch (norm) {
    case "us":
      return product.ean_us || product.ean || "";
    case "de":
      return product.ean_de || product.ean || "";
    case "fr":
      return product.ean_fr || product.ean || "";
    case "es":
      return product.ean_es || product.ean || "";
    case "it":
      return product.ean_it || product.ean || "";
    case "por":
    case "pt":
      return product.ean_pt || product.ean_por || product.ean || "";
    case "en":
    default:
      return product.ean_uk || product.ean_gb || product.ean || "";
  }
}

/**
 * Imperial vs Metric formatters for US locale
 */
export function formatSizeLabel(label, locale = "en") {
  if (!label || locale !== "us") return label;
  if (label.includes('"')) return label;

  // 1a. Parenthesized range of 2D sizes, e.g. '(76x190 - 200x200 cm)'
  if (/\(\s*(\d+)\s*[xX×]\s*(\d+)\s*[-–—]\s*(\d+)\s*[xX×]\s*(\d+)\s*cm\s*\)/i.test(label)) {
    return label.replace(/\(\s*(\d+)\s*[xX×]\s*(\d+)\s*[-–—]\s*(\d+)\s*[xX×]\s*(\d+)\s*cm\s*\)/gi, (m, w1, l1, w2, l2) => {
      const w1In = Math.round(Number(w1) / 2.54);
      const l1In = Math.round(Number(l1) / 2.54);
      const w2In = Math.round(Number(w2) / 2.54);
      const l2In = Math.round(Number(l2) / 2.54);
      return `(${w1}x${l1} – ${w2}x${l2} cm / ${w1In}"x${l1In}" – ${w2In}"x${l2In}")`;
    });
  }

  // 1b. Unparenthesized range of 2D sizes, e.g. '76x190 - 200x200 cm' or '76x190 – 200x200 cm'
  if (/(\d+)\s*[xX×]\s*(\d+)\s*[-–—]\s*(\d+)\s*[xX×]\s*(\d+)\s*cm/i.test(label)) {
    return label.replace(/(\d+)\s*[xX×]\s*(\d+)\s*[-–—]\s*(\d+)\s*[xX×]\s*(\d+)\s*cm/gi, (m, w1, l1, w2, l2) => {
      const w1In = Math.round(Number(w1) / 2.54);
      const l1In = Math.round(Number(l1) / 2.54);
      const w2In = Math.round(Number(w2) / 2.54);
      const l2In = Math.round(Number(l2) / 2.54);
      return `${w1}x${l1} – ${w2}x${l2} cm (${w1In}"x${l1In}" – ${w2In}"x${l2In}")`;
    });
  }

  // 2. 3D dimensions & packaging box sizes, e.g. '45x45x50 cm' or '215x30x12'
  if (/(\d+)\s*[xX×]\s*(\d+)\s*[xX×]\s*(\d+)(?:\s*cm)?/i.test(label)) {
    let res = label.replace(/(\d+)\s*[xX×]\s*(\d+)\s*[xX×]\s*(\d+)(?:\s*cm)?/gi, (m, w, d, h) => {
      const wIn = Math.round(Number(w) / 2.54);
      const dIn = Math.round(Number(d) / 2.54);
      const hIn = Math.round(Number(h) / 2.54);
      return `${w}x${d}x${h} cm (${wIn}" x ${dIn}" x ${hIn}")`;
    });
    if (/\b(\d+)\s*kg\b/i.test(res)) {
      res = res.replace(/\b(\d+)\s*kg\b/gi, (m, kg) => {
        const lbs = Math.round(Number(kg) * 2.20462);
        return `${kg} kg (${lbs} lbs)`;
      });
    }
    return res;
  }

  // 3. Single dimension range, e.g. '80 – 140 cm'
  if (/(\d+)\s*[-–—]\s*(\d+)\s*cm/i.test(label)) {
    return label.replace(/(\d+)\s*[-–—]\s*(\d+)\s*cm/gi, (m, d1, d2) => {
      const d1In = (Number(d1) / 2.54).toFixed(Number(d1) % 2.54 === 0 ? 0 : 1);
      const d2In = (Number(d2) / 2.54).toFixed(Number(d2) % 2.54 === 0 ? 0 : 1);
      return `${d1} – ${d2} cm (${d1In}" – ${d2In}")`;
    });
  }

  // 4. Parenthesized 2D size: '(135x190 cm)'
  if (/\(\s*\d+\s*[xX×]\s*\d+\s*cm\s*\)/i.test(label)) {
    return label.replace(/\(\s*(\d+)\s*[xX×]\s*(\d+)\s*cm\s*\)/gi, (m, w, l) => {
      const wIn = Math.round(Number(w) / 2.54);
      const lIn = Math.round(Number(l) / 2.54);
      return `(${w}x${l} cm / ${wIn}" x ${lIn}")`;
    });
  }

  // 5. Standalone 2D size with cm: '135x190 cm'
  if (/\b\d+\s*[xX×]\s*(\d+)\s*cm\b/i.test(label)) {
    return label.replace(/\b(\d+)\s*[xX×]\s*(\d+)\s*cm\b/gi, (m, w, l) => {
      const wIn = Math.round(Number(w) / 2.54);
      const lIn = Math.round(Number(l) / 2.54);
      return `${w}x${l} cm (${wIn}" x ${lIn}")`;
    });
  }

  // 6. Just numbers '135x190'
  if (/\b(\d{2,3})\s*[xX×]\s*(\d{2,3})\b/.test(label)) {
    return label.replace(/\b(\d{2,3})\s*[xX×]\s*(\d{2,3})\b/g, (m, w, l) => {
      const wIn = Math.round(Number(w) / 2.54);
      const lIn = Math.round(Number(l) / 2.54);
      return `${w}x${l} (${wIn}" x ${lIn}")`;
    });
  }

  // 7. Millimeters: '800 mm'
  if (/\b(\d{3,4})\s*mm\b/i.test(label)) {
    return label.replace(/\b(\d{3,4})\s*mm\b/gi, (m, mm) => {
      const inches = (Number(mm) / 25.4).toFixed(1);
      return `${mm} mm (${inches}")`;
    });
  }

  // 8. Single cm: '80 cm'
  if (/\b(\d{2,3})\s*cm\b/i.test(label)) {
    return label.replace(/\b(\d{2,3})\s*cm\b/gi, (m, cm) => {
      const inches = (Number(cm) / 2.54).toFixed(1);
      return `${cm} cm (${inches}")`;
    });
  }

  return label;
}

export function formatWeight(kg, locale = "en") {
  if (!kg) return "";
  return locale === "us" ? `${Math.round(kg * 2.20462)} lbs` : `${kg} kg`;
}

export function formatDimensionMm(mm, locale = "en") {
  if (!mm) return "";
  if (locale === "us") {
    const inches = (mm / 25.4).toFixed(1);
    return `${inches}" (${mm} mm)`;
  }
  return `${mm} mm`;
}

export function formatDimensionCm(cm, locale = "en") {
  if (!cm) return "";
  if (locale === "us") {
    const inches = (cm / 2.54).toFixed(1);
    return `${inches}" (${cm} cm)`;
  }
  return `${cm} cm`;
}
