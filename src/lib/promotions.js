import defaultCampaigns from "@/data/promotional_campaigns.json";

const SETTINGS_KEY = "promotional_campaigns";

/**
 * Checks whether Supabase is configured in the environment.
 */
function getSupabaseCredentials() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return { url, key };
}

/**
 * Load all campaigns from Supabase checkout_settings with fallback to local JSON.
 * @param {Object} [options]
 * @param {boolean} [options.fresh=false] - If true, bypasses Next.js revalidation cache.
 */
export async function getCampaigns({ fresh = false } = {}) {
  const { url, key } = getSupabaseCredentials();
  if (url && key) {
    try {
      const fetchOpts = {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
      };
      if (fresh) {
        fetchOpts.cache = "no-store";
      } else {
        fetchOpts.next = { revalidate: 10, tags: ["promotions"] };
      }

      const res = await fetch(
        `${url}/rest/v1/checkout_settings?locale=eq.${SETTINGS_KEY}&select=config`,
        fetchOpts,
      );
      if (res.ok) {
        const rows = await res.json();
        const cfg = rows[0]?.config || rows[0]?.settings;
        if (rows && rows.length > 0 && Array.isArray(cfg?.campaigns)) {
          return cfg.campaigns;
        }
      }
    } catch (e) {
      console.warn("Could not load campaigns from Supabase, using local fallback:", e?.message);
    }
  }
  return defaultCampaigns;
}

/**
 * Save all campaigns to Supabase checkout_settings.
 */
export async function saveCampaigns(campaigns) {
  const { url, key } = getSupabaseCredentials();
  if (!url || !key) {
    throw new Error("Supabase credentials not configured");
  }

  const payload = {
    locale: SETTINGS_KEY,
    config: {
      campaigns,
      updated_at: new Date().toISOString(),
    },
  };

  const res = await fetch(`${url}/rest/v1/checkout_settings`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to save campaigns: ${res.status} ${errorText}`);
  }

  return true;
}

/**
 * Checks whether a campaign is allowed to run in a given storefront locale/market.
 * If target_markets is empty, undefined or contains the locale, returns true.
 *
 * @param {Object} campaign
 * @param {string} [locale]
 * @returns {boolean}
 */
export function isCampaignEligibleForLocale(campaign, locale) {
  if (!campaign) return false;
  if (
    !campaign.target_markets ||
    !Array.isArray(campaign.target_markets) ||
    campaign.target_markets.length === 0
  ) {
    return true;
  }
  if (!locale) return true;
  const norm = String(locale).toLowerCase();
  return campaign.target_markets.some((m) => String(m).toLowerCase() === norm);
}

/**
 * Resolves a localized text string for a section (e.g. top_bar, hero_banner).
 * Falls back to the root default text if translation for current locale is missing.
 *
 * @param {Object} sectionObj (e.g. campaign.hero_banner, campaign.top_bar)
 * @param {string} fieldName (e.g. "headline", "text", "badge")
 * @param {string} [locale] ("en", "de", "fr", "es", "por", "it", "us")
 * @param {string} [fallback=""]
 * @returns {string}
 */
export function getLocalizedCampaignField(sectionObj, fieldName, locale, fallback = "") {
  if (!sectionObj) return fallback;
  if (locale && sectionObj.translations && typeof sectionObj.translations === "object") {
    const loc = String(locale).toLowerCase();
    const locData = sectionObj.translations[loc];
    if (locData && typeof locData === "object") {
      const val = locData[fieldName];
      if (typeof val === "string" && val.trim().length > 0) {
        return val;
      }
    }
    // Fallback for US to EN translation if available
    if (loc === "us" && sectionObj.translations.en?.[fieldName]) {
      const enVal = sectionObj.translations.en[fieldName];
      if (typeof enVal === "string" && enVal.trim().length > 0) {
        return enVal;
      }
    }
  }
  const rootVal = sectionObj[fieldName];
  if (typeof rootVal === "string" && rootVal.length > 0) {
    return rootVal;
  }
  return fallback;
}

/**
 * Determines whether a campaign is currently active based on its schedule rules and target market.
 * @param {Object} campaign
 * @param {Date} [now]
 * @param {string} [locale]
 * @returns {boolean}
 */
export function isCampaignActive(campaign, now = new Date(), locale = null) {
  if (!campaign) return false;
  if (campaign.status === "inactive") return false;

  // Market eligibility check
  if (locale && !isCampaignEligibleForLocale(campaign, locale)) {
    return false;
  }

  const currentTs = now.getTime();

  // Fixed date boundary check (if configured)
  if (campaign.start_date) {
    const startTs = new Date(campaign.start_date).getTime();
    if (!isNaN(startTs) && currentTs < startTs) return false;
  }
  if (campaign.end_date) {
    const endTs = new Date(campaign.end_date).getTime();
    if (!isNaN(endTs) && currentTs > endTs) return false;
  }

  // Recurring schedule check
  if (campaign.schedule_type === "recurring" && campaign.recurring) {
    const { frequency, days_of_week, days_of_month, start_time, end_time } = campaign.recurring;

    // Check Day of Week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    if (frequency === "weekly" || frequency === "custom") {
      if (Array.isArray(days_of_week) && days_of_week.length > 0) {
        const currentDay = now.getUTCDay();
        if (!days_of_week.includes(currentDay)) {
          return false;
        }
      }
    }

    // Check Day of Month
    if (frequency === "monthly" && Array.isArray(days_of_month) && days_of_month.length > 0) {
      const currentMonthDay = now.getUTCDate();
      if (!days_of_month.includes(currentMonthDay)) {
        return false;
      }
    }

    // Check Time Window (HH:mm in UTC)
    if (start_time || end_time) {
      const currentMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
      if (start_time) {
        const [sh, sm] = start_time.split(":").map(Number);
        const startMinutes = (sh || 0) * 60 + (sm || 0);
        if (currentMinutes < startMinutes) return false;
      }
      if (end_time) {
        const [eh, em] = end_time.split(":").map(Number);
        const endMinutes = (eh || 0) * 60 + (em || 0);
        if (currentMinutes > endMinutes) return false;
      }
    }
  }

  return true;
}

let clientCampaignsCache = [];

/**
 * Update the client-side campaigns cache.
 * Called by PromotionsContext when fresh promotions are fetched.
 */
export function setClientCampaignsCache(campaigns) {
  if (Array.isArray(campaigns)) {
    clientCampaignsCache = campaigns;
  }
}

/**
 * Read the current cached client-side campaigns.
 */
export function getClientCampaignsCache() {
  return clientCampaignsCache;
}

/**
 * Returns all normalized category identifiers for a product.
 * @param {Object} product
 * @returns {string[]}
 */
export function getProductCategories(product) {
  if (!product) return [];
  const set = new Set();

  const addIf = (val) => {
    if (val && typeof val === "string") {
      set.add(val.trim().toLowerCase());
    }
  };

  addIf(product.parent_category);
  addIf(product.categoryKey);
  addIf(product.sub_category);

  if (product.category && typeof product.category === "string") {
    addIf(product.category);
    const top = product.category.split(">")[0].trim().toLowerCase();
    addIf(top);
  }

  // Categorical mappings
  const pCat = (product.parent_category || "").toLowerCase();
  const isMorphy =
    Boolean(product.isMorphy) ||
    pCat === "morphy-beds" ||
    (typeof product.name === "string" && product.name.includes("MORPHY")) ||
    (typeof product.title === "string" && product.title.includes("MORPHY"));

  if (isMorphy) {
    set.add("morphy-beds");
    set.add("beds");
  }

  if (pCat === "traditional-beds" || (!isMorphy && pCat.includes("bed"))) {
    set.add("traditional-beds");
    set.add("beds");
  }

  if (product.is_bundle || pCat === "bundles" || (product.slug || "").includes("bundle")) {
    set.add("bundles");
  }

  if (pCat === "tables" || product.categoryKey === "tables" || (product.slug || "").includes("table")) {
    set.add("tables");
  }

  if (pCat === "sofas" || (product.slug || "").includes("sofa")) {
    set.add("sofas");
  }

  if (pCat === "mattresses" || (product.slug || "").includes("mattress")) {
    set.add("mattresses");
  }

  if (pCat === "cabinets" || (product.slug || "").includes("cabinet")) {
    set.add("cabinets");
  }

  return Array.from(set);
}

/**
 * Checks if a product matches campaign target scope and does not hit exclusions.
 */
export function isProductEligibleForCampaign(product, campaign, locale = null) {
  if (!product || !campaign) return false;

  // Market eligibility check
  if (locale && !isCampaignEligibleForLocale(campaign, locale)) {
    return false;
  }

  const productCats = getProductCategories(product);
  const pId = String(product.id || "").toLowerCase();
  const pRawId = String(product.rawId || "").toLowerCase();
  const pSlug = (product.slug || "").toLowerCase();
  const pParentSlug = (product.parent_slug || "").toLowerCase();
  const pSku = (product.sku || "").toLowerCase();
  const pModel = (product.model || "").toLowerCase();

  const matchesIdentifier = (target) => {
    if (!target) return false;
    const t = String(target).trim().toLowerCase();
    return (
      t === pId ||
      t === pRawId ||
      t === pSlug ||
      t === pParentSlug ||
      t === pSku ||
      t === pModel
    );
  };

  // 1. Excluded categories take absolute precedence
  if (Array.isArray(campaign.excluded_categories) && campaign.excluded_categories.length > 0) {
    const isExcluded = campaign.excluded_categories.some((exc) => {
      const e = (exc || "").trim().toLowerCase();
      return productCats.includes(e);
    });
    if (isExcluded) return false;
  }

  // 2. Excluded products take absolute precedence
  if (Array.isArray(campaign.excluded_products) && campaign.excluded_products.length > 0) {
    if (campaign.excluded_products.some(matchesIdentifier)) {
      return false;
    }
  }

  // 3. Target scope
  if (campaign.apply_to === "all") {
    return true;
  }

  if (campaign.apply_to === "categories") {
    if (!Array.isArray(campaign.target_categories) || campaign.target_categories.length === 0) {
      return false;
    }
    return campaign.target_categories.some((tgt) => {
      const t = (tgt || "").trim().toLowerCase();
      return productCats.includes(t);
    });
  }

  if (campaign.apply_to === "products") {
    if (!Array.isArray(campaign.target_products) || campaign.target_products.length === 0) {
      return false;
    }
    return campaign.target_products.some(matchesIdentifier);
  }

  return false;
}

/**
 * Calculates promotional campaign discount for a product.
 * Evaluates active campaigns and applies the "Best Deal" (highest discount amount)
 * unless allow_stacking is enabled.
 *
 * @param {Object} product
 * @param {number} basePrice
 * @param {string} currency ("GBP" | "EUR" | "USD")
 * @param {Array} activeCampaigns
 * @returns {Object} { originalPrice, finalPrice, discountAmount, discountPercent, appliedCampaign, isPromotional }
 */
export function calculateCampaignDiscount(product, basePrice, currency = "GBP", activeCampaigns = [], locale = null) {
  const original = Number(basePrice) || 0;
  if (original <= 0 || !Array.isArray(activeCampaigns) || activeCampaigns.length === 0) {
    return {
      originalPrice: original,
      finalPrice: original,
      discountAmount: 0,
      discountPercent: 0,
      appliedCampaign: null,
      isPromotional: false,
    };
  }

  // Find all matching campaigns for this product and market
  const matching = activeCampaigns.filter((camp) =>
    isProductEligibleForCampaign(product, camp, locale),
  );

  if (matching.length === 0) {
    return {
      originalPrice: original,
      finalPrice: original,
      discountAmount: 0,
      discountPercent: 0,
      appliedCampaign: null,
      isPromotional: false,
    };
  }

  // Calculate discount for each matching campaign
  let bestDiscountAmount = 0;
  let bestCampaign = null;
  let bestPercent = 0;
  let bestPriority = -1;

  for (const camp of matching) {
    let amount = 0;
    let pct = 0;
    if (camp.discount_type === "percentage") {
      pct = Number(camp.discount_value) || 0;
      amount = (original * pct) / 100;
    } else if (camp.discount_type === "fixed") {
      amount = Number(camp.discount_value) || 0;
      pct = original > 0 ? (amount / original) * 100 : 0;
    }

    const priority = Number(camp.priority) || 0;

    // A campaign takes precedence if:
    // 1. It has higher priority than current best, OR
    // 2. Same priority, but yields a better discount amount (Best Deal principle)
    if (
      priority > bestPriority ||
      (priority === bestPriority && amount > bestDiscountAmount)
    ) {
      bestDiscountAmount = amount;
      bestCampaign = camp;
      bestPercent = pct;
      bestPriority = priority;
    }
  }

  if (bestDiscountAmount <= 0) {
    return {
      originalPrice: original,
      finalPrice: original,
      discountAmount: 0,
      discountPercent: 0,
      appliedCampaign: null,
      isPromotional: false,
    };
  }

  const finalPrice = Math.max(0, original - bestDiscountAmount);

  return {
    originalPrice: original,
    finalPrice: Math.round(finalPrice * 100) / 100,
    discountAmount: Math.round(bestDiscountAmount * 100) / 100,
    discountPercent: Math.round(bestPercent),
    appliedCampaign: bestCampaign,
    isPromotional: true,
  };
}
