import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { getPaymentConfig } from "@/lib/payments";
import { generateOrderNumber } from "@/lib/orders";
import { getAllowedCountryCodes } from "@/lib/countries";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const { line_items, cartId, orderId, success_url, cancel_url, locale = "en", currency = null, customer, customerEmail } = body;

    if (!line_items || !Array.isArray(line_items) || line_items.length === 0) {
      return NextResponse.json(
        { error: "Missing or empty line_items in request." },
        { status: 400 }
      );
    }

    const referenceId =
      orderId && String(orderId).startsWith("WBK-")
        ? orderId
        : await generateOrderNumber();
    const paymentConfig = getPaymentConfig(locale, currency);
    const targetCurrencyLower = paymentConfig.stripeCurrency;
    const clientEmail = (customerEmail || customer?.email || "").trim().toLowerCase();

    console.log(`[Stripe Checkout] Initiating session for entity: ${paymentConfig.entity} (${paymentConfig.companyName}), Currency: ${targetCurrencyLower.toUpperCase()}, Locale: ${locale}, Direct Stripe: ${Boolean(paymentConfig.stripeSecretKey)}`);

    // Server-side authoritative price validation against Supabase database
    let authoritativeLineItems = line_items;
    if (Array.isArray(body.items) && body.items.length > 0) {
      try {
        const { validateOrderTotals } = await import("@/lib/orders");
        const valCalc = await validateOrderTotals(
          body.items,
          body.deliveryOption || "delivery_option_economy",
          body.promoCode || "",
          targetCurrencyLower.toUpperCase(),
          locale
        );

        if (valCalc?.hasOutOfStockItems) {
          const outNames = valCalc.outOfStockItems.map((i) => i.title).join(", ");
          return NextResponse.json(
            {
              error: `Sorry, the following item(s) are currently out of stock or unavailable: ${outNames}. Please remove them from your cart to proceed.`,
              outOfStock: true,
            },
            { status: 400 }
          );
        }

        if (valCalc?.items && valCalc.items.length > 0) {
          const discountMultiplier = valCalc.subtotal > 0 ? Math.max(0, (valCalc.subtotal - valCalc.discountAmount) / valCalc.subtotal) : 1;
          const recomputed = valCalc.items.map((it) => {
            const discountedPrice = Math.round(it.price * discountMultiplier * 100) / 100;
            const unitAmountPence = Math.round(discountedPrice * 100);
            const optionsDesc = [
              it.options?.size,
              it.options?.orientation,
              it.options?.type,
              it.options?.sofaIncluded ? "Morphy Sofa Included" : null,
            ].filter(Boolean).join(" | ");

            return {
              price_data: {
                currency: targetCurrencyLower,
                product_data: {
                  name: it.title,
                  description: optionsDesc || "Wall Bed King Product",
                },
                unit_amount: unitAmountPence,
              },
              quantity: it.quantity || 1,
            };
          });

          if (valCalc.shippingAmount > 0) {
            recomputed.push({
              price_data: {
                currency: targetCurrencyLower,
                product_data: {
                  name: valCalc.delivery?.label || "Delivery",
                  description: valCalc.delivery?.message || "Standard Delivery",
                },
                unit_amount: Math.round(valCalc.shippingAmount * 100),
              },
              quantity: 1,
            });
          }

          authoritativeLineItems = recomputed;
        }
      } catch (err) {
        console.warn("[Stripe Route] Authoritative database price validation notice:", err);
      }
    }

    // 1. Direct Stripe Checkout Session creation if secret key is present for this entity
    if (paymentConfig.stripeSecretKey) {
      const stripe = new Stripe(paymentConfig.stripeSecretKey);

      let effectiveSuccessUrl = `${paymentConfig.domain}/${locale}/thanks?session_id={CHECKOUT_SESSION_ID}&order_id=${encodeURIComponent(
        referenceId
      )}&cart_id=${encodeURIComponent(cartId || "")}`;
      if (success_url) {
        try {
          const u = new URL(success_url);
          u.searchParams.set("order_id", referenceId);
          u.searchParams.set("session_id", "{CHECKOUT_SESSION_ID}");
          if (cartId) u.searchParams.set("cart_id", cartId);
          effectiveSuccessUrl = u.toString();
        } catch {
          // keep fallback
        }
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        customer_email: clientEmail || undefined,
        line_items: authoritativeLineItems.map((item) => ({
          price_data: {
            currency: item.price_data?.currency || targetCurrencyLower,
            product_data: {
              name: item.price_data?.product_data?.name || "Wall Bed King Product",
              description: item.price_data?.product_data?.description || undefined,
            },
            unit_amount: item.price_data?.unit_amount,
          },
          quantity: item.quantity || 1,
        })),
        mode: "payment",
        success_url: effectiveSuccessUrl,
        cancel_url: cancel_url || `${paymentConfig.domain}/${locale}/cart`,
        client_reference_id: referenceId,
        metadata: {
          order_id: referenceId,
          cart_id: cartId || "",
          company_entity: paymentConfig.entity,
          locale,
        },
        phone_number_collection: {
          enabled: true,
        },
        shipping_address_collection: {
          allowed_countries: getAllowedCountryCodes(locale) || ["GB"],
        },
      });

      // Optionally attach payment_id to pending order if orderId exists
      if (orderId && supabaseAdmin) {
        try {
          await supabaseAdmin
            .from("orders")
            .update({
              payment_id: session.id,
              payment_method: "stripe",
              company_entity: paymentConfig.entity,
              currency: paymentConfig.currency,
            })
            .eq("id", orderId);
        } catch (e) {
          console.warn("[Stripe Session] Order payment_id link notice:", e.message);
        }
      }

      return NextResponse.json({
        id: session.id,
        url: session.url,
        entity: paymentConfig.entity,
      });
    }

    // 2. Route to the dedicated Wall Bed King OnRender Stripe microservice for this company
    // UK: https://stripe-uk.onrender.com/create-checkout-session
    // International: https://stripe-05m9.onrender.com/create-checkout-session
    const formattedLineItems = authoritativeLineItems.map((item) => ({
      ...item,
      price_data: {
        ...item.price_data,
        currency: item.price_data?.currency || targetCurrencyLower,
      },
    }));

    let onrenderSuccessUrl = `/${locale}/thanks?session_id={CHECKOUT_SESSION_ID}&order_id=${encodeURIComponent(
      referenceId
    )}&cart_id=${encodeURIComponent(cartId || "")}`;
    if (success_url) {
      try {
        const u = new URL(
          success_url.startsWith("http")
            ? success_url
            : `https://wallbedking.com${success_url.startsWith("/") ? "" : "/"}${success_url}`
        );
        u.searchParams.set("order_id", referenceId);
        u.searchParams.set("session_id", "{CHECKOUT_SESSION_ID}");
        if (cartId) u.searchParams.set("cart_id", cartId);
        onrenderSuccessUrl = `${u.pathname}${u.search}`;
      } catch {
        // keep default
      }
    }

    let onrenderCancelUrl = `/${locale}/cart`;
    if (cancel_url) {
      try {
        if (cancel_url.startsWith("http://") || cancel_url.startsWith("https://")) {
          const u = new URL(cancel_url);
          onrenderCancelUrl = `${u.pathname}${u.search}`;
        } else {
          onrenderCancelUrl = cancel_url.startsWith("/") ? cancel_url : `/${cancel_url}`;
        }
      } catch {
        // keep default
      }
    }

    const response = await fetch(paymentConfig.stripeEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: paymentConfig.stripeOrigin,
        Referer: paymentConfig.stripeReferer,
      },
      body: JSON.stringify({
        line_items: formattedLineItems,
        success_url: onrenderSuccessUrl,
        cancel_url: onrenderCancelUrl,
        cartId: referenceId,
        collect_phone: true,
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      console.error(`[Stripe Microservice Error] [${paymentConfig.entity}]:`, data);
      return NextResponse.json(
        { error: data.error || `Payment gateway responded with status ${response.status}` },
        { status: response.status || 500 }
      );
    }

    // Update order with entity tag if pending
    if (orderId && supabaseAdmin) {
      try {
        await supabaseAdmin
          .from("orders")
          .update({
            payment_method: "stripe",
            company_entity: paymentConfig.entity,
            currency: paymentConfig.currency,
          })
          .eq("id", orderId);
      } catch (e) {
        console.warn("[Stripe Proxy] Order entity update notice:", e.message);
      }
    }

    return NextResponse.json({
      ...data,
      entity: paymentConfig.entity,
    });
  } catch (error) {
    console.error("Internal Stripe route error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error connecting to payment gateway" },
      { status: 500 }
    );
  }
}
