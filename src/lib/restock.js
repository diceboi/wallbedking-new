import { supabaseAdmin } from "@/lib/supabase";
import { sendRestockNotificationEmail } from "@/lib/email";
import fs from "fs";
import path from "path";

const FALLBACK_DIR = path.join(process.cwd(), "src", "data");
const FALLBACK_FILE = path.join(FALLBACK_DIR, "waitlist_store.json");

export function getFallbackWaitlist() {
  try {
    if (fs.existsSync(FALLBACK_FILE)) {
      const content = fs.readFileSync(FALLBACK_FILE, "utf-8");
      return JSON.parse(content) || [];
    }
  } catch {
    // ignore
  }
  return [];
}

export function saveFallbackWaitlist(items) {
  try {
    if (!fs.existsSync(FALLBACK_DIR)) {
      fs.mkdirSync(FALLBACK_DIR, { recursive: true });
    }
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(items, null, 2), "utf-8");
  } catch {
    // ignore
  }
}

function loadLocalCatalogProducts() {
  const files = ["products-catalog.json", "tables-catalog.json", "specialty-catalog.json"];
  const all = [];
  for (const fname of files) {
    try {
      const p = path.join(FALLBACK_DIR, fname);
      if (fs.existsSync(p)) {
        const parsed = JSON.parse(fs.readFileSync(p, "utf-8"));
        if (Array.isArray(parsed)) all.push(...parsed);
      }
    } catch {
      // ignore
    }
  }
  return all;
}

async function resolveProduct({ productId, productSlug }) {
  let product = null;

  if (supabaseAdmin && (productId || productSlug)) {
    try {
      let pQuery = supabaseAdmin
        .from("products")
        .select("id, name, slug, price_gbp, image, stock, parent_category");

      if (productId && !Number.isNaN(parseInt(productId, 10))) {
        pQuery = pQuery.eq("id", parseInt(productId, 10));
      } else if (productSlug) {
        pQuery = pQuery.eq("slug", productSlug);
      }

      const { data: pData } = await pQuery.maybeSingle();
      if (pData) product = pData;
    } catch (pErr) {
      console.warn("[Restock Notify] Supabase product fetch notice:", pErr.message);
    }
  }

  if (!product && (productId || productSlug)) {
    const localCatalog = loadLocalCatalogProducts();
    if (productId) {
      product = localCatalog.find((p) => String(p.id) === String(productId)) || null;
    }
    if (!product && productSlug) {
      product = localCatalog.find((p) => p.slug === productSlug) || null;
    }
  }

  return product;
}

/**
 * Core engine to trigger restock / launch notifications
 * Supports notifying:
 * - all waiting subscribers of a product (productId / productSlug)
 * - OR specific waitlist entry IDs (waitlistIds, optionally includeNotified for resends)
 */
export async function triggerRestockNotification({
  productId = null,
  productSlug = null,
  waitlistIds = null,
  includeNotified = false,
}) {
  const hasIds = Array.isArray(waitlistIds) && waitlistIds.length > 0;
  if (!hasIds && !productId && !productSlug) {
    return {
      success: false,
      error: "Missing productId, productSlug, or waitlistIds",
      notifiedCount: 0,
    };
  }

  const product = await resolveProduct({ productId, productSlug });
  const resolvedId =
    product?.id ||
    (productId && !Number.isNaN(parseInt(productId, 10)) ? parseInt(productId, 10) : null);
  const resolvedSlug = product?.slug || productSlug || "";

  let dbSubscribers = [];

  // 1. Fetch matching subscribers from Supabase
  if (supabaseAdmin) {
    try {
      let wQuery = supabaseAdmin.from("product_waitlist").select("*");

      if (!includeNotified) {
        wQuery = wQuery.eq("status", "waiting");
      }

      if (hasIds) {
        const cleanIds = waitlistIds.filter((id) => !String(id).startsWith("wl_"));
        if (cleanIds.length > 0) {
          wQuery = wQuery.in("id", cleanIds);
          const { data: wData } = await wQuery;
          if (Array.isArray(wData)) dbSubscribers = wData;
        }
      } else {
        if (resolvedId && resolvedSlug) {
          wQuery = wQuery.or(`product_id.eq.${resolvedId},product_slug.eq.${resolvedSlug}`);
        } else if (resolvedId) {
          wQuery = wQuery.eq("product_id", resolvedId);
        } else if (resolvedSlug) {
          wQuery = wQuery.eq("product_slug", resolvedSlug);
        }
        const { data: wData } = await wQuery;
        if (Array.isArray(wData)) dbSubscribers = wData;
      }
    } catch (wErr) {
      console.warn("[Restock Notify] Supabase waitlist fetch notice:", wErr.message);
    }
  }

  // 2. Fetch matching subscribers from local waitlist store
  const local = getFallbackWaitlist();
  const idSet = hasIds ? new Set(waitlistIds.map(String)) : null;
  const localMatches = local.filter((it) => {
    if (!includeNotified && it.status !== "waiting") return false;
    if (idSet) {
      return idSet.has(String(it.id));
    }
    const matchId = resolvedId && it.product_id && Number(it.product_id) === Number(resolvedId);
    const matchSlug = resolvedSlug && it.product_slug === resolvedSlug;
    const matchRawSlug = productSlug && it.product_slug === productSlug;
    return Boolean(matchId || matchSlug || matchRawSlug);
  });

  // 3. Merge and deduplicate per (email + productSlug/productId)
  const subscriberMap = new Map();
  for (const sub of [...dbSubscribers, ...localMatches]) {
    const emailKey = sub.customer_email?.trim().toLowerCase();
    const prodKey = sub.product_slug || String(sub.product_id || "");
    const dedupKey = hasIds ? String(sub.id) : `${emailKey}::${prodKey}`;
    if (emailKey && !subscriberMap.has(dedupKey)) {
      subscriberMap.set(dedupKey, sub);
    }
  }

  const subscribers = Array.from(subscriberMap.values());

  if (subscribers.length === 0) {
    return {
      success: true,
      message: "No matching waitlist subscribers found.",
      notifiedCount: 0,
      totalSubscribers: 0,
    };
  }

  console.log(`[Restock Engine] Sending alerts to ${subscribers.length} subscriber(s)...`);

  let sentCount = 0;
  let deliveryMode = "live";
  const notifiedDbIds = [];
  const notifiedLocalKeys = new Set();
  const notifiedLocalIds = new Set();
  const errors = [];

  // 4. Send localized email to each subscriber
  for (const sub of subscribers) {
    try {
      const subProduct =
        product ||
        (await resolveProduct({
          productId: sub.product_id,
          productSlug: sub.product_slug,
        }));

      const res = await sendRestockNotificationEmail(sub, subProduct);
      if (res.success) {
        sentCount++;
        if (res.mode === "mock") deliveryMode = "mock";
        if (sub.id && !String(sub.id).startsWith("wl_")) {
          notifiedDbIds.push(sub.id);
        }
        if (sub.id) notifiedLocalIds.add(String(sub.id));
        const emailLower = sub.customer_email.trim().toLowerCase();
        notifiedLocalKeys.add(`${emailLower}::${sub.product_slug || ""}`);
      } else if (res.error) {
        errors.push(`${sub.customer_email}: ${res.error}`);
      }
    } catch (mailErr) {
      console.error(`[Restock Engine] Failed sending email to ${sub.customer_email}:`, mailErr);
      errors.push(`${sub.customer_email}: ${mailErr.message}`);
    }
  }

  const nowIso = new Date().toISOString();

  // 5. Update ONLY the specific notified rows in Supabase (never other products for the same email!)
  if (notifiedDbIds.length > 0 && supabaseAdmin) {
    try {
      await supabaseAdmin
        .from("product_waitlist")
        .update({
          status: "notified",
          notified_at: nowIso,
          updated_at: nowIso,
        })
        .in("id", notifiedDbIds);
    } catch (upErr) {
      console.warn("[Restock Notify] DB update notice:", upErr.message);
    }
  }

  // 6. Update ONLY the specific notified rows in local fallback store
  if (notifiedLocalIds.size > 0 || notifiedLocalKeys.size > 0) {
    const updatedLocal = local.map((it) => {
      const itEmail = it.customer_email?.trim().toLowerCase();
      const itKey = `${itEmail}::${it.product_slug || ""}`;
      if (notifiedLocalIds.has(String(it.id)) || notifiedLocalKeys.has(itKey)) {
        return {
          ...it,
          status: "notified",
          notified_at: nowIso,
          updated_at: nowIso,
        };
      }
      return it;
    });
    saveFallbackWaitlist(updatedLocal);
  }

  return {
    success: sentCount > 0 || errors.length === 0,
    mode: deliveryMode,
    message:
      deliveryMode === "mock"
        ? `Simulated notification for ${sentCount} subscriber(s) (RESEND_API_KEY not set).`
        : `Notification sent to ${sentCount} of ${subscribers.length} subscriber(s).`,
    notifiedCount: sentCount,
    totalSubscribers: subscribers.length,
    errors: errors.length > 0 ? errors : undefined,
  };
}
