// Client-safe Wholesale / B2B Constants & Pure Helpers
// IMPORTANT: Never put confidential wholesale prices in this file!

export const WHOLESALE_MARKETS = [
  { code: "en", label: "UK", name: "United Kingdom", flag: "🇬🇧", currency: "GBP", symbol: "£" },
  { code: "us", label: "US", name: "United States", flag: "🇺🇸", currency: "USD", symbol: "$" },
  { code: "de", label: "DE", name: "Germany / Austria", flag: "🇩🇪", currency: "EUR", symbol: "€" },
  { code: "fr", label: "FR", name: "France", flag: "🇫🇷", currency: "EUR", symbol: "€" },
  { code: "es", label: "ES", name: "Spain", flag: "🇪🇸", currency: "EUR", symbol: "€" },
  { code: "it", label: "IT", name: "Italy", flag: "🇮🇹", currency: "EUR", symbol: "€" },
  { code: "por", label: "POR", name: "Portugal", flag: "🇵🇹", currency: "EUR", symbol: "€" },
];

export const WHOLESALE_TIER_TYPES = [
  { id: "retailer", label: "Retailer", shortLabel: "Retailer" },
  { id: "trade_partner", label: "Trade Partner", shortLabel: "Trade Partner" },
  { id: "fitter_installer", label: "Fitter / Installer", shortLabel: "Fitter / Installer" },
  { id: "furniture_maker", label: "Furniture Maker / Joiner", shortLabel: "Furniture Maker" },
  { id: "interior_designer", label: "Interior Designer", shortLabel: "Interior Designer" },
  { id: "influencer", label: "Influencer", shortLabel: "Influencer" },
];

export const DEFAULT_WHOLESALE_TIERS_CONFIG = {
  // Global defaults per partner tier (can be overridden per market+tier key e.g. "fr-retailer")
  tierDefaults: {
    retailer: { discountPercent: 0, allowSingleUnit: true, allowContainer: true, priceList: "auto" },
    trade_partner: { discountPercent: 0, allowSingleUnit: true, allowContainer: true, priceList: "auto" },
    fitter_installer: { discountPercent: 0, allowSingleUnit: true, allowContainer: true, priceList: "auto" },
    furniture_maker: { discountPercent: 0, allowSingleUnit: true, allowContainer: true, priceList: "auto" },
    interior_designer: { discountPercent: 0, allowSingleUnit: true, allowContainer: true, priceList: "auto" },
    influencer: { discountPercent: 0, allowSingleUnit: true, allowContainer: false, priceList: "auto" },
  },
  // Specific market-tier overrides, keyed by `${market}-${tier}` (e.g. "fr-retailer")
  marketOverrides: {},
};

export const DEFAULT_WHOLESALE_PAYMENT_SETTINGS = {
  bankTransfer: {
    enabled: true,
    label: "Bank Transfer / Proforma Wire",
    sublabel: "B2B Net Invoice • Wire Transfer",
    instructions:
      "Place your wholesale order with net prices (excl. VAT). Shipping will be confirmed separately or arranged directly by the buyer.",
  },
  paypal: {
    enabled: false,
    label: "PayPal Business",
    sublabel: "Direct PayPal Settlement",
  },
  stripe: {
    enabled: false,
    label: "Credit / Debit Card (Stripe)",
    sublabel: "Corporate Card Payment",
  },
};

export function normalizeWholesaleMarket(market = "en") {
  const m = String(market || "en").toLowerCase().trim();
  if (m === "pt") return "por";
  if (m === "gb" || m === "uk" || m === "en_uk") return "en";
  return WHOLESALE_MARKETS.some((item) => item.code === m) ? m : "en";
}

export function normalizeWholesaleTier(tier) {
  if (!tier) return null;
  const t = String(tier).toLowerCase().trim().replace(/[\s/]+/g, "_").replace(/-/g, "_");
  if (t === "furniture_maker_joiner" || t === "joiner") return "furniture_maker";
  return WHOLESALE_TIER_TYPES.some((item) => item.id === t) ? t : null;
}

export function formatWholesaleRoleKey(market, tier) {
  const m = normalizeWholesaleMarket(market);
  const t = normalizeWholesaleTier(tier);
  if (!t) return null;
  return `${m}-${t.replace(/_/g, "-")}`;
}

export function getWholesaleMarketMeta(market = "en") {
  const code = normalizeWholesaleMarket(market);
  return WHOLESALE_MARKETS.find((m) => m.code === code) || WHOLESALE_MARKETS[0];
}

export function getWholesaleTierMeta(tier) {
  const id = normalizeWholesaleTier(tier);
  return WHOLESALE_TIER_TYPES.find((t) => t.id === id) || null;
}

export function resolveEffectiveTierRule(
  tiersConfig = DEFAULT_WHOLESALE_TIERS_CONFIG,
  market = "en",
  tier = "trade_partner",
  discountOverride = null
) {
  const normMarket = normalizeWholesaleMarket(market);
  const normTier = normalizeWholesaleTier(tier) || "trade_partner";
  const key = `${normMarket}-${normTier}`;
  const dashKey = `${normMarket}-${normTier.replace(/_/g, "-")}`;

  const baseDefault =
    tiersConfig?.tierDefaults?.[normTier] ||
    DEFAULT_WHOLESALE_TIERS_CONFIG.tierDefaults[normTier] || {
      discountPercent: 0,
      allowSingleUnit: true,
      allowContainer: true,
      priceList: "auto",
    };

  const override =
    tiersConfig?.marketOverrides?.[key] ||
    tiersConfig?.marketOverrides?.[dashKey] ||
    {};

  const merged = {
    ...baseDefault,
    ...override,
  };

  const parsedOverride =
    discountOverride !== null && discountOverride !== undefined && discountOverride !== ""
      ? Number(discountOverride)
      : null;

  const finalDiscount =
    parsedOverride !== null && Number.isFinite(parsedOverride) && parsedOverride >= 0 && parsedOverride <= 90
      ? parsedOverride
      : Math.max(0, Math.min(90, Number(merged.discountPercent) || 0));

  return {
    market: normMarket,
    tier: normTier,
    roleKey: dashKey,
    discountPercent: finalDiscount,
    allowSingleUnit: merged.allowSingleUnit !== false,
    allowContainer: merged.allowContainer !== false,
    priceList: merged.priceList || "auto", // "auto" | "hk_usd" | "uk_gbp" | "eu_eur" | "us_usd"
  };
}

export function getCurrencySymbol(currency = "USD") {
  const c = String(currency || "USD").toUpperCase();
  if (c === "GBP") return "£";
  if (c === "EUR") return "€";
  return "$";
}

export function formatWholesaleMoney(amount, currency = "USD") {
  const num = Number(amount);
  if (!Number.isFinite(num)) return "";
  const c = String(currency || "USD").toUpperCase();
  const sym = getCurrencySymbol(c);
  const formatted = num.toLocaleString("en-US", {
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${sym}${formatted}`;
}
