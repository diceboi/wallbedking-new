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

/**
 * Core engine to trigger restock notifications for a product
 */
export async function triggerRestockNotification({ productId, productSlug, customMessage }) {
  if (!productId && !productSlug) {
    return { success: false, error: "Missing productId or productSlug", notifiedCount: 0 };
  }

  let product = null;

  // 1. Try resolving product from local products-catalog.json first (fast & reliable)
  try {
    const catalogPath = path.join(process.cwd(), "src", "data", "products-catalog.json");
    if (fs.existsSync(catalogPath)) {
      const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf-8"));
      if (productId) {
        product = catalog.find((p) => String(p.id) === String(productId));
      }
      if (!product && productSlug) {
        product = catalog.find((p) => p.slug === productSlug);
      }
    }
  } catch (err) {
    console.warn("[Restock Notify] Catalog lookup notice:", err.message);
  }

  // 2. If not found in catalog, fetch from Supabase
  if (!product && supabaseAdmin) {
    try {
      let pQuery = supabaseAdmin
        .from("products")
        .select("id, name, slug, price_gbp, image, stock, parent_category");

      if (productId) {
        pQuery = pQuery.eq("id", parseInt(productId, 10));
      } else {
        pQuery = pQuery.eq("slug", productSlug);
      }

      const { data: pData } = await pQuery.maybeSingle();
      if (pData) product = pData;
    } catch (pErr) {
      console.warn("[Restock Notify] Supabase product fetch notice:", pErr.message);
    }
  }

  const resolvedId = product?.id || (productId ? parseInt(productId, 10) : null);
  const resolvedSlug = product?.slug || productSlug || "";

  let dbSubscribers = [];

  // 3. Fetch waiting subscribers from Supabase
  if (supabaseAdmin) {
    try {
      let wQuery = supabaseAdmin
        .from("product_waitlist")
        .select("*")
        .eq("status", "waiting");

      if (resolvedId && resolvedSlug) {
        wQuery = wQuery.or(`product_id.eq.${resolvedId},product_slug.eq.${resolvedSlug}`);
      } else if (resolvedId) {
        wQuery = wQuery.eq("product_id", resolvedId);
      } else if (resolvedSlug) {
        wQuery = wQuery.eq("product_slug", resolvedSlug);
      }

      const { data: wData } = await wQuery;
      if (Array.isArray(wData)) dbSubscribers = wData;
    } catch (wErr) {
      console.warn("[Restock Notify] Supabase waitlist fetch notice:", wErr.message);
    }
  }

  // 4. Fetch waiting subscribers from local waitlist store
  const local = getFallbackWaitlist();
  const localMatches = local.filter((it) => {
    if (it.status !== "waiting") return false;
    const matchId = resolvedId && it.product_id && Number(it.product_id) === Number(resolvedId);
    const matchSlug = resolvedSlug && it.product_slug === resolvedSlug;
    const matchRawSlug = productSlug && it.product_slug === productSlug;
    return Boolean(matchId || matchSlug || matchRawSlug);
  });

  // 5. Merge and deduplicate subscribers by email
  const subscriberMap = new Map();
  for (const sub of [...dbSubscribers, ...localMatches]) {
    const emailKey = sub.customer_email?.trim().toLowerCase();
    if (emailKey && !subscriberMap.has(emailKey)) {
      subscriberMap.set(emailKey, sub);
    }
  }

  const subscribers = Array.from(subscriberMap.values());

  if (subscribers.length === 0) {
    console.log(`[Restock Engine] No active waiting subscribers found for #${resolvedId} (${resolvedSlug}).`);
    return {
      success: true,
      message: "No active waitlist subscribers found for this product.",
      notifiedCount: 0,
      totalSubscribers: 0,
    };
  }

  console.log(`[Restock Engine] Sending restock alerts to ${subscribers.length} subscriber(s)...`);

  let sentCount = 0;
  const notifiedEmails = [];
  const notifiedDbIds = [];

  // 6. Send localized email to each waiting subscriber
  for (const sub of subscribers) {
    try {
      const res = await sendRestockNotificationEmail(sub, product);
      if (res.success) {
        sentCount++;
        const emailLower = sub.customer_email.trim().toLowerCase();
        notifiedEmails.push(emailLower);
        if (sub.id) notifiedDbIds.push(sub.id);
      }
    } catch (mailErr) {
      console.error(`[Restock Engine] Failed sending email to ${sub.customer_email}:`, mailErr);
    }
  }

  const nowIso = new Date().toISOString();

  // 7. Update status to 'notified' in Supabase
  if (notifiedEmails.length > 0 && supabaseAdmin) {
    try {
      await supabaseAdmin
        .from("product_waitlist")
        .update({
          status: "notified",
          notified_at: nowIso,
          updated_at: nowIso,
        })
        .in("customer_email", notifiedEmails);
    } catch (upErr) {
      console.warn("[Restock Notify] DB update notice:", upErr.message);
    }
  }

  // 8. Update status in local fallback store
  if (notifiedEmails.length > 0) {
    const updatedLocal = local.map((it) => {
      const itEmail = it.customer_email?.trim().toLowerCase();
      if (notifiedEmails.includes(itEmail)) {
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
    success: true,
    message: `Restock notification sent to ${sentCount} subscriber(s).`,
    notifiedCount: sentCount,
    totalSubscribers: subscribers.length,
  };
}
