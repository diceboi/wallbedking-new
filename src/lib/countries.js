/**
 * Centralized Storefront Delivery Countries and Regional Address Configurations
 */

export const DEFAULT_COUNTRY_BY_LOCALE = {
  en: "United Kingdom",
  us: "United States",
  de: "Germany",
  fr: "France",
  es: "Spain",
  por: "Portugal",
  it: "Italy",
};

export function getDefaultCountry(locale) {
  const norm = (locale || "en").toLowerCase();
  return DEFAULT_COUNTRY_BY_LOCALE[norm] || "United Kingdom";
}

// Master list of European delivery countries
const EUROPEAN_COUNTRIES = [
  { value: "Italy", label: "Italy / Italia", code: "IT" },
  { value: "France", label: "France", code: "FR" },
  { value: "Germany", label: "Germany / Deutschland", code: "DE" },
  { value: "Spain", label: "Spain / España", code: "ES" },
  { value: "Portugal", label: "Portugal", code: "PT" },
  { value: "Austria", label: "Austria / Österreich", code: "AT" },
  { value: "Belgium", label: "Belgium / Belgique / België", code: "BE" },
  { value: "Netherlands", label: "Netherlands / Nederland", code: "NL" },
  { value: "Ireland", label: "Ireland (Republic of Ireland)", code: "IE" },
  { value: "Switzerland", label: "Switzerland / Schweiz / Suisse", code: "CH" },
  { value: "Luxembourg", label: "Luxembourg", code: "LU" },
  { value: "Poland", label: "Poland / Polska", code: "PL" },
  { value: "Denmark", label: "Denmark / Danmark", code: "DK" },
  { value: "Sweden", label: "Sweden / Sverige", code: "SE" },
  { value: "Finland", label: "Finland / Suomi", code: "FI" },
  { value: "Czech Republic", label: "Czech Republic / Česko", code: "CZ" },
  { value: "Hungary", label: "Hungary / Magyarország", code: "HU" },
  { value: "Greece", label: "Greece / Ελλάδα", code: "GR" },
  { value: "Croatia", label: "Croatia / Hrvatska", code: "HR" },
  { value: "Romania", label: "Romania / România", code: "RO" },
  { value: "Slovakia", label: "Slovakia / Slovensko", code: "SK" },
  { value: "Slovenia", label: "Slovenia / Slovenija", code: "SI" },
  { value: "San Marino", label: "San Marino", code: "SM" },
  { value: "Monaco", label: "Monaco", code: "MC" },
  { value: "Andorra", label: "Andorra", code: "AD" },
];

/**
 * Returns available delivery countries prioritized for the specific storefront locale
 */
export function getDeliveryCountries(locale) {
  const norm = (locale || "en").toLowerCase();

  if (norm === "en") {
    return [
      { value: "United Kingdom", label: "United Kingdom (Free Mainland Delivery)", code: "GB" },
      { value: "Isle of Man", label: "Isle of Man", code: "IM" },
      { value: "Channel Islands", label: "Channel Islands (Jersey & Guernsey)", code: "JE" },
      { value: "Ireland", label: "Republic of Ireland", code: "IE" },
    ];
  }

  if (norm === "us") {
    return [
      { value: "United States", label: "United States (Nationwide Delivery)", code: "US" },
      { value: "Canada", label: "Canada", code: "CA" },
    ];
  }

  // Determine primary country for this European storefront
  const primaryCountry = DEFAULT_COUNTRY_BY_LOCALE[norm] || "Germany";

  const primaryObj = EUROPEAN_COUNTRIES.find((c) => c.value === primaryCountry);
  const otherCountries = EUROPEAN_COUNTRIES.filter((c) => c.value !== primaryCountry);

  const localizedPrimaryLabel = {
    it: "Italia (Italy) — Spedizione Gratuita",
    fr: "France — Livraison Gratuite",
    de: "Deutschland (Germany) — Kostenlose Lieferung",
    es: "España (Spain) — Envío Gratuito",
    por: "Portugal — Envio Gratuito",
  }[norm];

  const formattedPrimary = primaryObj
    ? [{ ...primaryObj, label: localizedPrimaryLabel || primaryObj.label }]
    : [];

  return [...formattedPrimary, ...otherCountries];
}

/**
 * Returns dynamic postal code placeholder depending on locale or country
 */
export function getPostcodePlaceholder(locale, country) {
  const c = (country || "").toLowerCase();
  const loc = (locale || "").toLowerCase();

  if (c.includes("kingdom") || c.includes("isle of man") || c.includes("channel") || loc === "en") {
    return "e.g. SW1A 1AA";
  }
  if (c.includes("united states") || loc === "us") {
    return "e.g. 90210";
  }
  if (c.includes("ital") || loc === "it") {
    return "es. 00185 (CAP)";
  }
  if (c.includes("germany") || c.includes("deutschland") || c.includes("austria") || loc === "de") {
    return "z.B. 10115 (PLZ)";
  }
  if (c.includes("france") || loc === "fr") {
    return "ex. 75001 (Code postal)";
  }
  if (c.includes("spain") || c.includes("españa") || loc === "es") {
    return "ej. 28001 (Código postal)";
  }
  if (c.includes("portugal") || loc === "por") {
    return "ex. 1000-001";
  }
  return "e.g. 00100";
}

/**
 * Returns dynamic city placeholder
 */
export function getCityPlaceholder(locale, country) {
  const c = (country || "").toLowerCase();
  const loc = (locale || "").toLowerCase();

  if (c.includes("kingdom") || loc === "en") return "e.g. London";
  if (c.includes("united states") || loc === "us") return "e.g. New York";
  if (c.includes("ital") || loc === "it") return "es. Roma";
  if (c.includes("germany") || c.includes("deutschland") || loc === "de") return "z.B. Berlin";
  if (c.includes("france") || loc === "fr") return "ex. Paris";
  if (c.includes("spain") || c.includes("españa") || loc === "es") return "ej. Madrid";
  if (c.includes("portugal") || loc === "por") return "ex. Lisboa";
  return "City";
}
