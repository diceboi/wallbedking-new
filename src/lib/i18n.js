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
    phone: "01928 583 469",
    phoneRaw: "+441928583469",
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
    phone: "+44 1928 583 469",
    phoneRaw: "+441928583469",
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
    phone: "+44 1928 583 469",
    phoneRaw: "+441928583469",
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
    phone: "+44 1928 583 469",
    phoneRaw: "+441928583469",
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
    phone: "+44 1928 583 469",
    phoneRaw: "+441928583469",
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
    phone: "+44 1928 583 469",
    phoneRaw: "+441928583469",
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
    phone: "+44 1928 583 469",
    phoneRaw: "+441928583469",
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
    numeric: effectivePrice,
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

import { resolveFactorySize } from "./sizes";

/**
 * Imperial vs Metric formatters for US locale.
 * Uses official factory size mappings (e.g. 120x200 -> 48" x 80") for all beds,
 * mattresses, and cabinets, avoiding inaccurate mathematical rounding.
 */
export function formatSizeLabel(label, locale = "en", product = null) {
  if (!label && !product) return "";
  const normLocale = (locale || "en").toLowerCase();

  // 1. If an explicit label is provided, format and localize that label
  if (label && typeof label === "string") {
    // 1a. Parenthesized range of 2D sizes, e.g. '(76x190 - 200x200 cm)'
    if (normLocale === "us") {
      if (/\(\s*(\d+)\s*[xX×]\s*(\d+)\s*[-–—]\s*(\d+)\s*[xX×]\s*(\d+)\s*cm\s*\)/i.test(label)) {
        return label.replace(/\(\s*(\d+)\s*[xX×]\s*(\d+)\s*[-–—]\s*(\d+)\s*[xX×]\s*(\d+)\s*cm\s*\)/gi, (m, w1, l1, w2, l2) => {
          const w1In = Math.round(Number(w1) / 2.54);
          const l1In = Math.round(Number(l1) / 2.54);
          const w2In = Math.round(Number(w2) / 2.54);
          const l2In = Math.round(Number(l2) / 2.54);
          return `(${w1In}" x ${l1In}" – ${w2In}" x ${l2In}")`;
        });
      }

      // 1b. Unparenthesized range of 2D sizes, e.g. '76x190 - 200x200 cm' or '76x190 – 200x200 cm'
      if (/(\d+)\s*[xX×]\s*(\d+)\s*[-–—]\s*(\d+)\s*[xX×]\s*(\d+)\s*cm/i.test(label)) {
        return label.replace(/(\d+)\s*[xX×]\s*(\d+)\s*[-–—]\s*(\d+)\s*[xX×]\s*(\d+)\s*cm/gi, (m, w1, l1, w2, l2) => {
          const w1In = Math.round(Number(w1) / 2.54);
          const l1In = Math.round(Number(l1) / 2.54);
          const w2In = Math.round(Number(w2) / 2.54);
          const l2In = Math.round(Number(l2) / 2.54);
          return `${w1In}" x ${l1In}" – ${w2In}" x ${l2In}"`;
        });
      }

      // If already in inches format (e.g. Twin (38" x 75") or 30" x 75"), keep as is
      if (label.includes('"')) {
        return label;
      }
    }

    // Direct string resolution through factory size database
    const resolvedFromLabel = resolveFactorySize(label);
    if (resolvedFromLabel) {
      if (normLocale === "us") {
        return resolvedFromLabel.usLabel;
      } else {
        // If on European storefront but the label had US inches, return official European cm label
        if (label.includes('"')) {
          return resolvedFromLabel.euLabel;
        }
      }
    }

    if (normLocale !== "us") {
      return label;
    }

    // Single 2D dimension in metric: '76x190 cm' or '120 x 200'
    const m2d = label.match(/(\d{2,3})\s*[xX×]\s*(\d{2,3})\s*(?:cm)?/i);
    if (m2d) {
      const wIn = Math.round(Number(m2d[1]) / 2.54);
      const lIn = Math.round(Number(m2d[2]) / 2.54);
      return label.replace(m2d[0], `${wIn}" x ${lIn}"`);
    }

    // 2. 3D dimensions & packaging box sizes, e.g. '45x45x50 cm' or '215x30x12'
    if (/(\d+)\s*[xX×]\s*(\d+)\s*[xX×]\s*(\d+)(?:\s*cm)?/i.test(label)) {
      let res = label.replace(/(\d+)\s*[xX×]\s*(\d+)\s*[xX×]\s*(\d+)(?:\s*cm)?/gi, (m, w, d, h) => {
        const wIn = Math.round(Number(w) / 2.54);
        const dIn = Math.round(Number(d) / 2.54);
        const hIn = Math.round(Number(h) / 2.54);
        return `${wIn}" x ${dIn}" x ${hIn}"`;
      });
      if (/\b(\d+)\s*kg\b/i.test(res)) {
        res = res.replace(/\b(\d+)\s*kg\b/gi, (m, kg) => {
          const lbs = Math.round(Number(kg) * 2.20462);
          return `${lbs} lbs`;
        });
      }
      return res;
    }

    // 3. Single dimension range, e.g. '80 – 140 cm'
    if (/(\d+)\s*[-–—]\s*(\d+)\s*cm/i.test(label)) {
      return label.replace(/(\d+)\s*[-–—]\s*(\d+)\s*cm/gi, (m, d1, d2) => {
        const d1In = Math.round(Number(d1) / 2.54);
        const d2In = Math.round(Number(d2) / 2.54);
        return `${d1In}" – ${d2In}"`;
      });
    }

    // 4. Standalone 2D size with cm: '135x190 cm' or '(135x190 cm)'
    if (/\(?\b(\d+)\s*[xX×]\s*(\d+)\s*cm\b\)?/i.test(label)) {
      return label.replace(/\(?\b(\d+)\s*[xX×]\s*(\d+)\s*cm\b\)?/gi, (m, w, l) => {
        const wIn = Math.round(Number(w) / 2.54);
        const lIn = Math.round(Number(l) / 2.54);
        return `${wIn}" x ${lIn}"`;
      });
    }

    // 5. Millimeters: '800 mm'
    if (/\b(\d{3,4})\s*mm\b/i.test(label)) {
      return label.replace(/\b(\d{3,4})\s*mm\b/gi, (m, mm) => {
        const inches = (Number(mm) / 25.4).toFixed(1);
        return `${inches}"`;
      });
    }

    // 6. Single cm: '80 cm'
    if (/\b(\d{2,3})\s*cm\b/i.test(label)) {
      return label.replace(/\b(\d{2,3})\s*cm\b/gi, (m, cm) => {
        const inches = (Number(cm) / 2.54).toFixed(1);
        return `${inches}"`;
      });
    }

    return label;
  }

  // 2. Fallback: If label is omitted or empty, resolve directly from product object
  if (product) {
    if (normLocale === "us" && product.size_us) return product.size_us;
    const resolvedFromProduct = resolveFactorySize(product);
    if (resolvedFromProduct) {
      return normLocale === "us" ? resolvedFromProduct.usLabel : resolvedFromProduct.euLabel;
    }
    if (product.width && product.length) {
      const w = Math.round(product.width / 10);
      const l = Math.round(product.length / 10);
      if (normLocale === "us") {
        return `${Math.round(w / 2.54)}" x ${Math.round(l / 2.54)}"`;
      }
      return `${w}x${l} cm`;
    }
  }

  return label || "";
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
