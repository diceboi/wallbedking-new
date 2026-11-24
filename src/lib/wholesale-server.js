// Server-only Wholesale / B2B Data, Pricing & Authorization Library
import { supabaseAdmin } from "@/lib/supabase";
import seedWholesalePrices from "@/data/wholesale-prices.json";
import {
  DEFAULT_WHOLESALE_TIERS_CONFIG,
  DEFAULT_WHOLESALE_PAYMENT_SETTINGS,
  normalizeWholesaleMarket,
  normalizeWholesaleTier,
  resolveEffectiveTierRule,
  getCurrencySymbol,
} from "@/lib/wholesale-constants";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const TIERS_SETTINGS_KEY = "wholesale_tiers";
const CHECKOUT_SETTINGS_KEY = "wholesale_checkout";
const PRICES_SETTINGS_KEY = "wholesale_product_prices";

function getServiceHeaders() {
  return {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    "Content-Type": "application/json",
  };
}

async function readCheckoutSettingsConfig(settingsKey) {
  if (!SUPABASE_URL || !SERVICE_KEY) return null;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/checkout_settings?locale=eq.${encodeURIComponent(settingsKey)}&select=config`,
      { headers: getServiceHeaders(), cache: "no-store" }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    return rows?.[0]?.config || null;
  } catch (err) {
    console.warn(`[wholesale-server] Failed reading ${settingsKey}:`, err?.message);
    return null;
  }
}

async function writeCheckoutSettingsConfig(settingsKey, configObj) {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error("Supabase service credentials are not configured.");
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/checkout_settings`, {
    method: "POST",
    headers: {
      ...getServiceHeaders(),
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({
      locale: settingsKey,
      config: {
        ...configObj,
        updated_at: new Date().toISOString(),
      },
    }),
  });
  if (!res.ok) {
    throw new Error(`Failed saving ${settingsKey}: ${res.status} ${await res.text()}`);
  }
  return true;
}

export async function getWholesaleTiersConfig() {
  const stored = await readCheckoutSettingsConfig(TIERS_SETTINGS_KEY);
  return {
    tierDefaults: {
      ...DEFAULT_WHOLESALE_TIERS_CONFIG.tierDefaults,
      ...(stored?.tierDefaults || {}),
    },
    marketOverrides: {
      ...(stored?.marketOverrides || {}),
    },
  };
}

export async function saveWholesaleTiersConfig(nextConfig) {
  const sanitized = {
    tierDefaults: {
      ...DEFAULT_WHOLESALE_TIERS_CONFIG.tierDefaults,
      ...(nextConfig?.tierDefaults || {}),
    },
    marketOverrides: {
      ...(nextConfig?.marketOverrides || {}),
    },
  };
  await writeCheckoutSettingsConfig(TIERS_SETTINGS_KEY, sanitized);
  return sanitized;
}

export async function getWholesaleCheckoutSettings() {
  const stored = await readCheckoutSettingsConfig(CHECKOUT_SETTINGS_KEY);
  const storedPayments = stored?.payments || stored || {};
  return {
    bankTransfer: {
      ...DEFAULT_WHOLESALE_PAYMENT_SETTINGS.bankTransfer,
      ...(storedPayments.bankTransfer || {}),
    },
    paypal: {
      ...DEFAULT_WHOLESALE_PAYMENT_SETTINGS.paypal,
      ...(storedPayments.paypal || {}),
    },
    stripe: {
      ...DEFAULT_WHOLESALE_PAYMENT_SETTINGS.stripe,
      ...(storedPayments.stripe || {}),
    },
  };
}

export async function saveWholesaleCheckoutSettings(payments) {
  const sanitized = {
    bankTransfer: {
      ...DEFAULT_WHOLESALE_PAYMENT_SETTINGS.bankTransfer,
      ...(payments?.bankTransfer || {}),
    },
    paypal: {
      ...DEFAULT_WHOLESALE_PAYMENT_SETTINGS.paypal,
      ...(payments?.paypal || {}),
    },
    stripe: {
      ...DEFAULT_WHOLESALE_PAYMENT_SETTINGS.stripe,
      ...(payments?.stripe || {}),
    },
  };
  await writeCheckoutSettingsConfig(CHECKOUT_SETTINGS_KEY, { payments: sanitized });
  return sanitized;
}

function parseNullableNumber(val) {
  if (val === "" || val === null || val === undefined) return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
}

/**
 * Loads authoritative wholesale pricing records across:
 * 1) Local seed file (103 Smart Tables imported from Google Sheet)
 * 2) Supabase checkout_settings (`wholesale_product_prices`)
 * 3) Native Supabase `products` columns (if `supabase/wholesale_schema.sql` has been applied)
 */
export async function getWholesaleProductPricesMap() {
  const merged = {};

  // 1. Seed defaults
  if (seedWholesalePrices && typeof seedWholesalePrices === "object") {
    for (const [id, rec] of Object.entries(seedWholesalePrices)) {
      merged[String(id)] = { ...rec };
    }
  }

  // 2. Supabase checkout_settings overrides
  const stored = await readCheckoutSettingsConfig(PRICES_SETTINGS_KEY);
  if (stored?.prices && typeof stored.prices === "object") {
    for (const [id, rec] of Object.entries(stored.prices)) {
      merged[String(id)] = {
        ...(merged[String(id)] || {}),
        ...rec,
      };
    }
  }

  // 3. Native columns on public.products (takes precedence when non-null)
  if (SUPABASE_URL && SERVICE_KEY) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/products?select=id,ean,sku,wholesale_hk_usd,wholesale_uk_gbp,wholesale_eu_eur,wholesale_us_usd,container_qty,wholesale_visible`,
        { headers: getServiceHeaders(), cache: "no-store" }
      );
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows)) {
          for (const row of rows) {
            const key = String(row.id);
            const existing = merged[key] || {};
            merged[key] = {
              ...existing,
              id: row.id,
              ean: row.ean || existing.ean || null,
              sku: row.sku || existing.sku || null,
              wholesale_hk_usd:
                row.wholesale_hk_usd !== null && row.wholesale_hk_usd !== undefined
                  ? Number(row.wholesale_hk_usd)
                  : existing.wholesale_hk_usd ?? null,
              wholesale_uk_gbp:
                row.wholesale_uk_gbp !== null && row.wholesale_uk_gbp !== undefined
                  ? Number(row.wholesale_uk_gbp)
                  : existing.wholesale_uk_gbp ?? null,
              wholesale_eu_eur:
                row.wholesale_eu_eur !== null && row.wholesale_eu_eur !== undefined
                  ? Number(row.wholesale_eu_eur)
                  : existing.wholesale_eu_eur ?? null,
              wholesale_us_usd:
                row.wholesale_us_usd !== null && row.wholesale_us_usd !== undefined
                  ? Number(row.wholesale_us_usd)
                  : existing.wholesale_us_usd ?? null,
              container_qty:
                row.container_qty !== null && row.container_qty !== undefined
                  ? Number(row.container_qty)
                  : existing.container_qty ?? null,
              wholesale_visible:
                row.wholesale_visible !== null && row.wholesale_visible !== undefined
                  ? Boolean(row.wholesale_visible)
                  : existing.wholesale_visible !== false,
            };
          }
        }
      }
    } catch {
      // Native columns not created yet — fallback to checkout_settings seamlessly
    }
  }

  return merged;
}

export async function saveWholesaleProductPrice(productId, fields) {
  const key = String(productId);
  const currentMap = await getWholesaleProductPricesMap();
  const prev = currentMap[key] || { id: Number(productId) || productId };

  const updatedRecord = {
    ...prev,
    id: Number(productId) || productId,
    wholesale_hk_usd:
      fields.wholesale_hk_usd !== undefined
        ? parseNullableNumber(fields.wholesale_hk_usd)
        : prev.wholesale_hk_usd ?? null,
    wholesale_uk_gbp:
      fields.wholesale_uk_gbp !== undefined
        ? parseNullableNumber(fields.wholesale_uk_gbp)
        : prev.wholesale_uk_gbp ?? null,
    wholesale_eu_eur:
      fields.wholesale_eu_eur !== undefined
        ? parseNullableNumber(fields.wholesale_eu_eur)
        : prev.wholesale_eu_eur ?? null,
    wholesale_us_usd:
      fields.wholesale_us_usd !== undefined
        ? parseNullableNumber(fields.wholesale_us_usd)
        : prev.wholesale_us_usd ?? null,
    container_qty:
      fields.container_qty !== undefined
        ? parseNullableNumber(fields.container_qty)
        : prev.container_qty ?? null,
    wholesale_visible:
      fields.wholesale_visible !== undefined
        ? Boolean(fields.wholesale_visible)
        : prev.wholesale_visible !== false,
  };

  currentMap[key] = updatedRecord;
  await writeCheckoutSettingsConfig(PRICES_SETTINGS_KEY, { prices: currentMap });

  // Also write to native public.products columns if schema migration has been applied
  if (SUPABASE_URL && SERVICE_KEY) {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${encodeURIComponent(key)}`, {
        method: "PATCH",
        headers: {
          ...getServiceHeaders(),
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          wholesale_hk_usd: updatedRecord.wholesale_hk_usd,
          wholesale_uk_gbp: updatedRecord.wholesale_uk_gbp,
          wholesale_eu_eur: updatedRecord.wholesale_eu_eur,
          wholesale_us_usd: updatedRecord.wholesale_us_usd,
          container_qty: updatedRecord.container_qty,
          wholesale_visible: updatedRecord.wholesale_visible,
        }),
      });
    } catch {
      // Ignore if native columns aren't created yet
    }
  }

  return updatedRecord;
}

export async function syncWholesalePricesToProductsTable() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    return { synced: 0, schemaMissing: true, error: "Supabase credentials missing." };
  }
  const map = await getWholesaleProductPricesMap();
  const entries = Object.entries(map);
  if (entries.length === 0) return { synced: 0, schemaMissing: false };

  // Probe first row to check if columns exist
  const [firstId, firstRec] = entries[0];
  const probe = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${encodeURIComponent(firstId)}`, {
    method: "PATCH",
    headers: { ...getServiceHeaders(), Prefer: "return=minimal" },
    body: JSON.stringify({
      wholesale_hk_usd: firstRec.wholesale_hk_usd ?? null,
      wholesale_uk_gbp: firstRec.wholesale_uk_gbp ?? null,
      wholesale_eu_eur: firstRec.wholesale_eu_eur ?? null,
      wholesale_us_usd: firstRec.wholesale_us_usd ?? null,
      container_qty: firstRec.container_qty ?? null,
      wholesale_visible: firstRec.wholesale_visible !== false,
    }),
  });

  if (!probe.ok) {
    const errText = await probe.text();
    if (/Could not find|column/i.test(errText)) {
      return {
        synced: 0,
        schemaMissing: true,
        error: "Native wholesale columns not found on public.products yet. Run supabase/wholesale_schema.sql in Supabase SQL Editor first.",
      };
    }
    return { synced: 0, schemaMissing: false, error: errText };
  }

  let synced = 1;
  for (let i = 1; i < entries.length; i++) {
    const [id, rec] = entries[i];
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { ...getServiceHeaders(), Prefer: "return=minimal" },
      body: JSON.stringify({
        wholesale_hk_usd: rec.wholesale_hk_usd ?? null,
        wholesale_uk_gbp: rec.wholesale_uk_gbp ?? null,
        wholesale_eu_eur: rec.wholesale_eu_eur ?? null,
        wholesale_us_usd: rec.wholesale_us_usd ?? null,
        container_qty: rec.container_qty ?? null,
        wholesale_visible: rec.wholesale_visible !== false,
      }),
    });
    if (res.ok) synced++;
  }

  return { synced, total: entries.length, schemaMissing: false };
}

/**
 * Extracts Supabase access token from Authorization header or auth cookies.
 */
export function extractAuthTokenFromRequest(request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const tok = authHeader.slice(7).trim();
    if (tok) return tok;
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/sb-[a-z0-9]+-auth-token=([^;]+)/);
  if (match) {
    try {
      const parsed = JSON.parse(decodeURIComponent(match[1]));
      const tok = Array.isArray(parsed) ? parsed[0] : parsed?.access_token;
      if (tok) return tok;
    } catch {
      // ignore
    }
  }

  const chunk0 = cookieHeader.match(/sb-[a-z0-9]+-auth-token\.0=([^;]+)/);
  if (chunk0) {
    try {
      let combined = decodeURIComponent(chunk0[1]);
      const chunk1 = cookieHeader.match(/sb-[a-z0-9]+-auth-token\.1=([^;]+)/);
      if (chunk1) combined += decodeURIComponent(chunk1[1]);
      const parsed = JSON.parse(combined);
      const tok = Array.isArray(parsed) ? parsed[0] : parsed?.access_token;
      if (tok) return tok;
    } catch {
      // ignore
    }
  }

  return null;
}

/**
 * Resolves the authenticated user and authoritative wholesale partner permissions
 * directly from Supabase Auth + public.profiles.
 */
export async function resolveWholesaleUserFromRequest(request, fallbackLocale = "en") {
  const token = extractAuthTokenFromRequest(request);
  if (!token || !supabaseAdmin) {
    return {
      authenticated: false,
      isAdmin: false,
      isWholesale: false,
      user: null,
      partner: null,
    };
  }

  try {
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return {
        authenticated: false,
        isAdmin: false,
        isWholesale: false,
        user: null,
        partner: null,
      };
    }

    let profile = null;
    try {
      const { data } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      profile = data || null;
    } catch {
      profile = null;
    }

    const meta = user.user_metadata || {};
    const rawRole = String(profile?.role || meta.role || "customer").toLowerCase();
    const isAdmin =
      rawRole === "admin" ||
      user.email?.toLowerCase() === "diceboii13@gmail.com" ||
      user.email?.toLowerCase() === "szasz.szabolcs1995@gmail.com";

    const rawTier = profile?.wholesale_tier || meta.wholesale_tier || null;
    const wholesaleTier = normalizeWholesaleTier(rawTier);
    const wholesaleMarket = normalizeWholesaleMarket(
      profile?.wholesale_market || meta.wholesale_market || fallbackLocale || "en"
    );
    const discountOverride =
      profile?.wholesale_discount_override ?? meta.wholesale_discount_override ?? null;
    const companyName = profile?.company_name || meta.company_name || "";
    const vatNumber = profile?.vat_number || meta.vat_number || "";

    const isWholesale = Boolean(isAdmin || rawRole === "wholesale" || wholesaleTier);
    const tiersConfig = await getWholesaleTiersConfig();
    const effectiveRule = isWholesale
      ? resolveEffectiveTierRule(
          tiersConfig,
          isAdmin && !rawTier ? fallbackLocale : wholesaleMarket,
          wholesaleTier || "trade_partner",
          discountOverride
        )
      : null;

    return {
      authenticated: true,
      isAdmin,
      isWholesale,
      user,
      partner: isWholesale
        ? {
            userId: user.id,
            email: user.email,
            fullName: profile?.full_name || meta.full_name || user.email?.split("@")[0] || "Partner",
            role: isAdmin ? "admin" : "wholesale",
            wholesaleTier: effectiveRule.tier,
            wholesaleMarket: effectiveRule.market,
            roleKey: effectiveRule.roleKey,
            discountPercent: effectiveRule.discountPercent,
            discountOverride,
            allowSingleUnit: effectiveRule.allowSingleUnit,
            allowContainer: effectiveRule.allowContainer,
            priceList: effectiveRule.priceList,
            companyName,
            vatNumber,
          }
        : null,
    };
  } catch (err) {
    console.warn("[wholesale-server] resolveWholesaleUserFromRequest error:", err?.message);
    return {
      authenticated: false,
      isAdmin: false,
      isWholesale: false,
      user: null,
      partner: null,
    };
  }
}

/**
 * Computes net wholesale price (excl. VAT) and container total for a single product
 * using the partner's market currency first, falling back to `wholesale_hk_usd` (USD).
 */
export function computeWholesaleProductPricing(priceRecord, effectiveRule) {
  if (!priceRecord) return null;
  if (priceRecord.wholesale_visible === false) {
    return { wholesaleVisible: false, hasPrice: false };
  }

  const hkUsd = Number(priceRecord.wholesale_hk_usd);
  const ukGbp = Number(priceRecord.wholesale_uk_gbp);
  const euEur = Number(priceRecord.wholesale_eu_eur);
  const usUsd = Number(priceRecord.wholesale_us_usd);

  const market = normalizeWholesaleMarket(effectiveRule?.market || "en");
  const prefList = effectiveRule?.priceList || "auto";

  let basePrice = null;
  let currency = "USD";
  let source = "hk_usd";

  const tryPick = (listCode) => {
    if (listCode === "uk_gbp" && Number.isFinite(ukGbp) && ukGbp > 0) {
      basePrice = ukGbp;
      currency = "GBP";
      source = "uk_gbp";
      return true;
    }
    if (listCode === "eu_eur" && Number.isFinite(euEur) && euEur > 0) {
      basePrice = euEur;
      currency = "EUR";
      source = "eu_eur";
      return true;
    }
    if (listCode === "us_usd" && Number.isFinite(usUsd) && usUsd > 0) {
      basePrice = usUsd;
      currency = "USD";
      source = "us_usd";
      return true;
    }
    if (listCode === "hk_usd" && Number.isFinite(hkUsd) && hkUsd > 0) {
      basePrice = hkUsd;
      currency = "USD";
      source = "hk_usd";
      return true;
    }
    return false;
  };

  if (prefList !== "auto") {
    tryPick(prefList);
  }

  if (basePrice === null) {
    if (market === "en") {
      tryPick("uk_gbp") || tryPick("hk_usd");
    } else if (market === "us") {
      tryPick("us_usd") || tryPick("hk_usd");
    } else {
      // EU markets (de, fr, es, it, por): prefer EU EUR if set, otherwise fallback to HK USD
      tryPick("eu_eur") || tryPick("hk_usd");
    }
  }

  if (basePrice === null) {
    return {
      wholesaleVisible: true,
      hasPrice: false,
      containerQty: Number.isFinite(Number(priceRecord.container_qty)) && Number(priceRecord.container_qty) > 0
        ? Math.floor(Number(priceRecord.container_qty))
        : null,
    };
  }

  const discountPercent = Math.max(0, Math.min(90, Number(effectiveRule?.discountPercent) || 0));
  const unitPrice = Math.round(basePrice * (1 - discountPercent / 100) * 100) / 100;
  const rawContainerQty = Number(priceRecord.container_qty);
  const containerQty = Number.isFinite(rawContainerQty) && rawContainerQty > 0 ? Math.floor(rawContainerQty) : null;
  const containerTotal = containerQty ? Math.round(unitPrice * containerQty * 100) / 100 : null;

  return {
    wholesaleVisible: true,
    hasPrice: true,
    basePrice,
    unitPrice,
    currency,
    currencySymbol: getCurrencySymbol(currency),
    source,
    isFallbackUsd: source === "hk_usd" && market !== "us",
    discountPercent,
    containerQty,
    containerTotal,
    vatNote: "Excl. VAT (Net)",
  };
}
