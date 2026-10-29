/**
 * Centralized Storefront Delivery Countries and Regional Address Configurations
 * Strictly limited to Wall Bed King operational markets:
 * France, Germany, Portugal, Italy, Spain, USA (and UK for English storefront).
 */

export const DEFAULT_COUNTRY_BY_LOCALE = {
  en: "United Kingdom",
  uk: "United Kingdom",
  us: "United States",
  de: "Germany",
  fr: "France",
  es: "Spain",
  por: "Portugal",
  pt: "Portugal",
  it: "Italy",
};

export function getDefaultCountry(locale) {
  const norm = (locale || "en").toLowerCase();
  return (
    DEFAULT_COUNTRY_BY_LOCALE[norm] ||
    (norm === "us"
      ? "United States"
      : norm === "en" || norm === "uk"
      ? "United Kingdom"
      : "Germany")
  );
}

// Master list of permitted European delivery countries: strictly France, Germany, Portugal, Italy, Spain
export const PERMITTED_EU_COUNTRIES = [
  {
    value: "France",
    code: "FR",
    names: {
      en: "France",
      fr: "France",
      de: "Frankreich (France)",
      es: "Francia (France)",
      por: "França (France)",
      pt: "França (France)",
      it: "Francia (France)",
    },
  },
  {
    value: "Germany",
    code: "DE",
    names: {
      en: "Germany",
      fr: "Allemagne (Germany)",
      de: "Deutschland (Germany)",
      es: "Alemania (Germany)",
      por: "Alemanha (Germany)",
      pt: "Alemanha (Germany)",
      it: "Germania (Germany)",
    },
  },
  {
    value: "Italy",
    code: "IT",
    names: {
      en: "Italy",
      fr: "Italie (Italy)",
      de: "Italien (Italy)",
      es: "Italia (Italy)",
      por: "Itália (Italy)",
      pt: "Itália (Italy)",
      it: "Italia (Italy)",
    },
  },
  {
    value: "Spain",
    code: "ES",
    names: {
      en: "Spain",
      fr: "Espagne (Spain)",
      de: "Spanien (Spain)",
      es: "España (Spain)",
      por: "Espanha (Spain)",
      pt: "Espanha (Spain)",
      it: "Spagna (Spain)",
    },
  },
  {
    value: "Portugal",
    code: "PT",
    names: {
      en: "Portugal",
      fr: "Portugal",
      de: "Portugal",
      es: "Portugal",
      por: "Portugal",
      pt: "Portugal",
      it: "Portogallo (Portugal)",
    },
  },
];

export const USA_COUNTRY = {
  value: "United States",
  code: "US",
  names: {
    en: "United States (USA)",
    fr: "États-Unis (USA)",
    de: "Vereinigte Staaten (USA)",
    es: "Estados Unidos (USA)",
    por: "Estados Unidos (USA)",
    pt: "Estados Unidos (USA)",
    it: "Stati Uniti (USA)",
  },
};

export const UK_COUNTRY = {
  value: "United Kingdom",
  code: "GB",
  names: {
    en: "United Kingdom (Free Mainland Delivery)",
    fr: "Royaume-Uni (UK)",
    de: "Vereinigtes Königreich (UK)",
    es: "Reino Unido (UK)",
    por: "Reino Unido (UK)",
    pt: "Reino Unido (UK)",
    it: "Regno Unito (UK)",
  },
};

/**
 * Returns available delivery countries:
 * - UK storefront (en / uk): Strictly United Kingdom (isolated)
 * - US storefront (us): Strictly United States (isolated)
 * - European storefronts (de, fr, es, it, por / pt): All permitted EU countries (France, Germany, Italy, Spain, Portugal).
 *   Cross-country delivery is permitted among EU countries, while UK and US are strictly excluded.
 *   The primary country matching the active storefront locale is sorted to the top.
 */
export function getDeliveryCountries(locale) {
  const norm = (locale || "en").toLowerCase();
  const langKey = norm === "pt" ? "por" : norm;

  const getLabel = (c) =>
    c.names[norm] || c.names[langKey] || c.names.en || c.value;

  if (norm === "en" || norm === "uk") {
    return [
      {
        value: UK_COUNTRY.value,
        label: UK_COUNTRY.names.en,
        code: UK_COUNTRY.code,
      },
    ];
  }

  if (norm === "us") {
    return [
      {
        value: USA_COUNTRY.value,
        label: "United States (Nationwide Delivery)",
        code: USA_COUNTRY.code,
      },
    ];
  }

  // European storefronts: de, fr, es, it, por / pt
  // Cross-country selection is permitted across all EU markets (FR, DE, IT, ES, PT).
  // The primary country for the active locale is placed first for customer convenience.
  const primaryCountryValue =
    DEFAULT_COUNTRY_BY_LOCALE[norm] ||
    DEFAULT_COUNTRY_BY_LOCALE[langKey] ||
    "Germany";

  const sortedEuCountries = [...PERMITTED_EU_COUNTRIES].sort((a, b) => {
    if (a.value === primaryCountryValue) return -1;
    if (b.value === primaryCountryValue) return 1;
    return a.value.localeCompare(b.value);
  });

  return sortedEuCountries.map((c) => ({
    value: c.value,
    label: getLabel(c),
    code: c.code,
  }));
}

/**
 * Returns allowed ISO country codes for Stripe / payment gateways
 */
export function getAllowedCountryCodes(locale) {
  return getDeliveryCountries(locale).map((c) => c.code);
}

/**
 * Validates whether a country is allowed for the specific storefront locale.
 * - UK allows strictly United Kingdom
 * - US allows strictly United States
 * - EU storefronts allow any of the 5 EU countries (France, Germany, Italy, Spain, Portugal),
 *   strictly rejecting UK and US.
 */
export function isCountryAllowedForLocale(country, locale) {
  if (!country) return false;
  const allowed = getDeliveryCountries(locale);
  const normCountry = String(country).toLowerCase().trim();
  return allowed.some((c) => {
    if (
      c.value.toLowerCase() === normCountry ||
      c.code.toLowerCase() === normCountry
    ) {
      return true;
    }
    if (
      normCountry.includes(c.value.toLowerCase()) ||
      normCountry.includes(c.code.toLowerCase())
    ) {
      return true;
    }
    const allObjs = [...PERMITTED_EU_COUNTRIES, USA_COUNTRY, UK_COUNTRY];
    const matchObj = allObjs.find((item) => item.value === c.value);
    if (matchObj?.names) {
      return Object.values(matchObj.names).some((name) => {
        const n = name.toLowerCase();
        return n.includes(normCountry) || normCountry.includes(n);
      });
    }
    return false;
  });
}

/**
 * Returns dynamic postal code placeholder depending on selected country or storefront locale
 */
export function getPostcodePlaceholder(locale, country) {
  const c = (country || "").toLowerCase();
  const loc = (locale || "").toLowerCase();

  // If country is specified, prioritize country-specific formatting
  if (c.includes("kingdom") || c.includes("uk") || c.includes("britain")) return "e.g. SW1A 1AA";
  if (c.includes("united states") || c.includes("usa")) return "e.g. 90210";
  if (c.includes("ital")) return "es. 00185 (CAP)";
  if (c.includes("germany") || c.includes("deutschland")) return "z.B. 10115 (PLZ)";
  if (c.includes("france") || c.includes("frankreich") || c.includes("francia")) return "ex. 75001 (Code postal)";
  if (c.includes("spain") || c.includes("españa") || c.includes("spanien")) return "ej. 28001 (Código postal)";
  if (c.includes("portugal")) return "ex. 1000-001";

  // Fallback to storefront locale
  if (loc === "en" || loc === "uk") return "e.g. SW1A 1AA";
  if (loc === "us") return "e.g. 90210";
  if (loc === "it") return "es. 00185 (CAP)";
  if (loc === "de") return "z.B. 10115 (PLZ)";
  if (loc === "fr") return "ex. 75001 (Code postal)";
  if (loc === "es") return "ej. 28001 (Código postal)";
  if (loc === "por" || loc === "pt") return "ex. 1000-001";
  return "e.g. 00100";
}

/**
 * Returns dynamic city placeholder depending on selected country or storefront locale
 */
export function getCityPlaceholder(locale, country) {
  const c = (country || "").toLowerCase();
  const loc = (locale || "").toLowerCase();

  // If country is specified, prioritize country
  if (c.includes("kingdom") || c.includes("uk") || c.includes("britain")) return "e.g. London";
  if (c.includes("united states") || c.includes("usa")) return "e.g. New York";
  if (c.includes("ital")) return "es. Roma";
  if (c.includes("germany") || c.includes("deutschland")) return "z.B. Berlin";
  if (c.includes("france") || c.includes("frankreich") || c.includes("francia")) return "ex. Paris";
  if (c.includes("spain") || c.includes("españa") || c.includes("spanien")) return "ej. Madrid";
  if (c.includes("portugal")) return "ex. Lisboa";

  // Fallback to storefront locale
  if (loc === "en" || loc === "uk") return "e.g. London";
  if (loc === "us") return "e.g. New York";
  if (loc === "it") return "es. Roma";
  if (loc === "de") return "z.B. Berlin";
  if (loc === "fr") return "ex. Paris";
  if (loc === "es") return "ej. Madrid";
  if (loc === "por" || loc === "pt") return "ex. Lisboa";
  return "City";
}

