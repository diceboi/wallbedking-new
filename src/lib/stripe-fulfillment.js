import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { getPaymentConfig } from "@/lib/payments";
import { sendMetaCapiPurchase } from "@/lib/meta-capi";
import { generateOrderNumber } from "@/lib/orders";
import catalogProducts from "@/data/products-catalog.json";

/**
 * Ensures `{CHECKOUT_SESSION_ID}` in Stripe `success_url` is NEVER percent-encoded
 * (`%7BCHECKOUT_SESSION_ID%7D`), because Stripe only substitutes the literal braces.
 */
export function buildStripeSuccessUrl(baseUrl, { orderId, cartId } = {}) {
  const u = new URL(baseUrl);
  if (orderId) {
    u.searchParams.set("order_id", orderId);
  }
  u.searchParams.set("session_id", "__STRIPE_CHECKOUT_SESSION_PLACEHOLDER__");
  if (cartId) {
    u.searchParams.set("cart_id", cartId);
  }
  return u
    .toString()
    .replace(/%7BCHECKOUT_SESSION_ID%7D/gi, "{CHECKOUT_SESSION_ID}")
    .replace("__STRIPE_CHECKOUT_SESSION_PLACEHOLDER__", "{CHECKOUT_SESSION_ID}");
}

/**
 * Returns configured Stripe SDK instances across UK and International accounts,
 * ordered by preferred locale/entity first so cross-account lookups always succeed.
 */
export function getConfiguredStripeClients(preferredLocale = "en") {
  const norm = String(preferredLocale || "en").toLowerCase();
  const preferUk = norm === "en" || norm === "en_uk" || norm === "gb";

  const ukKey = (process.env.STRIPE_SECRET_KEY_UK || "").trim();
  const euKey = (
    process.env.STRIPE_SECRET_KEY_EU ||
    process.env.STRIPE_SECRET_KEY_INTL ||
    ""
  ).trim();
  const fallbackKey = (process.env.STRIPE_SECRET_KEY || "").trim();

  const entries = [];
  const seenKeys = new Set();

  const addClient = (entity, key) => {
    if (!key || seenKeys.has(key)) return;
    seenKeys.add(key);
    entries.push({
      entity,
      secretKey: key,
      stripe: new Stripe(key),
    });
  };

  if (preferUk) {
    addClient("UK", ukKey);
    addClient("INTERNATIONAL", euKey);
    addClient("DEFAULT", fallbackKey);
  } else {
    addClient("INTERNATIONAL", euKey);
    addClient("UK", ukKey);
    addClient("DEFAULT", fallbackKey);
  }

  return entries;
}

/**
 * Normalizes a raw Stripe Checkout Session object into a consistent internal structure.
 */
export function normalizeStripeSession(s, matchedEntity = null) {
  if (!s || !s.id) return null;

  const paymentIntentId =
    typeof s.payment_intent === "string"
      ? s.payment_intent
      : s.payment_intent?.id || null;

  const addr = s.customer_details?.address || s.shipping_details?.address || null;

  return {
    session_id: s.id,
    payment_intent: paymentIntentId,
    status: s.status || null,
    payment_status: s.payment_status || "unpaid",
    amount_total: typeof s.amount_total === "number" ? s.amount_total / 100 : 0,
    currency: s.currency ? s.currency.toUpperCase() : "GBP",
    customer_email: (s.customer_details?.email || s.customer_email || "").trim().toLowerCase(),
    customer_name: s.shipping_details?.name || s.customer_details?.name || "",
    customer_phone: s.customer_details?.phone || "",
    customer_address: addr
      ? {
          line1: addr.line1 || "",
          line2: addr.line2 || "",
          city: addr.city || "",
          postal_code: addr.postal_code || "",
          country: addr.country || "",
        }
      : null,
    cart_id: s.metadata?.cart_id || s.metadata?.cartId || "",
    order_id: s.metadata?.order_id || "",
    client_reference_id: s.client_reference_id || "",
    company_entity: s.metadata?.company_entity || matchedEntity || null,
    locale: s.metadata?.locale || null,
  };
}

/**
 * Retrieves and verifies a Stripe Checkout Session directly from Stripe's API
 * (checking both UK and International Stripe accounts, plus OnRender fallback if needed).
 * Also recovers automatically by `orderId` if `sessionId` was literal `{CHECKOUT_SESSION_ID}`.
 */
export async function retrieveStripeCheckoutSession({
  sessionId = "",
  orderId = "",
  preferredLocale = "en",
} = {}) {
  const cleanSessionId =
    sessionId &&
    typeof sessionId === "string" &&
    !sessionId.includes("CHECKOUT_SESSION_ID") &&
    sessionId.startsWith("cs_")
      ? sessionId.trim()
      : "";

  const cleanOrderId =
    orderId && typeof orderId === "string" && orderId.trim().startsWith("WBK-")
      ? orderId.trim()
      : "";

  const clients = getConfiguredStripeClients(preferredLocale);

  // 1. Direct retrieval by session ID (`cs_...`) across configured Stripe accounts
  if (cleanSessionId && clients.length > 0) {
    for (const { entity, stripe } of clients) {
      try {
        const s = await stripe.checkout.sessions.retrieve(cleanSessionId, {
          expand: ["line_items", "customer_details"],
        });
        if (s && s.id) {
          return normalizeStripeSession(s, entity);
        }
      } catch {
        // Session may belong to the other company's Stripe account; try next
      }
    }
  }

  // 2. Recovery by `orderId` (`WBK-...`) if session_id was missing or unexpanded
  if (cleanOrderId && clients.length > 0) {
    // Check if Supabase already stored a `cs_...` session ID on the order
    if (supabaseAdmin) {
      try {
        const { data: ord } = await supabaseAdmin
          .from("orders")
          .select("payment_id")
          .eq("id", cleanOrderId)
          .maybeSingle();

        if (ord?.payment_id && String(ord.payment_id).startsWith("cs_")) {
          for (const { entity, stripe } of clients) {
            try {
              const s = await stripe.checkout.sessions.retrieve(ord.payment_id, {
                expand: ["line_items", "customer_details"],
              });
              if (s && s.id) {
                return normalizeStripeSession(s, entity);
              }
            } catch {
              // continue
            }
          }
        }
      } catch {
        // ignore lookup notice
      }
    }

    // Search recent Stripe Checkout Sessions matching `orderId`
    for (const { entity, stripe } of clients) {
      try {
        const list = await stripe.checkout.sessions.list({ limit: 40 });
        const matches = (list?.data || []).filter(
          (s) =>
            s.client_reference_id === cleanOrderId ||
            s.metadata?.order_id === cleanOrderId
        );
        if (matches.length > 0) {
          const paidMatch =
            matches.find((s) => s.payment_status === "paid") || matches[0];
          return normalizeStripeSession(paidMatch, entity);
        }
      } catch (err) {
        console.warn(`[Stripe Lookup] Session list check notice (${entity}):`, err.message);
      }
    }
  }

  // 3. Legacy OnRender microservice fallback (only if direct Stripe keys are absent)
  if (cleanSessionId && clients.length === 0) {
    const paymentConfig = getPaymentConfig(preferredLocale);
    const endpoints = [
      paymentConfig.stripeStatusEndpoint,
      paymentConfig.entity === "UK"
        ? "https://stripe-05m9.onrender.com/session-status"
        : "https://stripe-uk.onrender.com/session-status",
    ];

    for (const ep of endpoints) {
      try {
        const res = await fetch(`${ep}?session_id=${encodeURIComponent(cleanSessionId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && !data.error) {
            return {
              session_id: cleanSessionId,
              payment_intent: data.payment_intent || cleanSessionId,
              status: "complete",
              payment_status: "paid",
              amount_total: Number(data.amount_total || 0),
              currency: (data.currency || paymentConfig.currency || "GBP").toUpperCase(),
              customer_email: (data.customer_email || "").trim().toLowerCase(),
              customer_name: data.customer_name || "",
              customer_phone: data.customer_phone || "",
              customer_address: data.customer_address || null,
              cart_id: data.cart_id || "",
              order_id: data.order_id || "",
              client_reference_id: data.client_reference_id || "",
              company_entity: paymentConfig.entity,
              locale: preferredLocale,
            };
          }
        }
      } catch {
        // try next endpoint
      }
    }
  }

  return null;
}

/**
 * Fallback item parser from legacy `cart_id` strings when an order wasn't pre-created.
 */
function parseItemsFromCartId(cartId) {
  if (!cartId || typeof cartId !== "string") return [];
  try {
    const rawItemsPart = cartId.split("||")[0];
    const items = [];

    for (const p of catalogProducts) {
      if (p.slug && rawItemsPart.includes(p.slug)) {
        const regex = new RegExp(
          `${p.slug.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")}-(\\d+)`
        );
        const match = rawItemsPart.match(regex);
        const qty = match ? parseInt(match[1], 10) : 1;

        items.push({
          id: p.id,
          rawId: p.id,
          name: p.name,
          title: p.name,
          variant: p.type ? `${p.type} ${p.orientation || ""}`.trim() : "Standard",
          quantity: qty,
          price: Number(p.price_gbp || p.price_euro || 0),
          slug: p.slug,
        });
      }
    }

    if (items.length > 0) return items;
  } catch (e) {
    console.warn("[Stripe Fulfillment] CartId parse notice:", e.message);
  }

  return [
    {
      name: "Wall Bed King Product",
      title: "Wall Bed King Product",
      variant: "Standard",
      quantity: 1,
      price: 0,
    },
  ];
}

async function decrementOrderStockOnce(items) {
  if (!supabaseAdmin || !Array.isArray(items)) return;

  for (const it of items) {
    const rawId = it.rawId ?? it.id;
    const numericId =
      typeof rawId === "number"
        ? rawId
        : typeof rawId === "string"
        ? parseInt(rawId.replace(/^wbk-/i, ""), 10)
        : NaN;
    const qty = Math.max(1, Number(it.quantity) || 1);

    if (Number.isFinite(numericId) && numericId > 0) {
      try {
        const { data: p } = await supabaseAdmin
          .from("products")
          .select("id, stock")
          .eq("id", numericId)
          .maybeSingle();

        if (p && p.stock != null) {
          const newStock = Math.max(0, Number(p.stock) - qty);
          await supabaseAdmin
            .from("products")
            .update({ stock: newStock })
            .eq("id", p.id);
        }
      } catch (stockErr) {
        console.warn("[Stripe Fulfillment] Stock decrement notice:", stockErr.message);
      }
    }
  }
}

/**
 * Atomically marks a verified paid Stripe Checkout Session as paid in Supabase,
 * decrements stock once, triggers Meta CAPI once, and sends customer + admin emails once.
 * Safe to call concurrently from both `/api/webhooks/stripe` and `/api/checkout/stripe/confirm`.
 */
export async function fulfillPaidStripeSession({
  sessionData,
  fallbackOrderId = "",
  fallbackCartId = "",
  fallbackLocale = "en",
  clientIp = "",
  userAgent = "",
  source = "stripe",
}) {
  if (!sessionData) {
    return { success: false, error: "Missing verified Stripe session data." };
  }

  const effectiveLocale = (
    sessionData.locale ||
    fallbackLocale ||
    (sessionData.currency === "GBP" ? "en" : "de")
  ).toLowerCase();

  const paymentConfig = getPaymentConfig(effectiveLocale, sessionData.currency);
  const entityLabel = sessionData.company_entity || paymentConfig.entity;
  const canonicalPaymentId = sessionData.payment_intent || sessionData.session_id;

  // Resolve genuine WBK-XXXX order reference
  const candidateIds = [
    fallbackOrderId,
    sessionData.order_id,
    sessionData.client_reference_id,
    sessionData.cart_id,
  ];
  let effectiveOrderId =
    candidateIds
      .map((v) => (typeof v === "string" ? v.trim() : ""))
      .find((v) => v.startsWith("WBK-")) || null;

  // Look up existing order in Supabase
  let existingOrder = null;
  if (supabaseAdmin) {
    try {
      if (effectiveOrderId) {
        const { data } = await supabaseAdmin
          .from("orders")
          .select("*")
          .eq("id", effectiveOrderId)
          .maybeSingle();
        if (data) existingOrder = data;
      }

      if (!existingOrder) {
        const lookupPaymentIds = [
          sessionData.payment_intent,
          sessionData.session_id,
        ].filter(Boolean);

        if (lookupPaymentIds.length > 0) {
          const { data } = await supabaseAdmin
            .from("orders")
            .select("*")
            .in("payment_id", lookupPaymentIds)
            .limit(1);
          if (data && data.length > 0) {
            existingOrder = data[0];
            effectiveOrderId = existingOrder.id;
          }
        }
      }
    } catch (lookupErr) {
      console.warn("[Stripe Fulfillment] Order lookup notice:", lookupErr.message);
    }
  }

  if (!effectiveOrderId) {
    effectiveOrderId = await generateOrderNumber();
  }

  // Strictly verify that Stripe reports `payment_status === "paid"` before confirming!
  if (sessionData.payment_status !== "paid") {
    if (supabaseAdmin && existingOrder && !existingOrder.payment_id && sessionData.session_id) {
      try {
        await supabaseAdmin
          .from("orders")
          .update({
            payment_id: sessionData.session_id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingOrder.id);
      } catch {
        // ignore
      }
    }

    return {
      success: false,
      pendingPayment: true,
      paymentStatus: sessionData.payment_status,
      order: existingOrder,
      error: `Payment is not yet completed (Stripe status: ${sessionData.payment_status}).`,
    };
  }

  // Fast path: Order was ALREADY marked paid (e.g. webhook beat `/thanks` or user refreshed `/thanks`)
  if (existingOrder && existingOrder.payment_status === "paid") {
    if (supabaseAdmin && !existingOrder.payment_id && canonicalPaymentId) {
      try {
        const { data: patched } = await supabaseAdmin
          .from("orders")
          .update({
            payment_id: canonicalPaymentId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingOrder.id)
          .select("*")
          .maybeSingle();
        if (patched) existingOrder = patched;
      } catch {
        // ignore
      }
    }

    return {
      success: true,
      alreadyPaid: true,
      emailSent: true,
      order: existingOrder,
    };
  }

  const nowIso = new Date().toISOString();
  const targetCurrency = (
    sessionData.currency ||
    existingOrder?.currency ||
    paymentConfig.currency ||
    "GBP"
  ).toUpperCase();

  // Preserve rich checkout shipping_address fields (`address1`, `postcode`, `locale`, etc.)
  const existingShipping =
    existingOrder?.shipping_address && typeof existingOrder.shipping_address === "object"
      ? { ...existingOrder.shipping_address }
      : {};

  const stripeAddr = sessionData.customer_address || {};
  const mergedShippingAddress = {
    ...existingShipping,
    line1: existingShipping.line1 || existingShipping.address1 || stripeAddr.line1 || "",
    line2: existingShipping.line2 || existingShipping.address2 || stripeAddr.line2 || "",
    city: existingShipping.city || stripeAddr.city || "",
    postal_code:
      existingShipping.postal_code || existingShipping.postcode || stripeAddr.postal_code || "",
    country: existingShipping.country || stripeAddr.country || "",
    locale: existingShipping.locale || effectiveLocale,
    company_entity: existingShipping.company_entity || entityLabel,
    notifications_sent: {
      ...(existingShipping.notifications_sent || {}),
      paid: nowIso,
      confirmation: nowIso,
    },
  };

  const resolvedCustomerName =
    existingOrder?.customer_name && existingOrder.customer_name !== "Valued Customer"
      ? existingOrder.customer_name
      : sessionData.customer_name || existingOrder?.customer_name || "Valued Customer";

  const resolvedCustomerEmail =
    (sessionData.customer_email && sessionData.customer_email !== "n/a"
      ? sessionData.customer_email
      : existingOrder?.customer_email || ""
    )
      .trim()
      .toLowerCase();

  const resolvedCustomerPhone =
    existingOrder?.customer_phone || sessionData.customer_phone || "";

  const resolvedTotalAmount = Number(
    sessionData.amount_total || existingOrder?.total_amount || 0
  );

  const effectiveCartId = fallbackCartId || sessionData.cart_id || "";
  const resolvedItems = existingOrder?.items?.length
    ? existingOrder.items
    : parseItemsFromCartId(effectiveCartId);

  // Never downgrade manufacturing/shipping statuses if an order already progressed past `pending`
  const nextStatus =
    !existingOrder?.status || existingOrder.status === "pending"
      ? "paid"
      : existingOrder.status;

  let finalOrder = null;
  let newlyPaid = false;

  if (supabaseAdmin) {
    try {
      if (existingOrder) {
        // Atomic conditional update: only ONE concurrent caller can transition `payment_status` to `paid`
        const updatePayload = {
          status: nextStatus,
          payment_status: "paid",
          payment_method: "stripe",
          payment_id: canonicalPaymentId,
          customer_name: resolvedCustomerName,
          customer_email: resolvedCustomerEmail,
          customer_phone: resolvedCustomerPhone,
          shipping_address: mergedShippingAddress,
          currency: targetCurrency,
          total_amount: resolvedTotalAmount,
          admin_notes:
            existingOrder.admin_notes ||
            `[Entity: ${entityLabel}] [Locale: ${effectiveLocale}]`,
          updated_at: nowIso,
        };

        const { data: updatedRows, error: updateErr } = await supabaseAdmin
          .from("orders")
          .update(updatePayload)
          .eq("id", existingOrder.id)
          .neq("payment_status", "paid")
          .select("*");

        if (updateErr) {
          console.error("[Stripe Fulfillment] Order update error:", updateErr.message);
        } else if (Array.isArray(updatedRows) && updatedRows.length > 0) {
          finalOrder = updatedRows[0];
          newlyPaid = true;
          console.log(
            `[Stripe Fulfillment] Order ${finalOrder.id} marked PAID via ${source} (${canonicalPaymentId})`
          );
        } else {
          // Concurrent call won the race milliseconds earlier — fetch latest paid row
          const { data: fresh } = await supabaseAdmin
            .from("orders")
            .select("*")
            .eq("id", existingOrder.id)
            .maybeSingle();
          finalOrder = fresh || { ...existingOrder, ...updatePayload };
          newlyPaid = false;
        }
      } else {
        // Order wasn't pre-created (e.g. direct cart Express Stripe checkout) — insert fresh paid row
        const insertPayload = {
          id: effectiveOrderId,
          status: "paid",
          payment_status: "paid",
          payment_method: "stripe",
          payment_id: canonicalPaymentId,
          customer_name: resolvedCustomerName,
          customer_email: resolvedCustomerEmail,
          customer_phone: resolvedCustomerPhone,
          shipping_address: mergedShippingAddress,
          billing_address: stripeAddr.line1 ? stripeAddr : mergedShippingAddress,
          items: resolvedItems,
          currency: targetCurrency,
          total_amount: resolvedTotalAmount,
          admin_notes: `[Entity: ${entityLabel}] [Locale: ${effectiveLocale}]`,
          created_at: nowIso,
          updated_at: nowIso,
        };

        const { data: insertedRows, error: insertErr } = await supabaseAdmin
          .from("orders")
          .insert([insertPayload])
          .select("*");

        if (!insertErr && Array.isArray(insertedRows) && insertedRows.length > 0) {
          finalOrder = insertedRows[0];
          newlyPaid = true;
          console.log(
            `[Stripe Fulfillment] Created & marked PAID Order ${finalOrder.id} via ${source}`
          );
        } else {
          // Handle race condition if webhook + confirm inserted simultaneously
          const { data: raceExisting } = await supabaseAdmin
            .from("orders")
            .select("*")
            .eq("id", effectiveOrderId)
            .maybeSingle();
          finalOrder = raceExisting || insertPayload;
          newlyPaid = !raceExisting;
        }
      }
    } catch (dbErr) {
      console.error("[Stripe Fulfillment] Database exception:", dbErr);
    }
  }

  if (!finalOrder) {
    finalOrder = {
      id: effectiveOrderId,
      status: "paid",
      payment_status: "paid",
      payment_method: "stripe",
      payment_id: canonicalPaymentId,
      customer_name: resolvedCustomerName,
      customer_email: resolvedCustomerEmail,
      customer_phone: resolvedCustomerPhone,
      shipping_address: mergedShippingAddress,
      items: resolvedItems,
      currency: targetCurrency,
      total_amount: resolvedTotalAmount,
      updated_at: nowIso,
    };
  }

  // Side effects run ONLY ONCE for the winning `unpaid -> paid` transition!
  let emailSent = !newlyPaid;

  if (newlyPaid) {
    // 1. Decrement product stock
    await decrementOrderStockOnce(finalOrder.items);

    // 2. Meta Conversions API (CAPI) server-side purchase event
    try {
      const nameParts = (finalOrder.customer_name || "").trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      const sourceDomain =
        entityLabel === "UK"
          ? "https://www.wallbedking.co.uk"
          : "https://www.wallbedking.com";

      await sendMetaCapiPurchase({
        orderId: finalOrder.id,
        amount: finalOrder.total_amount,
        currency: finalOrder.currency || targetCurrency,
        email: finalOrder.customer_email || "",
        phone: finalOrder.customer_phone || "",
        firstName,
        lastName,
        clientIp,
        userAgent,
        sourceUrl: `${sourceDomain}/${effectiveLocale}/thanks`,
      });
    } catch (capiErr) {
      console.warn("[Stripe Fulfillment] Meta CAPI notice:", capiErr?.message || capiErr);
    }

    // 3. Send Customer Order Confirmation + Admin Order Alert (handled inside sendOrderConfirmationEmail)
    if (finalOrder.customer_email && finalOrder.customer_email !== "n/a") {
      try {
        const sendResult = await sendOrderConfirmationEmail(
          { ...finalOrder, payment_status: "paid" },
          effectiveLocale,
          false
        );
        emailSent = Boolean(sendResult?.success);
        if (!sendResult?.success) {
          console.warn("[Stripe Fulfillment] Confirmation email warning:", sendResult?.error);
        }
      } catch (emailErr) {
        console.error("[Stripe Fulfillment] Confirmation email exception:", emailErr);
      }
    }
  }

  return {
    success: true,
    newlyPaid,
    alreadyPaid: !newlyPaid,
    emailSent,
    order: finalOrder,
  };
}

