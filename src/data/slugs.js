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
  tables: {
    en: "tables",
    de: "tische",
    fr: "tables",
    es: "mesas",
    por: "mesas",
    it: "tavoli",
  },
  mattresses: {
    en: "mattresses",
    de: "matratzen",
    fr: "matelas",
    es: "colchones",
    por: "colchoes",
    it: "materassi",
  },
  cabinets: {
    en: "cabinets",
    de: "schraenke",
    fr: "armoires",
    es: "armarios",
    por: "armarios",
    it: "armadi",
  },
  accessories: {
    en: "accessories",
    de: "zubehoer",
    fr: "accessoires",
    es: "accesorios",
    por: "acessorios",
    it: "accessori",
  },
  extras: {
    en: "extras",
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
  terms: {
    en: "terms",
    de: "agb",
    fr: "conditions",
    es: "terminos-condiciones",
    por: "termos-condicoes",
    it: "termini-condizioni",
  },
  privacy: {
    en: "privacy",
    de: "datenschutz",
    fr: "protection-donnees",
    es: "privacidad",
    por: "privacidade",
    it: "riservatezza",
  },
  trade: {
    en: "trade",
    de: "gewerbekunden",
    fr: "professionnels",
    es: "clientes-comerciales",
    por: "clientes-comerciais",
    it: "commercio",
  },
  "case-studies": {
    en: "case-studies",
    de: "fallbeispiele",
    fr: "etudes-cas",
    es: "casos-estudio",
    por: "estudos-caso",
    it: "casi-studio",
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

// Secondary legacy aliases for static pages
const STATIC_PAGE_ALIASES = {
  "de:impressum": "about",
  "de:ueberuns": "about",
  "de:gewerbe": "trade",
  "de:kommerzkunden": "trade",
  "fr:apropos": "about",
  "fr:termes-conditions": "terms",
  "fr:pro": "trade",
  "es:terminos": "terms",
  "es:términos-condiciones": "terms",
  "es:profesionales": "trade",
  "es:casos-particulares": "case-studies",
  "it:termini": "terms",
  "it:privacy": "privacy",
  "it:rivenditori": "trade",
  "it:casi-specifici": "case-studies",
  "pt:privacidade": "privacy",
  "pt:termos-condicoes": "terms",
  "pt:profissionais": "trade",
  "pt:clientes-comerciais": "trade",
  "pt:analise-casos": "case-studies",
  "por:profissionais": "trade",
  "por:analise-casos": "case-studies",
  "impressum": "about",
  "apropos": "about",
  "gewerbe": "trade",
  "gewerbekunden": "trade",
  "kommerzkunden": "trade",
  "professionnels": "trade",
  "profesionales": "trade",
  "rivenditori": "trade",
  "fallbeispiele": "case-studies",
  "etudes-cas": "case-studies",
  "casos-estudio": "case-studies",
  "casi-studio": "case-studies",
  "estudos-caso": "case-studies",
};
for (const [k, v] of Object.entries(STATIC_PAGE_ALIASES)) {
  REVERSE_STATIC_MAP[k] = v;
}

/**
 * Resolves any localized category slug (e.g. 'schrankbetten' or 'lits-escamotables')
 * to its canonical ID ('beds').
 */
export function resolveCategory(rawSlug, locale) {
  if (!rawSlug) return "beds";
  const lower = rawSlug.toLowerCase();
  if (lower === "morphy-beds" || lower === "traditional-beds" || lower === "morphy" || lower === "traditional") {
    return "beds";
  }
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

  // Separate hash and search query before path processing
  const [pathAndQuery, hash] = currentPath.split("#");
  const [pathOnly, search] = pathAndQuery.split("?");
  const querySuffix = search ? `?${search}` : "";
  const hashSuffix = hash ? `#${hash}` : "";

  // Split path parts
  const parts = pathOnly.split("/").filter(Boolean);
  let currentLoc = DEFAULT_LOCALE;
  let subParts = parts;

  // Check if first part is a locale
  if (parts.length > 0 && (LOCALES.includes(parts[0]) || parts[0] === "pt")) {
    currentLoc = parts[0] === "pt" ? "por" : parts[0];
    subParts = parts.slice(1);
  }

  if (subParts.length === 0) {
    return `/${normTarget}${querySuffix}${hashSuffix}`;
  }

  const subPath = subParts.join("/");

  // 1. Check if it's a category page: products/[category]
  if (subParts[0] === "products" && subParts.length >= 2) {
    const rawCat = subParts[1];
    const canonicalCat = resolveCategory(rawCat, currentLoc);
    const targetCatSlug = getCategorySlug(canonicalCat, normTarget);

    let effectiveQuery = querySuffix;
    if (!search) {
      if (rawCat === "morphy-beds" || rawCat === "morphy") effectiveQuery = "?collection=morphy";
      else if (rawCat === "traditional-beds" || rawCat === "traditional") effectiveQuery = "?collection=traditional";
    }

    if (subParts.length === 2) {
      // If switching to US and category is mattresses, redirect to /us/products
      if (normTarget === "us" && canonicalCat === "mattresses") {
        return `/${normTarget}/products${querySuffix}${hashSuffix}`;
      }
      return `/${normTarget}/products/${targetCatSlug}${effectiveQuery}${hashSuffix}`;
    }
    // Product detail: products/[category]/[product]
    const productSlug = subParts.slice(2).join("/");

    // If switching to US and category is mattresses, redirect to /us/products
    if (normTarget === "us" && canonicalCat === "mattresses") {
      return `/${normTarget}/products${querySuffix}${hashSuffix}`;
    }

    return `/${normTarget}/products/${targetCatSlug}/${productSlug}${querySuffix}${hashSuffix}`;
  }

  // 2. Check if it's a static page (e.g. about, contact, reviews, support/delivery)
  const canonicalStatic = resolveStaticPage(subPath, currentLoc);
  if (canonicalStatic && STATIC_PAGE_SLUGS[canonicalStatic]) {
    const targetSlug = getStaticPageSlug(canonicalStatic, normTarget);
    return `/${normTarget}/${targetSlug}${querySuffix}${hashSuffix}`;
  }

  // Fallback: preserve subPath with new locale prefix
  return `/${normTarget}/${subPath}${querySuffix}${hashSuffix}`;
}

