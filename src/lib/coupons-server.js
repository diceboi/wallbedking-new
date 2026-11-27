import { supabaseAdmin } from "@/lib/supabase";

const COUPONS_SETTINGS_KEY = "coupons_registry";
const AFFILIATE_CLICKS_KEY = "affiliate_clicks_stats";
const AFFILIATE_PAYOUTS_KEY = "affiliate_payouts";

function getSupabaseRestCreds() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return { url, key };
}

async function readSettingsRow(settingsKey) {
  const { url, key } = getSupabaseRestCreds();
  if (!url || !key) return null;
  try {
    const res = await fetch(
      `${url}/rest/v1/checkout_settings?locale=eq.${encodeURIComponent(settingsKey)}&select=config`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        cache: "no-store",
      }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    return rows?.[0]?.config || null;
  } catch (err) {
    console.warn(`[coupons-server] readSettingsRow(${settingsKey}) notice:`, err?.message);
    return null;
  }
}

async function writeSettingsRow(settingsKey, config) {
  const { url, key } = getSupabaseRestCreds();
  if (!url || !key) throw new Error("Supabase credentials not configured");
  const res = await fetch(`${url}/rest/v1/checkout_settings`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({
      locale: settingsKey,
      config: { ...config, updated_at: new Date().toISOString() },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed saving ${settingsKey}: ${res.status} ${text}`);
  }
  return true;
}

export function normalizeCouponCode(raw) {
  return String(raw || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "");
}

export function sanitizeCouponPayload(input = {}, existing = null) {
  const code = normalizeCouponCode(input.code || existing?.code || "");
  if (!code) {
    throw new Error("Coupon code is required (letters, numbers, - or _).");
  }
  const discountType = input.discount_type === "fixed" ? "fixed" : "percent";
  const rawDiscountVal = Number(input.discount_value ?? existing?.discount_value ?? 0);
  const discountValue = Number.isFinite(rawDiscountVal)
    ? Math.max(0, discountType === "percent" ? Math.min(95, rawDiscountVal) : rawDiscountVal)
    : 0;

  const rawFixed = input.fixed_amounts || existing?.fixed_amounts || {};
  const fixedAmounts = {
    GBP: rawFixed.GBP !== "" && rawFixed.GBP != null ? Math.max(0, Number(rawFixed.GBP) || 0) : discountValue,
    EUR: rawFixed.EUR !== "" && rawFixed.EUR != null ? Math.max(0, Number(rawFixed.EUR) || 0) : discountValue,
    USD: rawFixed.USD !== "" && rawFixed.USD != null ? Math.max(0, Number(rawFixed.USD) || 0) : discountValue,
  };

  const commissionPct = Math.max(
    0,
    Math.min(50, Number(input.commission_percent ?? existing?.commission_percent ?? 0) || 0)
  );
  const cookieDays = Math.max(
    1,
    Math.min(365, parseInt(input.cookie_days ?? existing?.cookie_days ?? 30, 10) || 30)
  );
  const maxUsesRaw = input.max_uses;
  const maxUses =
    maxUsesRaw === "" || maxUsesRaw === null || maxUsesRaw === undefined
      ? null
      : Math.max(1, parseInt(maxUsesRaw, 10) || 1);

  const nowIso = new Date().toISOString();

  return {
    id: existing?.id || input.id || `cpn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    code,
    active: input.active !== undefined ? Boolean(input.active) : existing?.active ?? true,
    description: String(input.description ?? existing?.description ?? "").trim(),
    discount_type: discountType,
    discount_value: discountValue,
    fixed_amounts: fixedAmounts,
    allow_stack_with_promotions:
      input.allow_stack_with_promotions !== undefined
        ? Boolean(input.allow_stack_with_promotions)
        : existing?.allow_stack_with_promotions ?? false,
    allow_stack_with_delivery_discount:
      input.allow_stack_with_delivery_discount !== undefined
        ? Boolean(input.allow_stack_with_delivery_discount)
        : existing?.allow_stack_with_delivery_discount ?? false,
    target_markets: Array.isArray(input.target_markets)
      ? input.target_markets.map((m) => String(m).toLowerCase().trim()).filter(Boolean)
      : existing?.target_markets || [],
    target_categories: Array.isArray(input.target_categories)
      ? input.target_categories.map((c) => String(c).toLowerCase().trim()).filter(Boolean)
      : existing?.target_categories || [],
    excluded_categories: Array.isArray(input.excluded_categories)
      ? input.excluded_categories.map((c) => String(c).toLowerCase().trim()).filter(Boolean)
      : existing?.excluded_categories || [],
    min_order_amount: Math.max(0, Number(input.min_order_amount ?? existing?.min_order_amount ?? 0) || 0),
    max_uses: maxUses,
    one_per_customer:
      input.one_per_customer !== undefined
        ? Boolean(input.one_per_customer)
        : existing?.one_per_customer ?? false,
    start_date: input.start_date ? String(input.start_date) : null,
    end_date: input.end_date ? String(input.end_date) : null,
    is_influencer:
      input.is_influencer !== undefined
        ? Boolean(input.is_influencer)
        : existing?.is_influencer ?? true,
    influencer_name: String(input.influencer_name ?? existing?.influencer_name ?? "").trim(),
    influencer_handle: String(input.influencer_handle ?? existing?.influencer_handle ?? "").trim(),
    influencer_email: String(input.influencer_email ?? existing?.influencer_email ?? "")
      .trim()
      .toLowerCase(),
    influencer_avatar: String(input.influencer_avatar ?? existing?.influencer_avatar ?? "").trim(),
    influencer_message: String(input.influencer_message ?? existing?.influencer_message ?? "").trim(),
    commission_percent: commissionPct,
    auto_apply_on_ref:
      input.auto_apply_on_ref !== undefined
        ? Boolean(input.auto_apply_on_ref)
        : existing?.auto_apply_on_ref ?? true,
    cookie_days: cookieDays,
    created_at: existing?.created_at || nowIso,
    updated_at: nowIso,
  };
}

export async function getAllCoupons() {
  const cfg = await readSettingsRow(COUPONS_SETTINGS_KEY);
  return Array.isArray(cfg?.coupons) ? cfg.coupons : [];
}

export async function saveAllCoupons(coupons) {
  await writeSettingsRow(COUPONS_SETTINGS_KEY, { coupons });
  return coupons;
}

export async function findCouponByCode(rawCode) {
  const code = normalizeCouponCode(rawCode);
  if (!code) return null;
  const coupons = await getAllCoupons();
  return coupons.find((c) => normalizeCouponCode(c.code) === code) || null;
}

export async function getAffiliateClicksMap() {
  const cfg = await readSettingsRow(AFFILIATE_CLICKS_KEY);
  return cfg?.clicks && typeof cfg.clicks === "object" ? cfg.clicks : {};
}

export async function recordAffiliateClick(rawCode, { locale = "en", landingPath = "" } = {}) {
  const code = normalizeCouponCode(rawCode);
  if (!code) return null;
  const clicksMap = await getAffiliateClicksMap();
  const prev = clicksMap[code] || { total: 0, byLocale: {}, lastClickAt: null };
  const loc = String(locale || "en").toLowerCase();
  const next = {
    total: (Number(prev.total) || 0) + 1,
    byLocale: {
      ...(prev.byLocale || {}),
      [loc]: (Number(prev.byLocale?.[loc]) || 0) + 1,
    },
    lastClickAt: new Date().toISOString(),
    lastLandingPath: String(landingPath || "").slice(0, 180),
  };
  clicksMap[code] = next;
  await writeSettingsRow(AFFILIATE_CLICKS_KEY, { clicks: clicksMap });
  return next;
}

export async function getAffiliatePayoutsMap() {
  const cfg = await readSettingsRow(AFFILIATE_PAYOUTS_KEY);
  return cfg?.payouts && typeof cfg.payouts === "object" ? cfg.payouts : {};
}

export async function addAffiliatePayoutRecord(rawCode, { amount, currency = "GBP", note = "" } = {}) {
  const code = normalizeCouponCode(rawCode);
  if (!code) throw new Error("Coupon code required");
  const payoutsMap = await getAffiliatePayoutsMap();
  const list = Array.isArray(payoutsMap[code]) ? payoutsMap[code] : [];
  list.unshift({
    id: `pay_${Date.now()}`,
    amount: Math.round((Number(amount) || 0) * 100) / 100,
    currency: String(currency || "GBP").toUpperCase(),
    note: String(note || "").trim(),
    paid_at: new Date().toISOString(),
  });
  payoutsMap[code] = list;
  await writeSettingsRow(AFFILIATE_PAYOUTS_KEY, { payouts: payoutsMap });
  return list;
}

export function formatCouponDiscountLabel(coupon, currency = "GBP") {
  if (!coupon) return "";
  const curr = String(currency || "GBP").toUpperCase();
  const sym = curr === "EUR" ? "€" : curr === "USD" ? "$" : "£";
  if (coupon.discount_type === "fixed") {
    const val = Number(coupon.fixed_amounts?.[curr] ?? coupon.discount_value ?? 0);
    return val > 0 ? `${sym}${val}` : "";
  }
  const pct = Number(coupon.discount_value || 0);
  return pct > 0 ? `${pct}%` : "";
}

/**
 * Build safe public coupon summary (NEVER exposes admin-only fields like influencer_email or commission_percent)
 */
export function toPublicCouponInfo(coupon, currency = "GBP") {
  if (!coupon) return null;
  const curr = String(currency || "GBP").toUpperCase();
  const discountLabel = formatCouponDiscountLabel(coupon, curr);
  return {
    code: coupon.code,
    discount_type: coupon.discount_type,
    discount_value:
      coupon.discount_type === "fixed"
        ? Number(coupon.fixed_amounts?.[curr] ?? coupon.discount_value ?? 0)
        : Number(coupon.discount_value || 0),
    discountLabel,
    allow_stack_with_promotions: Boolean(coupon.allow_stack_with_promotions),
    allow_stack_with_delivery_discount: Boolean(coupon.allow_stack_with_delivery_discount),
    target_markets: coupon.target_markets || [],
    target_categories: coupon.target_categories || [],
    excluded_categories: coupon.excluded_categories || [],
    min_order_amount: Number(coupon.min_order_amount || 0),
    is_influencer: Boolean(coupon.is_influencer),
    influencer_name: coupon.influencer_name || "",
    influencer_handle: coupon.influencer_handle || "",
    influencer_avatar: coupon.influencer_avatar || "",
    influencer_message: coupon.influencer_message || "",
    auto_apply_on_ref: Boolean(coupon.auto_apply_on_ref),
    cookie_days: Number(coupon.cookie_days || 30),
  };
}

function normalizeItemCategory(item) {
  const raw = String(
    item?.parent_category || item?.category || item?.options?.category || ""
  )
    .toLowerCase()
    .trim();
  if (raw.includes("bed") || raw.includes("morphy")) return "beds";
  if (raw.includes("table")) return "tables";
  if (raw.includes("sofa")) return "sofas";
  if (raw.includes("mattress")) return "mattresses";
  if (raw.includes("cabinet")) return "cabinets";
  if (raw.includes("extra") || raw.includes("accessor")) return "extras";
  return raw;
}

/**
 * Authoritative server-side coupon evaluation against all per-coupon rules.
 * `items` should be server-validated items with `{ price, quantity, itemTotal, parent_category, hasActiveSale }`.
 */
export async function evaluateCouponServer({
  rawCode,
  items = [],
  subtotal = 0,
  currency = "GBP",
  locale = "en",
  customerEmail = "",
} = {}) {
  const code = normalizeCouponCode(rawCode);
  if (!code) {
    return { valid: false, coupon: null, discountAmount: 0, error: null };
  }

  const coupon = await findCouponByCode(code);
  if (!coupon) {
    return {
      valid: false,
      coupon: null,
      discountAmount: 0,
      error: "Invalid or expired discount code.",
    };
  }

  if (!coupon.active) {
    return {
      valid: false,
      coupon: null,
      discountAmount: 0,
      error: "This discount code is currently inactive.",
    };
  }

  const nowTs = Date.now();
  if (coupon.start_date) {
    const startTs = new Date(coupon.start_date).getTime();
    if (!Number.isNaN(startTs) && nowTs < startTs) {
      return {
        valid: false,
        coupon: null,
        discountAmount: 0,
        error: "This discount code is not active yet.",
      };
    }
  }
  if (coupon.end_date) {
    const endTs = new Date(coupon.end_date).getTime();
    if (!Number.isNaN(endTs) && nowTs > endTs) {
      return {
        valid: false,
        coupon: null,
        discountAmount: 0,
        error: "This discount code has expired.",
      };
    }
  }

  // Market restriction check
  const normLocale = String(locale || "en").toLowerCase();
  if (Array.isArray(coupon.target_markets) && coupon.target_markets.length > 0) {
    if (!coupon.target_markets.includes(normLocale)) {
      return {
        valid: false,
        coupon: null,
        discountAmount: 0,
        error: "This discount code is not valid in your selected country/storefront.",
      };
    }
  }

  // Usage limit checks via Supabase orders table
  if (supabaseAdmin && (coupon.max_uses || (coupon.one_per_customer && customerEmail))) {
    try {
      const { data: usedOrders } = await supabaseAdmin
        .from("orders")
        .select("id, customer_email, status, promo_code")
        .eq("promo_code", coupon.code);

      const validUsed = (usedOrders || []).filter(
        (o) => !["cancelled", "refunded"].includes(String(o.status || "").toLowerCase())
      );

      if (coupon.max_uses && validUsed.length >= Number(coupon.max_uses)) {
        return {
          valid: false,
          coupon: null,
          discountAmount: 0,
          error: "This discount code has reached its maximum usage limit.",
        };
      }

      const normEmail = String(customerEmail || "").trim().toLowerCase();
      if (coupon.one_per_customer && normEmail) {
        const alreadyUsed = validUsed.some(
          (o) => String(o.customer_email || "").trim().toLowerCase() === normEmail
        );
        if (alreadyUsed) {
          return {
            valid: false,
            coupon: null,
            discountAmount: 0,
            error: "You have already used this discount code.",
          };
        }
      }
    } catch (err) {
      console.warn("[evaluateCouponServer] Usage count check notice:", err?.message);
    }
  }

  // Minimum order amount check (only when cart has items)
  const curr = String(currency || "GBP").toUpperCase();
  const sym = curr === "EUR" ? "€" : curr === "USD" ? "$" : "£";
  const minAmt = Number(coupon.min_order_amount || 0);
  if (items.length > 0 && minAmt > 0 && subtotal < minAmt) {
    return {
      valid: false,
      coupon,
      discountAmount: 0,
      error: `Minimum order of ${sym}${minAmt} required for code ${coupon.code}.`,
    };
  }

  // Compute eligible subtotal (respecting category filters & sale-campaign stacking flag)
  let eligibleSubtotal = 0;
  let skippedForSaleCount = 0;
  let skippedForCategoryCount = 0;

  if (items.length === 0) {
    // Allow applying coupon before adding items (e.g. landing via ?ref=ANNA10)
    return {
      valid: true,
      coupon,
      discountAmount: 0,
      eligibleSubtotal: 0,
      publicInfo: toPublicCouponInfo(coupon, curr),
      error: null,
    };
  }

  const hasTargetCats = Array.isArray(coupon.target_categories) && coupon.target_categories.length > 0;
  const hasExcludedCats = Array.isArray(coupon.excluded_categories) && coupon.excluded_categories.length > 0;

  for (const it of items) {
    const lineTotal =
      it.itemTotal !== undefined
        ? Number(it.itemTotal) || 0
        : (Number(it.price) || 0) * (Number(it.quantity) || 1);
    const cat = normalizeItemCategory(it);

    if (hasTargetCats && cat && !coupon.target_categories.includes(cat)) {
      skippedForCategoryCount++;
      continue;
    }
    if (hasExcludedCats && cat && coupon.excluded_categories.includes(cat)) {
      skippedForCategoryCount++;
      continue;
    }
    if (!coupon.allow_stack_with_promotions && Boolean(it.hasActiveSale)) {
      skippedForSaleCount++;
      continue;
    }

    eligibleSubtotal += lineTotal;
  }

  eligibleSubtotal = Math.round(eligibleSubtotal * 100) / 100;

  if (eligibleSubtotal <= 0) {
    const reason =
      skippedForSaleCount > 0 && skippedForCategoryCount === 0
        ? `Code ${coupon.code} cannot be combined with items already on sale.`
        : `Code ${coupon.code} does not apply to the items currently in your cart.`;
    return {
      valid: false,
      coupon,
      discountAmount: 0,
      eligibleSubtotal: 0,
      publicInfo: toPublicCouponInfo(coupon, curr),
      error: reason,
    };
  }

  let discountAmount = 0;
  if (coupon.discount_type === "fixed") {
    const fixedVal = Number(coupon.fixed_amounts?.[curr] ?? coupon.discount_value ?? 0);
    discountAmount = Math.min(eligibleSubtotal, Math.max(0, fixedVal));
  } else {
    const pct = Number(coupon.discount_value || 0);
    discountAmount = Math.round(eligibleSubtotal * (pct / 100) * 100) / 100;
  }

  discountAmount = Math.min(subtotal, Math.max(0, Math.round(discountAmount * 100) / 100));

  return {
    valid: true,
    coupon,
    discountAmount,
    eligibleSubtotal,
    publicInfo: toPublicCouponInfo(coupon, curr),
    error: null,
  };
}

/**
 * Aggregate analytics & commission stats across orders + clicks + payouts for given coupons.
 */
export async function computeCouponsAnalytics(coupons = []) {
  const [clicksMap, payoutsMap] = await Promise.all([
    getAffiliateClicksMap(),
    getAffiliatePayoutsMap(),
  ]);

  let orders = [];
  if (supabaseAdmin) {
    try {
      const { data } = await supabaseAdmin
        .from("orders")
        .select(
          "id, status, payment_status, currency, subtotal, discount_amount, shipping_amount, total_amount, promo_code, shipping_address, admin_notes, created_at"
        )
        .order("created_at", { ascending: false })
        .limit(2000);
      if (Array.isArray(data)) orders = data;
    } catch (err) {
      console.warn("[computeCouponsAnalytics] Orders query notice:", err?.message);
    }
  }

  const nowMs = Date.now();
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  const statsByCode = {};

  for (const c of coupons) {
    const code = normalizeCouponCode(c.code);
    const clickRec = clicksMap[code] || { total: 0, byLocale: {}, lastClickAt: null };
    const payouts = Array.isArray(payoutsMap[code]) ? payoutsMap[code] : [];

    const matchedOrders = orders.filter((o) => {
      const pCode = normalizeCouponCode(o.promo_code);
      const aCode = normalizeCouponCode(o.shipping_address?.affiliate_code);
      return pCode === code || aCode === code;
    });

    let validOrderCount = 0;
    let paidOrderCount = 0;
    const revenueByCurrency = {};
    const commissionByCurrency = {};
    const payableCommissionByCurrency = {};
    const pendingCommissionByCurrency = {};
    const paidOutByCurrency = {};

    for (const p of payouts) {
      const curr = String(p.currency || "GBP").toUpperCase();
      paidOutByCurrency[curr] = Math.round(((paidOutByCurrency[curr] || 0) + (Number(p.amount) || 0)) * 100) / 100;
    }

    const commissionPct = Number(c.commission_percent || 0);
    const attributedOrders = [];

    for (const o of matchedOrders) {
      const st = String(o.status || "").toLowerCase();
      const pst = String(o.payment_status || "").toLowerCase();
      const isCancelled = st === "cancelled" || st === "refunded";
      const isPaid = pst === "paid" || ["paid", "shipped", "completed", "processing"].includes(st);
      const curr = String(o.currency || "GBP").toUpperCase();
      // Net product revenue (after discount, excluding shipping)
      const netProductValue = Math.max(
        0,
        Math.round(
          ((Number(o.subtotal) || Number(o.total_amount) || 0) - (Number(o.discount_amount) || 0)) * 100
        ) / 100
      );
      const commission = isCancelled
        ? 0
        : Math.round(netProductValue * (commissionPct / 100) * 100) / 100;

      const orderAgeMs = nowMs - new Date(o.created_at || 0).getTime();
      const isPastReturnWindow = orderAgeMs >= THIRTY_DAYS_MS;

      if (!isCancelled) {
        validOrderCount++;
        revenueByCurrency[curr] = Math.round(((revenueByCurrency[curr] || 0) + netProductValue) * 100) / 100;
        if (isPaid) {
          paidOrderCount++;
          commissionByCurrency[curr] = Math.round(((commissionByCurrency[curr] || 0) + commission) * 100) / 100;
          if (isPastReturnWindow) {
            payableCommissionByCurrency[curr] =
              Math.round(((payableCommissionByCurrency[curr] || 0) + commission) * 100) / 100;
          } else {
            pendingCommissionByCurrency[curr] =
              Math.round(((pendingCommissionByCurrency[curr] || 0) + commission) * 100) / 100;
          }
        }
      }

      attributedOrders.push({
        id: o.id,
        created_at: o.created_at,
        status: o.status,
        payment_status: o.payment_status,
        currency: curr,
        net_value: netProductValue,
        discount_amount: Number(o.discount_amount || 0),
        commission,
        eligibility: isCancelled
          ? "cancelled"
          : !isPaid
            ? "unpaid"
            : isPastReturnWindow
              ? "payable"
              : "return_window",
      });
    }

    const totalClicks = Number(clickRec.total || 0);
    const conversionRate =
      totalClicks > 0 ? Math.round((validOrderCount / totalClicks) * 1000) / 10 : 0;

    statsByCode[code] = {
      clicks: totalClicks,
      clicksByLocale: clickRec.byLocale || {},
      lastClickAt: clickRec.lastClickAt || null,
      ordersCount: validOrderCount,
      paidOrdersCount: paidOrderCount,
      conversionRate,
      revenueByCurrency,
      commissionByCurrency,
      payableCommissionByCurrency,
      pendingCommissionByCurrency,
      paidOutByCurrency,
      payouts,
      recentOrders: attributedOrders.slice(0, 50),
    };
  }

  return statsByCode;
}
