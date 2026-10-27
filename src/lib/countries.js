/**
 * Centralized Storefront Delivery Countries and Regional Address Configurations
 * Strictly limited to Wall Bed King operational markets:
 * France, Germany, Portugal, Italy, Spain, USA (and UK for English storefront).
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

// Master list of permitted European delivery countries: strictly France, Germany, Portugal, Italy, Spain
const PERMITTED_EU_COUNTRIES = [
  {
    value: "France",
    code: "FR",
    names: {
      en: "France",
      fr: "France",
      de: "Frankreich (France)",
      es: "Francia (France)",
      por: "França (France)",
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
      it: "Germania (Germany)",
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
      it: "Portogallo (Portugal)",
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
      it: "Spagna (Spain)",
    },
  },
];

const USA_COUNTRY = {
  value: "United States",
  code: "US",
  names: {
    en: "United States (USA)",
    fr: "États-Unis (USA)",
    de: "Vereinigte Staaten (USA)",
    es: "Estados Unidos (USA)",
    por: "Estados Unidos (USA)",
    it: "Stati Uniti (USA)",
  },
};

const UK_COUNTRY = {
  value: "United Kingdom",
  code: "GB",
  names: {
    en: "United Kingdom (Free Mainland Delivery)",
    fr: "Royaume-Uni (UK)",
    de: "Vereinigtes Königreich (UK)",
    es: "Reino Unido (UK)",
    por: "Reino Unido (UK)",
    it: "Regno Unito (UK)",
  },
};

/**
 * Returns available delivery countries strictly limited to the operational market of the storefront locale:
 * - Italian storefront (it): Strictly Italy
 * - German storefront (de): Strictly Germany
 * - French storefront (fr): Strictly France
 * - Spanish storefront (es): Strictly Spain
 * - Portuguese storefront (por / pt): Strictly Portugal
 * - US storefront (us): Strictly United States
 * - UK storefront (en / uk): Strictly United Kingdom
 */
export function getDeliveryCountries(locale) {
  const norm = (locale || "en").toLowerCase();

  const getLabel = (c) => c.names[norm] || c.names.en || c.value;

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

  // European storefronts: de, fr, es, por, it
  const primaryCountryValue = DEFAULT_COUNTRY_BY_LOCALE[norm] || "Germany";
  const primaryObj =
    PERMITTED_EU_COUNTRIES.find((c) => c.value === primaryCountryValue) ||
    PERMITTED_EU_COUNTRIES[1];

  const localizedPrimaryLabel = {
    it: "Italia (Italy) — Spedizione Gratuita",
    fr: "France — Livraison Gratuite",
    de: "Deutschland (Germany) — Kostenlose Lieferung",
    es: "España (Spain) — Envío Gratuito",
    por: "Portugal — Envio Gratuito",
    pt: "Portugal — Envio Gratuito",
  }[norm];

  return [
    {
      value: primaryObj.value,
      label: localizedPrimaryLabel || getLabel(primaryObj),
      code: primaryObj.code,
    },
  ];
}

/**
 * Validates whether a country is allowed for the specific storefront locale.
 */
export function isCountryAllowedForLocale(country, locale) {
  if (!country) return false;
  const allowed = getDeliveryCountries(locale);
  const normCountry = String(country).toLowerCase().trim();
  return allowed.some(
    (c) =>
      c.value.toLowerCase() === normCountry ||
      c.code.toLowerCase() === normCountry ||
      normCountry.includes(c.value.toLowerCase()) ||
      normCountry.includes(c.code.toLowerCase())
  );
}

/**
 * Returns dynamic postal code placeholder depending on locale or country
 */
export function getPostcodePlaceholder(locale, country) {
  const c = (country || "").toLowerCase();
  const loc = (locale || "").toLowerCase();

  if (c.includes("kingdom") || loc === "en") {
    return "e.g. SW1A 1AA";
  }
  if (c.includes("united states") || c.includes("usa") || loc === "us") {
    return "e.g. 90210";
  }
  if (c.includes("ital") || loc === "it") {
    return "es. 00185 (CAP)";
  }
  if (c.includes("germany") || c.includes("deutschland") || loc === "de") {
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
  if (c.includes("united states") || c.includes("usa") || loc === "us") return "e.g. New York";
  if (c.includes("ital") || loc === "it") return "es. Roma";
  if (c.includes("germany") || c.includes("deutschland") || loc === "de") return "z.B. Berlin";
  if (c.includes("france") || loc === "fr") return "ex. Paris";
  if (c.includes("spain") || c.includes("españa") || loc === "es") return "ej. Madrid";
  if (c.includes("portugal") || loc === "por") return "ex. Lisboa";
  return "City";
}
