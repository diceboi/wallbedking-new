/**
 * Google Merchant Center Country & Market Definitions (Client & Server safe)
 */
export const GOOGLE_FEED_COUNTRIES = {
  gb: {
    code: "gb",
    locale: "en",
    countryCode: "GB",
    name: "United Kingdom",
    nameHu: "Egyesült Királyság",
    currency: "GBP",
    currencySymbol: "£",
    flag: "🇬🇧",
    targetLanguage: "en",
    defaultShippingNote: "Free UK Mainland Delivery",
  },
  de: {
    code: "de",
    locale: "de",
    countryCode: "DE",
    name: "Germany",
    nameHu: "Németország",
    currency: "EUR",
    currencySymbol: "€",
    flag: "🇩🇪",
    targetLanguage: "de",
    defaultShippingNote: "Kostenlose EU-Lieferung",
  },
  fr: {
    code: "fr",
    locale: "fr",
    countryCode: "FR",
    name: "France",
    nameHu: "Franciaország",
    currency: "EUR",
    currencySymbol: "€",
    flag: "🇫🇷",
    targetLanguage: "fr",
    defaultShippingNote: "Livraison gratuite en France",
  },
  es: {
    code: "es",
    locale: "es",
    countryCode: "ES",
    name: "Spain",
    nameHu: "Spanyolország",
    currency: "EUR",
    currencySymbol: "€",
    flag: "🇪🇸",
    targetLanguage: "es",
    defaultShippingNote: "Envío gratuito a España",
  },
  it: {
    code: "it",
    locale: "it",
    countryCode: "IT",
    name: "Italy",
    nameHu: "Olaszország",
    currency: "EUR",
    currencySymbol: "€",
    flag: "🇮🇹",
    targetLanguage: "it",
    defaultShippingNote: "Spedizione gratuita in Italia",
  },
  pt: {
    code: "pt",
    locale: "por",
    countryCode: "PT",
    name: "Portugal",
    nameHu: "Portugália",
    currency: "EUR",
    currencySymbol: "€",
    flag: "🇵🇹",
    targetLanguage: "pt",
    defaultShippingNote: "Envio gratuito para Portugal",
  },
  us: {
    code: "us",
    locale: "us",
    countryCode: "US",
    name: "United States",
    nameHu: "Egyesült Államok",
    currency: "USD",
    currencySymbol: "$",
    flag: "🇺🇸",
    targetLanguage: "en",
    defaultShippingNote: "US Nationwide Delivery",
  },
  at: {
    code: "at",
    locale: "de",
    countryCode: "AT",
    name: "Austria",
    nameHu: "Ausztria",
    currency: "EUR",
    currencySymbol: "€",
    flag: "🇦🇹",
    targetLanguage: "de",
    defaultShippingNote: "Kostenlose Lieferung nach Österreich",
  },
  ie: {
    code: "ie",
    locale: "en",
    countryCode: "IE",
    name: "Ireland",
    nameHu: "Írország",
    currency: "EUR",
    currencySymbol: "€",
    flag: "🇮🇪",
    targetLanguage: "en",
    defaultShippingNote: "Delivery to Ireland",
  },
};

/**
 * Resolves alias inputs to normalized country configuration.
 */
export function resolveCountryConfig(countryParam = "gb") {
  if (!countryParam) return GOOGLE_FEED_COUNTRIES.gb;

  const raw = String(countryParam).toLowerCase().trim();
  const cleaned = raw.split(".")[0];

  const aliases = {
    uk: "gb",
    en: "gb",
    por: "pt",
  };

  const key = aliases[cleaned] || cleaned;
  return GOOGLE_FEED_COUNTRIES[key] || GOOGLE_FEED_COUNTRIES.gb;
}
