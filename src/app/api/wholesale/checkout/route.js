import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { generateOrderNumber } from "@/lib/orders";
import { getPaymentConfig } from "@/lib/payments";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { buildStripeSuccessUrl } from "@/lib/stripe-fulfillment";
import {
  resolveWholesaleUserFromRequest,
  getWholesaleProductPricesMap,
  getWholesaleCheckoutSettings,
  computeWholesaleProductPricing,
} from "@/lib/wholesale-server";

export const dynamic = "force-dynamic";

/**
 * POST /api/wholesale/checkout
 * Server-validated B2B Wholesale order creation (Net prices, excl. VAT, no retail promos).
 * - Does NOT require stock > 0 and does NOT decrement retail stock.
 * - Supports single units and full containers (`orderUnit === "container"`).
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      items = [],
      customer = {},
      shippingAddress = {},
      paymentMethod = "bank",
      locale = "en",
      companyName = "",
      vatNumber = "",
      notes = "",
    } = body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Your wholesale cart is empty." },
        { status: 400 }
      );
    }

    const authState = await resolveWholesaleUserFromRequest(request, locale);
    if (!authState.isWholesale || !authState.partner) {
      return NextResponse.json(
        { success: false, error: "Wholesale account authorization is required to place B2B orders." },
        { status: 403 }
      );
    }

    const [pricesMap, paymentSettings] = await Promise.all([
      getWholesaleProductPricesMap(),
      getWholesaleCheckoutSettings(),
    ]);

    // Verify selected payment method is enabled for Wholesale
    const normMethod = String(paymentMethod || "bank").toLowerCase();
    const methodAllowed =
      (normMethod === "bank" && paymentSettings.bankTransfer?.enabled) ||
      (normMethod === "paypal" && paymentSettings.paypal?.enabled) ||
      (normMethod === "stripe" && paymentSettings.stripe?.enabled);

    if (!methodAllowed) {
      return NextResponse.json(
        { success: false, error: "Selected payment method is not enabled for wholesale orders." },
        { status: 400 }
      );
    }

    if (!customer?.email || !shippingAddress?.address1 || !shippingAddress?.city || !shippingAddress?.postcode) {
      return NextResponse.json(
        { success: false, error: "Missing required contact or delivery address fields." },
        { status: 400 }
      );
    }

    // Recompute authoritative net prices strictly on the server
    const validatedItems = [];
    let subtotal = 0;
    let resolvedCurrency = null;

    for (const rawItem of items) {
      const pid = String(rawItem.rawId || rawItem.productId || rawItem.id || "");
      const rec = pricesMap[pid];
      const computed = computeWholesaleProductPricing(rec, authState.partner);

      if (!computed || !computed.hasPrice) {
        return NextResponse.json(
          {
            success: false,
            error: `Wholesale pricing is not available for "${rawItem.title || rawItem.name || pid}".`,
          },
          { status: 400 }
        );
      }

      const isContainerOrder = rawItem.options?.orderUnit === "container";
      if (isContainerOrder && !authState.partner.allowContainer) {
        return NextResponse.json(
          { success: false, error: "Full container orders are not enabled for your partner tier." },
          { status: 403 }
        );
      }
      if (!isContainerOrder && !authState.partner.allowSingleUnit) {
        return NextResponse.json(
          { success: false, error: "Single-unit orders are not enabled for your partner tier." },
          { status: 403 }
        );
      }

      const qtyRequested = Math.max(1, parseInt(rawItem.quantity, 10) || 1);
      const unitsPerLine = isContainerOrder && computed.containerQty ? computed.containerQty : 1;
      const effectiveUnitPrice = isContainerOrder && computed.containerTotal
        ? computed.containerTotal
        : computed.unitPrice;
      const lineTotal = Math.round(effectiveUnitPrice * qtyRequested * 100) / 100;

      if (!resolvedCurrency) {
        resolvedCurrency = computed.currency;
      }

      subtotal = Math.round((subtotal + lineTotal) * 100) / 100;

      validatedItems.push({
        id: rawItem.id || pid,
        rawId: Number(pid) || pid,
        sku: rec?.sku || rawItem.sku || "",
        slug: rawItem.slug || "",
        title: rawItem.title || rawItem.name || "Wall Bed King Product",
        image: rawItem.image || "",
        price: effectiveUnitPrice,
        quantity: qtyRequested,
        itemTotal: lineTotal,
        isOutOfStock: false,
        options: {
          ...(rawItem.options || {}),
          orderType: "wholesale",
          orderUnit: isContainerOrder ? "container" : "unit",
          unitsPerContainer: isContainerOrder ? unitsPerLine : null,
          totalPieces: qtyRequested * unitsPerLine,
          unitNetPrice: computed.unitPrice,
          currency: computed.currency,
          vatNote: "Excl. VAT (Net)",
          wholesaleTier: authState.partner.roleKey,
        },
      });
    }

    const effectiveCurrency = resolvedCurrency || "USD";
    const orderId = await generateOrderNumber();
    const paymentConfig = getPaymentConfig(authState.partner.wholesaleMarket || locale, effectiveCurrency);

    const resolvedCompany = String(companyName || authState.partner.companyName || "").trim();
    const resolvedVat = String(vatNumber || authState.partner.vatNumber || "").trim();

    const adminNotesParts = [
      "[WHOLESALE]",
      `[Entity: ${paymentConfig.entity}]`,
      `[Locale: ${authState.partner.wholesaleMarket || locale}]`,
      `[Tier: ${authState.partner.roleKey}]`,
      resolvedCompany ? `[Company: ${resolvedCompany}]` : null,
      resolvedVat ? `[VAT: ${resolvedVat}]` : null,
      "[Net Price Excl. VAT]",
    ].filter(Boolean);

    const shippingRecord = {
      ...shippingAddress,
      locale: authState.partner.wholesaleMarket || locale,
      company_entity: paymentConfig.entity,
      order_type: "wholesale",
      wholesale_tier: authState.partner.roleKey,
      company_name: resolvedCompany,
      vat_number: resolvedVat,
    };

    const baseOrderRecord = {
      id: orderId,
      user_id: authState.partner.userId || null,
      status: normMethod === "bank" ? "processing" : "pending",
      payment_status: "unpaid",
      payment_method: normMethod,
      customer_name: customer.name || authState.partner.fullName || "Wholesale Partner",
      customer_email: customer.email.trim().toLowerCase(),
      customer_phone: customer.phone || "",
      shipping_address: shippingRecord,
      billing_address: shippingRecord,
      items: validatedItems,
      currency: effectiveCurrency,
      subtotal,
      discount_amount: 0,
      promo_code: null,
      shipping_amount: 0,
      vat_amount: 0, // Net wholesale prices (excl. VAT)
      total_amount: subtotal,
      delivery_option: "wholesale_freight_tbd",
      delivery_label: "Wholesale Freight (Arranged Separately)",
      delivery_message: "Net B2B order (excl. VAT). Freight / container shipping arranged separately.",
      customer_notes: String(notes || "").trim(),
      admin_notes: adminNotesParts.join(" "),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (supabaseAdmin) {
      // Try inserting with native wholesale columns first; fallback cleanly if SQL migration hasn't been run yet
      const richRecord = {
        ...baseOrderRecord,
        order_type: "wholesale",
        wholesale_tier: authState.partner.roleKey,
        company_name: resolvedCompany,
        vat_number: resolvedVat,
      };
      const { error: richErr } = await supabaseAdmin.from("orders").insert([richRecord]);
      if (richErr) {
        console.warn("[Wholesale Checkout] Native wholesale columns fallback:", richErr.message);
        const { error: fallbackErr } = await supabaseAdmin.from("orders").insert([baseOrderRecord]);
        if (fallbackErr) {
          return NextResponse.json(
            { success: false, error: `Failed to save wholesale order: ${fallbackErr.message}` },
            { status: 500 }
          );
        }
      }
    }

    // If Stripe is selected and enabled for Wholesale, create a B2B Net Stripe Checkout Session
    // using the server-validated net prices (NEVER retail prices).
    let stripeUrl = null;
    if (normMethod === "stripe" && paymentConfig.stripeSecretKey) {
      try {
        const stripe = new Stripe(paymentConfig.stripeSecretKey);
        const origin = request.headers.get("origin") || paymentConfig.domain;
        const targetLocale = authState.partner.wholesaleMarket || locale;
        const successUrl = buildStripeSuccessUrl(`${origin}/${targetLocale}/thanks`, {
          orderId,
          cartId: `wholesale_${orderId}`,
        });

        const stripeSession = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          customer_email: customer.email.trim().toLowerCase(),
          line_items: validatedItems.map((it) => ({
            price_data: {
              currency: effectiveCurrency.toLowerCase(),
              product_data: {
                name: it.title,
                description:
                  it.options?.orderUnit === "container"
                    ? `B2B Full Container (${it.options.unitsPerContainer} pcs/ctr) • Net Excl. VAT`
                    : `B2B Wholesale Unit • Net Excl. VAT`,
                metadata: {
                  sku: it.sku || "",
                  order_type: "wholesale",
                },
              },
              unit_amount: Math.round(Number(it.price) * 100),
            },
            quantity: it.quantity || 1,
          })),
          mode: "payment",
          success_url: successUrl,
          cancel_url: `${origin}/${targetLocale}/wholesale/checkout`,
          client_reference_id: orderId,
          metadata: {
            order_id: orderId,
            order_type: "wholesale",
            wholesale_tier: authState.partner.roleKey,
            company_entity: paymentConfig.entity,
            locale: targetLocale,
          },
        });

        stripeUrl = stripeSession.url;
        if (supabaseAdmin && stripeSession.id) {
          await supabaseAdmin
            .from("orders")
            .update({
              payment_id: stripeSession.id,
              updated_at: new Date().toISOString(),
            })
            .eq("id", orderId);
        }
      } catch (stripeErr) {
        console.error("[Wholesale Checkout] Stripe session error:", stripeErr);
        return NextResponse.json(
          { success: false, error: `Stripe payment initialization failed: ${stripeErr.message}` },
          { status: 500 }
        );
      }
    }

    // For bank transfer / PayPal invoice orders, send confirmation & admin alert immediately
    if (normMethod === "bank" || normMethod === "paypal") {
      try {
        await sendOrderConfirmationEmail(
          { ...baseOrderRecord, order_type: "wholesale" },
          authState.partner.wholesaleMarket || locale
        );
      } catch (emailErr) {
        console.error("[Wholesale Checkout] Email dispatch notice:", emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      orderId,
      currency: effectiveCurrency,
      total: subtotal,
      stripeUrl,
      order: { ...baseOrderRecord, order_type: "wholesale" },
    });
  } catch (err) {
    console.error("[api/wholesale/checkout] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to place wholesale order" },
      { status: 500 }
    );
  }
}
