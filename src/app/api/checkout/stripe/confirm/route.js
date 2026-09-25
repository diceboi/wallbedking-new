import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { sendOrderConfirmationEmail, sendAdminOrderAlert } from "@/lib/email";
import { getPaymentConfig } from "@/lib/payments";
import catalogProducts from "@/data/products-catalog.json";

export const dynamic = "force-dynamic";

/**
 * Parses cart_id (e.g. "test-product-2-1-test-product-235-1||T=...||D=...") into line items
 */
function parseItemsFromCartId(cartId) {
  if (!cartId || typeof cartId !== "string") return [];
  try {
    const rawItemsPart = cartId.split("||")[0];
    const items = [];

    // Check each catalog product if its slug appears in the cart_id string
    for (const p of catalogProducts) {
      if (p.slug && rawItemsPart.includes(p.slug)) {
        // Find quantity following the slug, e.g. `${p.slug}-1`
        const regex = new RegExp(`${p.slug.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")}-(\\d+)`);
        const match = rawItemsPart.match(regex);
        const qty = match ? parseInt(match[1], 10) : 1;

        items.push({
          id: p.id,
          name: p.name,
          variant: p.type ? `${p.type} ${p.orientation || ""}`.trim() : "Standard",
          quantity: qty,
          price: Number(p.price_gbp || p.price_euro || 0),
          slug: p.slug,
        });
      }
    }

    if (items.length > 0) return items;
  } catch (e) {
    console.warn("[Confirm Session] CartId parse notice:", e);
  }

  return [
    {
      name: "Wall Bed King Product",
      variant: "Standard",
      quantity: 1,
      price: 0,
    },
  ];
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { session_id, order_id, cart_id, locale = "en" } = body || {};

    if (!session_id) {
      return NextResponse.json(
        { success: false, error: "Missing session_id parameter." },
        { status: 400 }
      );
    }

    console.log(`[Confirm Session] Verifying Stripe session: ${session_id} (Order: ${order_id || "N/A"})`);

    const paymentConfig = getPaymentConfig(locale);

    // 1. If direct Stripe key is available, query Stripe API directly
    let sessionData = null;
    if (paymentConfig.stripeSecretKey) {
      try {
        const stripe = new Stripe(paymentConfig.stripeSecretKey);
        const s = await stripe.checkout.sessions.retrieve(session_id, {
          expand: ["line_items", "customer_details"],
        });
        if (s && s.id) {
          sessionData = {
            payment_intent: typeof s.payment_intent === "string" ? s.payment_intent : s.payment_intent?.id || s.id,
            amount_total: s.amount_total ? s.amount_total / 100 : 0,
            currency: s.currency ? s.currency.toUpperCase() : "GBP",
            customer_email: s.customer_details?.email || s.customer_email,
            customer_name: s.customer_details?.name || "Valued Customer",
            customer_phone: s.customer_details?.phone || "",
            customer_address: s.customer_details?.address
              ? {
                  line1: s.customer_details.address.line1 || "",
                  line2: s.customer_details.address.line2 || "",
                  city: s.customer_details.address.city || "",
                  postal_code: s.customer_details.address.postal_code || "",
                  country: s.customer_details.address.country || "",
                }
              : {},
            cart_id: s.metadata?.cart_id || s.client_reference_id || "",
          };
        }
      } catch (directStripeErr) {
        console.warn("[Confirm Session] Direct Stripe retrieval notice:", directStripeErr.message);
      }
    }

    // 2. Fallback to OnRender microservices (stripe-uk / stripe-05m9) if direct retrieval didn't return
    if (!sessionData) {
      try {
        const statusUrl = `${paymentConfig.stripeStatusEndpoint}?session_id=${encodeURIComponent(session_id)}`;
        const res = await fetch(statusUrl, { method: "GET" });
        if (res.ok) {
          sessionData = await res.json();
        } else {
          console.warn(`[Confirm Session] Primary status fetch returned ${res.status}`);
        }
      } catch (err) {
        console.warn("[Confirm Session] Failed fetching status from primary entity:", err.message);
      }
    }

    // Fallback: If primary failed or returned error, try the alternate entity endpoint
    if (!sessionData || sessionData.error) {
      const altEndpoint =
        paymentConfig.entity === "UK"
          ? "https://stripe-05m9.onrender.com/session-status"
          : "https://stripe-uk.onrender.com/session-status";
      try {
        const altRes = await fetch(`${altEndpoint}?session_id=${encodeURIComponent(session_id)}`);
        if (altRes.ok) {
          sessionData = await altRes.json();
        }
      } catch (err) {
        console.warn("[Confirm Session] Failed fetching status from alternate entity:", err.message);
      }
    }

    if (!sessionData || sessionData.error) {
      return NextResponse.json(
        { success: false, error: sessionData?.error || "Could not retrieve Stripe session details." },
        { status: 404 }
      );
    }

    const {
      payment_intent,
      amount_total,
      currency,
      customer_email,
      customer_name,
      customer_phone,
      customer_address,
      cart_id: sessionCartId,
    } = sessionData;

    const effectiveCartId = cart_id || sessionCartId || "";
    const effectiveOrderId = order_id || (sessionCartId && sessionCartId.startsWith("WBK-") ? sessionCartId : `WBK-${Date.now().toString().slice(-6)}`);
    const customerEmailClean = (customer_email || "").trim().toLowerCase();

    // 2. Check if order already exists in Supabase
    let existingOrder = null;
    if (supabaseAdmin) {
      try {
        const { data } = await supabaseAdmin
          .from("orders")
          .select("*")
          .or(`id.eq.${effectiveOrderId},payment_id.eq.${payment_intent || session_id}`)
          .limit(1);

        if (data && data.length > 0) {
          existingOrder = data[0];
        }
      } catch (dbErr) {
        console.warn("[Confirm Session] Order lookup exception:", dbErr.message);
      }
    }

    // 3. Prepare or update the order record
    const targetCurrency = (currency || paymentConfig.currency).toUpperCase();
    const parsedItems = existingOrder?.items?.length ? existingOrder.items : parseItemsFromCartId(effectiveCartId);

    const orderRecord = {
      id: effectiveOrderId,
      payment_id: payment_intent || session_id,
      payment_method: "stripe",
      status: "paid",
      payment_status: "paid",
      customer_name: customer_name && customer_name !== "N/A" ? customer_name : (existingOrder?.customer_name || "Valued Customer"),
      customer_email: customerEmailClean && customerEmailClean !== "n/a" ? customerEmailClean : (existingOrder?.customer_email || ""),
      customer_phone: customer_phone && customer_phone !== "N/A" ? customer_phone : (existingOrder?.customer_phone || ""),
      shipping_address: customer_address && customer_address.line1 !== "N/A" ? customer_address : (existingOrder?.shipping_address || {}),
      billing_address: customer_address && customer_address.line1 !== "N/A" ? customer_address : (existingOrder?.billing_address || {}),
      items: parsedItems,
      currency: targetCurrency,
      company_entity: paymentConfig.entity,
      locale: locale || "en",
      total_amount: Number(amount_total || existingOrder?.total_amount || 0),
      updated_at: new Date().toISOString(),
    };

    let alreadyEmailed = Boolean(existingOrder?.email_sent);

    // Save/upsert to Supabase
    if (supabaseAdmin) {
      try {
        if (existingOrder) {
          await supabaseAdmin
            .from("orders")
            .update({
              status: "paid",
              payment_status: "paid",
              payment_id: payment_intent || session_id,
              customer_name: orderRecord.customer_name,
              customer_email: orderRecord.customer_email,
              customer_phone: orderRecord.customer_phone,
              shipping_address: orderRecord.shipping_address,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingOrder.id);
        } else {
          orderRecord.created_at = new Date().toISOString();
          orderRecord.email_sent = false;
          await supabaseAdmin.from("orders").insert([orderRecord]);
        }
      } catch (insertErr) {
        console.warn("[Confirm Session] Supabase write notice:", insertErr.message);
      }
    }

    // 4. Send Confirmation Emails if not yet sent
    let emailSent = alreadyEmailed;
    if (!alreadyEmailed && orderRecord.customer_email && orderRecord.customer_email !== "n/a") {
      console.log(`[Confirm Session] Dispatching order confirmation email to ${orderRecord.customer_email} (${locale})...`);
      try {
        const sendResult = await sendOrderConfirmationEmail(orderRecord, locale);
        if (sendResult?.success) {
          emailSent = true;
          // Update order email_sent status in Supabase
          if (supabaseAdmin) {
            await supabaseAdmin
              .from("orders")
              .update({ email_sent: true })
              .eq("id", orderRecord.id);
          }
        } else {
          console.warn("[Confirm Session] Email dispatch warning:", sendResult?.error);
        }
      } catch (emailErr) {
        console.error("[Confirm Session] Email dispatch exception:", emailErr);
      }

      // Also trigger admin order alert
      try {
        await sendAdminOrderAlert(orderRecord);
      } catch (adminEmailErr) {
        console.warn("[Confirm Session] Admin email alert exception:", adminEmailErr);
      }
    }

    return NextResponse.json({
      success: true,
      order: orderRecord,
      emailSent,
      session: {
        paymentIntent: payment_intent,
        amount: amount_total,
        currency: targetCurrency,
      },
    });
  } catch (error) {
    console.error("[Confirm Session Fatal Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
