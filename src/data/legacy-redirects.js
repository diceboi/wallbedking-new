/**
 * Legacy URL Redirects for Wallbedking.com & Wallbedking.co.uk
 * Prevents 404s when users or search engines access old URLs from SERPs.
 */

const COM_LEGACY_REDIRECTS = {
  // --- GERMAN (de) ---
  "/de/schrankbetten": "/de/products/schrankbetten",
  "/de/wandbetten": "/de/products/schrankbetten",
  "/de/klappbetten": "/de/products/schrankbetten",
  "/de/wallbeds": "/de/products/schrankbetten",
  "/de/komplett-set": "/de/products/schrankbetten",
  "/de/classic": "/de/products/schrankbetten?collection=traditional",
  "/de/studio": "/de/products/schrankbetten?collection=traditional",
  "/de/studio-betten": "/de/products/schrankbetten?collection=traditional",
  "/de/morphy-bett": "/de/products/schrankbetten?collection=morphy",
  "/de/morphy-schrankbett": "/de/products/schrankbetten?collection=morphy",
  "/de/morphy-sofa": "/de/products/frontsofas",
  "/de/schraenke": "/de/products/schraenke",
  "/de/schranke": "/de/products/schraenke",
  "/de/matratzen": "/de/products/matratzen",
  "/de/gebrauchtware": "/de/products/schrankbetten",
  "/de/agb": "/de/terms",
  "/de/terms-conditions": "/de/terms",
  "/de/impressum": "/de/ueber-uns",
  "/de/about": "/de/ueber-uns",
  "/de/gewerbe": "/de/ueber-uns",
  "/de/kommerzkunden": "/de/ueber-uns",
  "/de/fallbeispiele": "/de/ueber-uns",
  "/de/kontakt": "/de/kontakt",
  "/de/bewertungen": "/de/bewertungen",
  "/de/reviews": "/de/bewertungen",
  "/de/faq": "/de/support/faq",
  "/de/haufig-gestellte-fragen": "/de/support/faq",
  "/de/lieferung": "/de/support/lieferung",
  "/de/datenschutz": "/de/privacy",
  "/de/cart": "/de/cart",
  "/de/warenkorb": "/de/cart",
  "/de/seitenuebersicht": "/de",
  "/de/thanks": "/de/thanks",

  // --- FRENCH (fr) ---
  "/fr/lits": "/fr/products/lits-escamotables",
  "/fr/lits-muraux": "/fr/products/lits-escamotables",
  "/fr/wallbeds": "/fr/products/lits-escamotables",
  "/fr/ensembles": "/fr/products/lits-escamotables",
  "/fr/classic": "/fr/products/lits-escamotables?collection=traditional",
  "/fr/studio": "/fr/products/lits-escamotables?collection=traditional",
  "/fr/lits-studio": "/fr/products/lits-escamotables?collection=traditional",
  "/fr/lit-morphy": "/fr/products/lits-escamotables?collection=morphy",
  "/fr/morphy-sofa": "/fr/products/canapes",
  "/fr/armoires": "/fr/products/armoires",
  "/fr/rangements": "/fr/products/armoires",
  "/fr/matelas": "/fr/products/matelas",
  "/fr/stock-reconditionne": "/fr/products/lits-escamotables",
  "/fr/conditions": "/fr/terms",
  "/fr/termes-conditions": "/fr/terms",
  "/fr/terms-conditions": "/fr/terms",
  "/fr/apropos": "/fr/a-propos",
  "/fr/about": "/fr/a-propos",
  "/fr/professionnels": "/fr/a-propos",
  "/fr/etudes-cas": "/fr/a-propos",
  "/fr/contact": "/fr/contact",
  "/fr/avis": "/fr/avis",
  "/fr/reviews": "/fr/avis",
  "/fr/questions-frequentes": "/fr/support/faq",
  "/fr/faq": "/fr/support/faq",
  "/fr/livraison": "/fr/support/livraison",
  "/fr/protection-donnees": "/fr/privacy",
  "/fr/cart": "/fr/cart",
  "/fr/panier": "/fr/cart",
  "/fr/plan-du-site": "/fr",
  "/fr/thanks": "/fr/thanks",

  // --- SPANISH (es) ---
  "/es/camas": "/es/products/camas-abatibles",
  "/es/camas-pared": "/es/products/camas-abatibles",
  "/es/classic": "/es/products/camas-abatibles?collection=traditional",
  "/es/studio": "/es/products/camas-abatibles?collection=traditional",
  "/es/camas-studio": "/es/products/camas-abatibles?collection=traditional",
  "/es/cama-morphy": "/es/products/camas-abatibles?collection=morphy",
  "/es/morphy-sofa": "/es/products/sofas",
  "/es/armarios": "/es/products/armarios",
  "/es/colchones": "/es/products/colchones",
  "/es/outlet": "/es/products/camas-abatibles",
  "/es/terminos-condiciones": "/es/terms",
  "/es/terms-conditions": "/es/terms",
  "/es/términos-condiciones": "/es/terms",
  "/es/profesionales": "/es/sobre-nosotros",
  "/es/clientes-comerciales": "/es/sobre-nosotros",
  "/es/casos-particulares": "/es/sobre-nosotros",
  "/es/contacto": "/es/contacto",
  "/es/opiniones": "/es/opiniones",
  "/es/preguntas-frecuentes": "/es/support/preguntas-frecuentes",
  "/es/entrega": "/es/support/envio",
  "/es/privacidad": "/es/privacy",
  "/es/cart": "/es/cart",
  "/es/cesta": "/es/cart",
  "/es/thanks": "/es/thanks",

  // --- ITALIAN (it) ---
  "/it/letti": "/it/products/letti-a-scomparsa",
  "/it/letti-scomparsa": "/it/products/letti-a-scomparsa",
  "/it/letti a scomparsa": "/it/products/letti-a-scomparsa",
  "/it/letti-a-scomparsa": "/it/products/letti-a-scomparsa",
  "/it/pacchetti": "/it/products/letti-a-scomparsa",
  "/it/classic": "/it/products/letti-a-scomparsa?collection=traditional",
  "/it/studio": "/it/products/letti-a-scomparsa?collection=traditional",
  "/it/letti-studio": "/it/products/letti-a-scomparsa?collection=traditional",
  "/it/letto-morphy": "/it/products/letti-a-scomparsa?collection=morphy",
  "/it/divano-morphy": "/it/products/divani",
  "/it/armadi": "/it/products/armadi",
  "/it/materassi": "/it/products/materassi",
  "/it/ricondizionati": "/it/products/letti-a-scomparsa",
  "/it/termini": "/it/terms",
  "/it/termini-condizioni": "/it/terms",
  "/it/termini e condizioni": "/it/terms",
  "/it/terms-conditions": "/it/terms",
  "/it/rivenditori": "/it/chi-siamo",
  "/it/commercio": "/it/chi-siamo",
  "/it/casi-specifici": "/it/chi-siamo",
  "/it/contatti": "/it/contatti",
  "/it/contact": "/it/contatti",
  "/it/recensioni": "/it/recensioni",
  "/it/domande-frequenti": "/it/support/domande-frequenti",
  "/it/consegna": "/it/support/spedizione",
  "/it/riservatezza": "/it/privacy",
  "/it/privacy": "/it/privacy",
  "/it/cart": "/it/cart",
  "/it/carrello": "/it/cart",
  "/it/indexo": "/it",
  "/it/thanks": "/it/thanks",

  // --- PORTUGUESE (pt & por) ---
  "/pt": "/por",
  "/pt/": "/por",
  "/pt/camas": "/por/products/camas-rebativeis",
  "/pt/cama-parede": "/por/products/camas-rebativeis",
  "/pt/classic": "/por/products/camas-rebativeis?collection=traditional",
  "/pt/studio": "/por/products/camas-rebativeis?collection=traditional",
  "/pt/camas-estudio": "/por/products/camas-rebativeis?collection=traditional",
  "/pt/cama-morphy": "/por/products/camas-rebativeis?collection=morphy",
  "/pt/sofa-morphy": "/por/products/sofas",
  "/pt/armarios": "/por/products/armarios",
  "/pt/colchoes": "/por/products/colchoes",
  "/pt/recondicionados": "/por/products/camas-rebativeis",
  "/pt/feedhcwpt": "/por/products/camas-rebativeis",
  "/pt/feedvcwpt": "/por/products/camas-rebativeis",
  "/pt/termos-condicoes": "/por/terms",
  "/pt/terms-conditions": "/por/terms",
  "/pt/profissionais": "/por/sobre-nos",
  "/pt/clientes-comerciais": "/por/sobre-nos",
  "/pt/analise-casos": "/por/sobre-nos",
  "/pt/contacto": "/por/contacto",
  "/pt/comentarios": "/por/avaliacoes",
  "/pt/faq": "/por/support/perguntas-frequentes",
  "/pt/entrega": "/por/support/envio",
  "/pt/privacidade": "/por/privacy",
  "/pt/cart": "/por/cart",
  "/pt/cesta": "/por/cart",
  "/pt/thanks": "/por/thanks",

  // Also support /por aliases for category pages without /products prefix
  "/por/camas": "/por/products/camas-rebativeis",
  "/por/cama-parede": "/por/products/camas-rebativeis",
  "/por/classic": "/por/products/camas-rebativeis?collection=traditional",
  "/por/studio": "/por/products/camas-rebativeis?collection=traditional",
  "/por/camas-estudio": "/por/products/camas-rebativeis?collection=traditional",
  "/por/cama-morphy": "/por/products/camas-rebativeis?collection=morphy",
  "/por/sofa-morphy": "/por/products/sofas",
  "/por/armarios": "/por/products/armarios",
  "/por/colchoes": "/por/products/colchoes",
  "/por/recondicionados": "/por/products/camas-rebativeis",
  "/por/termos-condicoes": "/por/terms",
  "/por/terms-conditions": "/por/terms",
  "/por/profissionais": "/por/sobre-nos",
  "/por/clientes-comerciais": "/por/sobre-nos",
  "/por/analise-casos": "/por/sobre-nos",
  "/por/cesta": "/por/cart",
  "/por/faq": "/por/support/perguntas-frequentes",
  "/por/entrega": "/por/support/envio",

  // --- ENGLISH ON .COM (Historically the US Store) ---
  "/en/wallbeds": "/us/products/beds",
  "/en/classic": "/us/products/beds?collection=traditional",
  "/en/studio": "/us/products/beds?collection=traditional",
  "/en/morphy-bed": "/us/products/beds?collection=morphy",
  "/en/terms-conditions": "/us/terms",
  "/en/clearance": "/us/products/beds",
  "/en/cart": "/us/cart",
  "/en/thanks": "/us/thanks",

  // --- ROOT & GLOBAL (without locale prefix) ---
  "/classic": "/de/products/schrankbetten?collection=traditional",
  "/studio": "/de/products/schrankbetten?collection=traditional",
  "/classic-plus": "/de/products/schrankbetten?collection=traditional",
  "/wallbeds": "/de/products/schrankbetten",
  "/morphy-bed": "/de/products/schrankbetten?collection=morphy",
  "/morphy-sofa": "/de/products/frontsofas",
  "/cabinets": "/de/products/schraenke",
  "/mattresses": "/de/products/matratzen",
  "/clearance": "/de/products/schrankbetten",
  "/delivery": "/de/support/delivery",
  "/faq": "/de/support/faq",
  "/contact": "/de/contact",
  "/feedback": "/de/reviews",
  "/reviews": "/de/reviews",
  "/terms-conditions": "/de/terms",
  "/terms": "/de/terms",
  "/privacy": "/de/privacy",
  "/sitemap": "/de",
  "/sitemaps": "/de",
  "/sofa-configurator": "/de/konfigurator",
  "/cart": "/de/cart",
  "/index": "/",
  "/domain-names/international-domain-names.shtml": "/de",
};

// UK domain specific redirects
const UK_LEGACY_REDIRECTS = {
  "/wallbeds": "/en/products/beds",
  "/classic": "/en/products/beds?collection=traditional",
  "/studio": "/en/products/beds?collection=traditional",
  "/classic-plus": "/en/products/beds?collection=traditional",
  "/morphy-bed": "/en/products/beds?collection=morphy",
  "/cabinets": "/en/products/cabinets",
  "/delivery": "/en/support/delivery",
  "/faq": "/en/support/faq",
  "/contact": "/en/contact",
  "/feedback": "/en/reviews",
  "/reviews": "/en/reviews",
  "/terms-conditions": "/en/terms",
  "/terms": "/en/terms",
  "/privacy": "/en/privacy",
  "/clearance": "/en/products/beds",
  "/cart": "/en/cart",
  "/thanks": "/en/thanks",
  "/coronavirus-covid-19": "/en",
  "/new": "/en",
};

/**
 * Normalizes an incoming pathname for redirect matching:
 * - Decodes URI encoding (e.g. %20 -> space, %C3%A9 -> é)
 * - Strips .php, .html, .shtml extension
 * - Removes /index suffix
 * - Removes trailing slash (except for root '/')
 */
function normalizePathname(rawPath) {
  if (!rawPath) return "/";
  let decoded = rawPath;
  try {
    decoded = decodeURIComponent(rawPath);
  } catch (e) {
    // Keep raw if decoding fails
  }

  let clean = decoded.trim().toLowerCase();
  
  // Strip trailing extension (.php, .html, .shtml)
  clean = clean.replace(/\.(php|html|shtml)$/i, "");
  
  // Strip trailing /index
  if (clean.length > 6 && clean.endsWith("/index")) {
    clean = clean.slice(0, -6);
  }

  // Remove trailing slash if longer than 1 character
  if (clean.length > 1 && clean.endsWith("/")) {
    clean = clean.slice(0, -1);
  }

  return clean || "/";
}

/**
 * Resolves any incoming legacy URL to its new canonical destination.
 * Returns null if no redirect is required.
 */
function resolveLegacyRedirect(rawPath, isUkDomain = false, preferredLocale = null) {
  if (!rawPath) return null;
  const normalized = normalizePathname(rawPath);

  // 1. Check UK domain specific redirects
  if (isUkDomain) {
    if (UK_LEGACY_REDIRECTS[normalized]) {
      return UK_LEGACY_REDIRECTS[normalized];
    }
    const rawNoPhp = rawPath.replace(/\.(php|html)$/i, "");
    if (UK_LEGACY_REDIRECTS[rawNoPhp]) {
      return UK_LEGACY_REDIRECTS[rawNoPhp];
    }
  }

  // 2. If a preferred locale is specified and path is a root legacy path, resolve to that locale
  if (preferredLocale && preferredLocale !== "de") {
    const loc = preferredLocale === "pt" ? "por" : preferredLocale;
    const catMap = {
      beds: { de: "schrankbetten", fr: "lits-escamotables", es: "camas-abatibles", por: "camas-rebativeis", it: "letti-a-scomparsa", us: "beds", en: "beds" },
      sofas: { de: "frontsofas", fr: "canapes", es: "sofas", por: "sofas", it: "divani", us: "sofas", en: "sofas" },
      cabinets: { de: "schraenke", fr: "armoires", es: "armarios", por: "armarios", it: "armadi", us: "cabinets", en: "cabinets" },
      mattresses: { de: "matratzen", fr: "matelas", es: "colchones", por: "colchoes", it: "materassi", us: "mattresses", en: "mattresses" },
    };

    if (normalized === "/classic" || normalized === "/studio" || normalized === "/classic-plus") {
      const cat = catMap.beds[loc] || "beds";
      return `/${loc}/products/${cat}?collection=traditional`;
    }
    if (normalized === "/morphy-bed") {
      const cat = catMap.beds[loc] || "beds";
      return `/${loc}/products/${cat}?collection=morphy`;
    }
    if (normalized === "/wallbeds" || normalized === "/clearance") {
      const cat = catMap.beds[loc] || "beds";
      return `/${loc}/products/${cat}`;
    }
    if (normalized === "/morphy-sofa") {
      const cat = catMap.sofas[loc] || "sofas";
      return `/${loc}/products/${cat}`;
    }
    if (normalized === "/cabinets") {
      const cat = catMap.cabinets[loc] || "cabinets";
      return `/${loc}/products/${cat}`;
    }
    if (normalized === "/mattresses") {
      const cat = catMap.mattresses[loc] || "mattresses";
      return `/${loc}/products/${cat}`;
    }
    if (normalized === "/cart") {
      return `/${loc}/cart`;
    }
    if (normalized === "/terms" || normalized === "/terms-conditions") {
      return `/${loc}/terms`;
    }
    if (normalized === "/privacy") {
      return `/${loc}/privacy`;
    }
    if (normalized === "/contact") {
      return `/${loc}/contact`;
    }
    if (normalized === "/reviews" || normalized === "/feedback") {
      return `/${loc}/reviews`;
    }
    if (normalized === "/faq") {
      return `/${loc}/support/faq`;
    }
    if (normalized === "/delivery") {
      const delivMap = { de: "lieferung", fr: "livraison", es: "envio", por: "envio", it: "spedizione", us: "delivery", en: "delivery" };
      return `/${loc}/support/${delivMap[loc] || "delivery"}`;
    }
  }

  // 3. Check COM legacy redirects (exact normalized lookup)
  if (COM_LEGACY_REDIRECTS[normalized]) {
    return COM_LEGACY_REDIRECTS[normalized];
  }

  // 4. Fallback check for raw path without .php
  const rawClean = rawPath.replace(/\.(php|html)$/i, "").toLowerCase();
  if (COM_LEGACY_REDIRECTS[rawClean]) {
    return COM_LEGACY_REDIRECTS[rawClean];
  }

  // 5. Catch-all: If path ended in .php and was not in map, redirect to clean path
  if (/\.php$/i.test(rawPath)) {
    const stripped = rawPath.replace(/\.php$/i, "");
    return stripped.endsWith("/index") ? stripped.replace(/\/index$/, "") || "/" : stripped;
  }

  return null;
}

/**
 * Builds array of redirects for next.config.js
 */
function getNextConfigRedirects() {
  const redirects = [];
  const added = new Set();

  function addRule(source, destination) {
    if (!source || !destination || source === destination) return;
    if (added.has(source)) return;
    added.add(source);
    redirects.push({
      source,
      destination,
      permanent: true,
    });
  }

  // Add COM redirects for both clean path and .php path
  for (const [source, destination] of Object.entries(COM_LEGACY_REDIRECTS)) {
    addRule(source, destination);
    if (!source.endsWith(".shtml") && source !== "/") {
      addRule(`${source}.php`, destination);
      addRule(`${source}/`, destination);
    }
  }

  return redirects;
}

module.exports = {
  COM_LEGACY_REDIRECTS,
  UK_LEGACY_REDIRECTS,
  normalizePathname,
  resolveLegacyRedirect,
  getNextConfigRedirects,
};
