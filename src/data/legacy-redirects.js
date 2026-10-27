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
  "/de/gewerbe": "/de/gewerbekunden",
  "/de/kommerzkunden": "/de/gewerbekunden",
  "/de/fallbeispiele": "/de/fallbeispiele",
  "/de/reviews": "/de/bewertungen",
  "/de/faq": "/de/support/faq",
  "/de/haufig-gestellte-fragen": "/de/support/faq",
  "/de/lieferung": "/de/support/lieferung",
  "/de/datenschutz": "/de/privacy",
  "/de/warenkorb": "/de/cart",
  "/de/seitenuebersicht": "/de",

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
  "/fr/professionnels": "/fr/professionnels",
  "/fr/etudes-cas": "/fr/etudes-cas",
  "/fr/reviews": "/fr/avis",
  "/fr/questions-frequentes": "/fr/support/faq",
  "/fr/faq": "/fr/support/faq",
  "/fr/livraison": "/fr/support/livraison",
  "/fr/protection-donnees": "/fr/privacy",
  "/fr/panier": "/fr/cart",
  "/fr/plan-du-site": "/fr",

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
  "/es/profesionales": "/es/clientes-comerciales",
  "/es/clientes-comerciales": "/es/clientes-comerciales",
  "/es/casos-particulares": "/es/casos-estudio",
  "/es/preguntas-frecuentes": "/es/support/preguntas-frecuentes",
  "/es/entrega": "/es/support/envio",
  "/es/privacidad": "/es/privacy",
  "/es/cesta": "/es/cart",

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
  "/it/rivenditori": "/it/commercio",
  "/it/commercio": "/it/commercio",
  "/it/casi-specifici": "/it/casi-studio",
  "/it/contact": "/it/contatti",
  "/it/domande-frequenti": "/it/support/domande-frequenti",
  "/it/consegna": "/it/support/spedizione",
  "/it/riservatezza": "/it/privacy",
  "/it/carrello": "/it/cart",
  "/it/indexo": "/it",

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
  "/pt/profissionais": "/por/clientes-comerciais",
  "/pt/clientes-comerciais": "/por/clientes-comerciais",
  "/pt/analise-casos": "/por/estudos-caso",
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
  "/por/profissionais": "/por/clientes-comerciais",
  "/por/clientes-comerciais": "/por/clientes-comerciais",
  "/por/analise-casos": "/por/estudos-caso",
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
  "/trade": "/de/gewerbekunden",
  "/case-studies": "/de/fallbeispiele",
  "/contact": "/de/contact",
  "/feedback": "/de/bewertungen",
  "/reviews": "/de/bewertungen",
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
  "/mattresses": "/en/products/mattresses",
  "/morphy-sofa": "/en/products/sofas",
  "/morphy-plus": "/en/products/beds?collection=morphy",
  "/refurbished": "/en/products/beds",
  "/reasons-buy": "/en/about",
  "/about": "/en/about",
  "/trade": "/en/trade",
  "/case-studies": "/en/case-studies",
  "/sitemap": "/en",
  "/sitemaps": "/en",
  "/sofa-configurator": "/en/configurator",
  "/configurator": "/en/configurator",
  "/beds": "/en/products/beds",
  "/sofas": "/en/products/sofas",
  "/account": "/en/account",
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
  let target = null;

  // 1. Check UK domain specific redirects
  if (isUkDomain) {
    if (UK_LEGACY_REDIRECTS[normalized]) {
      target = UK_LEGACY_REDIRECTS[normalized];
    } else {
      const rawNoPhp = rawPath.replace(/\.(php|html)$/i, "");
      if (UK_LEGACY_REDIRECTS[rawNoPhp]) {
        target = UK_LEGACY_REDIRECTS[rawNoPhp];
      }
    }
  }

  // 2. If a preferred locale is specified and path is a root legacy path, resolve to that locale
  if (!target && !isUkDomain && preferredLocale && preferredLocale !== "de") {
    const loc = preferredLocale === "pt" ? "por" : preferredLocale;
    const catMap = {
      beds: { de: "schrankbetten", fr: "lits-escamotables", es: "camas-abatibles", por: "camas-rebativeis", it: "letti-a-scomparsa", us: "beds", en: "beds" },
      sofas: { de: "frontsofas", fr: "canapes", es: "sofas", por: "sofas", it: "divani", us: "sofas", en: "sofas" },
      cabinets: { de: "schraenke", fr: "armoires", es: "armarios", por: "armarios", it: "armadi", us: "cabinets", en: "cabinets" },
      mattresses: { de: "matratzen", fr: "matelas", es: "colchones", por: "colchoes", it: "materassi", us: "mattresses", en: "mattresses" },
    };

    if (normalized === "/classic" || normalized === "/studio" || normalized === "/classic-plus") {
      const cat = catMap.beds[loc] || "beds";
      target = `/${loc}/products/${cat}?collection=traditional`;
    } else if (normalized === "/morphy-bed") {
      const cat = catMap.beds[loc] || "beds";
      target = `/${loc}/products/${cat}?collection=morphy`;
    } else if (normalized === "/wallbeds" || normalized === "/clearance") {
      const cat = catMap.beds[loc] || "beds";
      target = `/${loc}/products/${cat}`;
    } else if (normalized === "/morphy-sofa") {
      const cat = catMap.sofas[loc] || "sofas";
      target = `/${loc}/products/${cat}`;
    } else if (normalized === "/cabinets") {
      const cat = catMap.cabinets[loc] || "cabinets";
      target = `/${loc}/products/${cat}`;
    } else if (normalized === "/mattresses") {
      const cat = catMap.mattresses[loc] || "mattresses";
      target = `/${loc}/products/${cat}`;
    } else if (normalized === "/cart") {
      target = `/${loc}/cart`;
    } else if (normalized === "/terms" || normalized === "/terms-conditions") {
      target = `/${loc}/terms`;
    } else if (normalized === "/privacy") {
      target = `/${loc}/privacy`;
    } else if (normalized === "/contact") {
      target = `/${loc}/contact`;
    } else if (normalized === "/reviews" || normalized === "/feedback") {
      target = `/${loc}/reviews`;
    } else if (normalized === "/faq") {
      target = `/${loc}/support/faq`;
    } else if (normalized === "/trade") {
      const tradeMap = { de: "gewerbekunden", fr: "professionnels", es: "clientes-comerciales", por: "clientes-comerciais", it: "commercio", us: "trade", en: "trade" };
      target = `/${loc}/${tradeMap[loc] || "trade"}`;
    } else if (normalized === "/delivery") {
      const delivMap = { de: "lieferung", fr: "livraison", es: "envio", por: "envio", it: "spedizione", us: "delivery", en: "delivery" };
      target = `/${loc}/support/${delivMap[loc] || "delivery"}`;
    }
  }

  // 3. Check COM legacy redirects (exact normalized lookup)
  // CRITICAL: On UK domain, never match COM un-prefixed redirects to /de/...
  const isLocalePrefixed = /^\/(de|fr|es|por|it|us|pt)\b/i.test(normalized);
  if (!target && (!isUkDomain || isLocalePrefixed) && COM_LEGACY_REDIRECTS[normalized]) {
    target = COM_LEGACY_REDIRECTS[normalized];
  }

  // 4. Fallback check for raw path without .php
  if (!target && (!isUkDomain || isLocalePrefixed)) {
    const rawClean = rawPath.replace(/\.(php|html)$/i, "").toLowerCase();
    if (COM_LEGACY_REDIRECTS[rawClean]) {
      target = COM_LEGACY_REDIRECTS[rawClean];
    }
  }

  // 5. Catch-all: If path ended in .php and was not in map, redirect to clean path
  if (!target && /\.php$/i.test(rawPath)) {
    const stripped = rawPath.replace(/\.php$/i, "");
    target = stripped.endsWith("/index") ? stripped.replace(/\/index$/, "") || "/" : stripped;
  }

  // Safety guard: NEVER redirect to the exact same URL (prevents ERR_TOO_MANY_REDIRECTS)
  const isSelf =
    target === rawPath ||
    target === `${rawPath}/` ||
    `${target}/` === rawPath ||
    (target === normalized && (rawPath === normalized || rawPath === `${normalized}/`));

  if (!target || isSelf) {
    return null;
  }

  return target;
}

/**
 * Builds array of redirects for next.config.js
 * CRITICAL ARCHITECTURAL RULE:
 * Only add LOCALE-PREFIXED redirects to next.config.js (e.g. /de/..., /fr/..., /es/..., /it/..., /por/..., /us/..., /pt/...).
 * Root un-prefixed redirects (e.g. /trade, /reviews, /classic, /wallbeds) MUST NOT be in next.config.js
 * because Next.js static redirects are domain-agnostic on Vercel and would wrongly redirect
 * wallbedking.co.uk/trade -> /de/gewerbekunden across the entire platform!
 * All un-prefixed routes are dynamically and host-sensitively handled in src/proxy.js!
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

  // Add COM redirects for locale-prefixed paths ONLY
  for (const [source, destination] of Object.entries(COM_LEGACY_REDIRECTS)) {
    const isLocalePrefixed = /^\/(de|fr|es|por|it|us|pt)\b/i.test(source);
    if (!isLocalePrefixed) {
      // Handled dynamically by middleware proxy.js based on host/domain!
      continue;
    }

    addRule(source, destination);
    if (!source.endsWith(".shtml") && source !== "/") {
      addRule(`${source}.php`, destination);
      addRule(`${source}/`, destination);
    }
  }

  // Add clean redirects for legacy .php pages whose clean target is an existing App Router page
  const cleanPhpRedirects = [
    "/de/kontakt", "/de/bewertungen", "/de/cart", "/de/thanks",
    "/fr/contact", "/fr/avis", "/fr/cart", "/fr/thanks",
    "/es/contacto", "/es/opiniones", "/es/cart", "/es/thanks",
    "/it/contatti", "/it/recensioni", "/it/privacy", "/it/cart", "/it/thanks",
  ];
  for (const p of cleanPhpRedirects) {
    addRule(`${p}.php`, p);
    addRule(`${p}/`, p);
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
