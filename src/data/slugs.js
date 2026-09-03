import { LOCALES, DEFAULT_LOCALE, normalizeLocale } from "@/lib/i18n";

/**
 * Canonical product category mappings across all 6 locales.
 */
export const CATEGORY_SLUGS = {
  beds: {
    en: "beds",
    de: "schrankbetten",
    fr: "lits-escamotables",
    es: "camas-abatibles",
    por: "camas-rebativeis",
    it: "letti-a-scomparsa",
  },
  sofas: {
    en: "sofas",
    de: "frontsofas",
    fr: "canapes",
    es: "sofas",
    por: "sofas",
    it: "divani",
  },
  mattresses: {
    en: "mattresses",
    de: "matratzen",
    fr: "matelas",
    es: "colchones",
    por: "colchoes",
    it: "materassi",
  },
  accessories: {
    en: "accessories",
    de: "zubehoer",
    fr: "accessoires",
    es: "accesorios",
    por: "acessorios",
    it: "accessori",
  },
};

/**
 * Static page route mappings across all 6 locales.
 */
export const STATIC_PAGE_SLUGS = {
  about: {
    en: "about",
    de: "ueber-uns",
    fr: "a-propos",
    es: "sobre-nosotros",
    por: "sobre-nos",
    it: "chi-siamo",
  },
  contact: {
    en: "contact",
    de: "kontakt",
    fr: "contact",
    es: "contacto",
    por: "contacto",
    it: "contatti",
  },
  reviews: {
    en: "reviews",
    de: "bewertungen",
    fr: "avis",
    es: "opiniones",
    por: "avaliacoes",
    it: "recensioni",
  },
  configurator: {
    en: "configurator",
    de: "konfigurator",
    fr: "configurateur",
    es: "configurador",
    por: "configurador",
    it: "configuratore",
  },
  "support/delivery": {
    en: "support/delivery",
    de: "support/lieferung",
    fr: "support/livraison",
    es: "support/envio",
    por: "support/envio",
    it: "support/spedizione",
  },
  "support/faq": {
    en: "support/faq",
    de: "support/faq",
    fr: "support/faq",
    es: "support/preguntas-frecuentes",
    por: "support/perguntas-frequentes",
    it: "support/domande-frequenti",
  },
  "support/installation-guides": {
    en: "support/installation-guides",
    de: "support/montageanleitungen",
    fr: "support/guides-installation",
    es: "support/guias-instalacion",
    por: "support/guias-instalacao",
    it: "support/guide-installazione",
  },
  "support/installation-videos": {
    en: "support/installation-videos",
    de: "support/montagevideos",
    fr: "support/videos-installation",
    es: "support/videos-instalacion",
    por: "support/videos-instalacao",
    it: "support/video-installazione",
  },
};

// Build reverse lookup maps for fast lookups
const REVERSE_CATEGORY_MAP = {};
for (const [canonical, mapping] of Object.entries(CATEGORY_SLUGS)) {
  for (const [loc, slug] of Object.entries(mapping)) {
    REVERSE_CATEGORY_MAP[`${loc}:${slug.toLowerCase()}`] = canonical;
    REVERSE_CATEGORY_MAP[slug.toLowerCase()] = canonical;
  }
}

const REVERSE_STATIC_MAP = {};
for (const [canonical, mapping] of Object.entries(STATIC_PAGE_SLUGS)) {
  for (const [loc, slug] of Object.entries(mapping)) {
    REVERSE_STATIC_MAP[`${loc}:${slug.toLowerCase()}`] = canonical;
    REVERSE_STATIC_MAP[slug.toLowerCase()] = canonical;
  }
}

/**
 * Resolves any localized category slug (e.g. 'schrankbetten' or 'lits-escamotables')
 * to its canonical ID ('beds').
 */
export function resolveCategory(rawSlug, locale) {
  if (!rawSlug) return "beds";
  const lower = rawSlug.toLowerCase();
  if (locale && REVERSE_CATEGORY_MAP[`${locale}:${lower}`]) {
    return REVERSE_CATEGORY_MAP[`${locale}:${lower}`];
  }
  return REVERSE_CATEGORY_MAP[lower] || lower;
}

/**
 * Gets the localized slug for a canonical category in a given locale.
 * e.g. getCategorySlug("beds", "de") -> "schrankbetten"
 */
export function getCategorySlug(canonicalCategory, locale = DEFAULT_LOCALE) {
  const normLocale = normalizeLocale(locale);
  const cat = CATEGORY_SLUGS[canonicalCategory];
  if (!cat) return canonicalCategory;
  return cat[normLocale] || cat.en || canonicalCategory;
}

/**
 * Resolves any localized static page slug to canonical ID (e.g. 'ueber-uns' -> 'about')
 */
export function resolveStaticPage(rawSlug, locale) {
  if (!rawSlug) return "";
  const lower = rawSlug.toLowerCase();
  if (locale && REVERSE_STATIC_MAP[`${locale}:${lower}`]) {
    return REVERSE_STATIC_MAP[`${locale}:${lower}`];
  }
  return REVERSE_STATIC_MAP[lower] || lower;
}

/**
 * Gets the localized static page slug in a given locale.
 * e.g. getStaticPageSlug("about", "de") -> "ueber-uns"
 */
export function getStaticPageSlug(canonicalPage, locale = DEFAULT_LOCALE) {
  const normLocale = normalizeLocale(locale);
  const page = STATIC_PAGE_SLUGS[canonicalPage];
  if (!page) return canonicalPage;
  return page[normLocale] || page.en || canonicalPage;
}

/**
 * Maps any localized URL path from its current locale to the exact target locale URL.
 * e.g. mapUrlToLocale("/de/products/schrankbetten", "fr") -> "/fr/products/lits-escamotables"
 * e.g. mapUrlToLocale("/de/ueber-uns", "en") -> "/en/about"
 */
export function mapUrlToLocale(currentPath, targetLocale) {
  const normTarget = normalizeLocale(targetLocale);
  if (!currentPath || currentPath === "/") return `/${normTarget}`;

  // Split path parts
  const parts = currentPath.split("/").filter(Boolean);
  let currentLoc = DEFAULT_LOCALE;
  let subParts = parts;

  // Check if first part is a locale
  if (parts.length > 0 && (LOCALES.includes(parts[0]) || parts[0] === "pt")) {
    currentLoc = parts[0] === "pt" ? "por" : parts[0];
    subParts = parts.slice(1);
  }

  if (subParts.length === 0) {
    return `/${normTarget}`;
  }

  const subPath = subParts.join("/");

  // 1. Check if it's a category page: products/[category]
  if (subParts[0] === "products" && subParts.length >= 2) {
    const rawCat = subParts[1];
    const canonicalCat = resolveCategory(rawCat, currentLoc);
    const targetCatSlug = getCategorySlug(canonicalCat, normTarget);

    if (subParts.length === 2) {
      return `/${normTarget}/products/${targetCatSlug}`;
    }
    // Product detail: products/[category]/[product]
    const productSlug = subParts.slice(2).join("/");
    return `/${normTarget}/products/${targetCatSlug}/${productSlug}`;
  }

  // 2. Check if it's a static page (e.g. about, contact, reviews, support/delivery)
  const canonicalStatic = resolveStaticPage(subPath, currentLoc);
  if (canonicalStatic && STATIC_PAGE_SLUGS[canonicalStatic]) {
    const targetSlug = getStaticPageSlug(canonicalStatic, normTarget);
    return `/${normTarget}/${targetSlug}`;
  }

  // Fallback: preserve subPath with new locale prefix
  return `/${normTarget}/${subPath}`;
}
