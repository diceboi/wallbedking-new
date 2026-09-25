import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { validateOrderTotals, generateOrderNumber } from "@/lib/orders";
import { getPaymentConfig } from "@/lib/payments";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      items,
      customer,
      shippingAddress,
      billingAddress,
      deliveryOption,
      promoCode,
      paymentMethod = "card",
      userId = null,
      notes = "",
      locale = "en",
      currency = null,
      companyEntity = null,
    } = body || {};

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cart is empty." },
        { status: 400 }
      );
    }

    if (!customer?.email || !shippingAddress?.address1 || !shippingAddress?.city || !shippingAddress?.postcode) {
      return NextResponse.json(
        { success: false, error: "Missing required customer or shipping address fields." },
        { status: 400 }
      );
    }

    const paymentConfig = getPaymentConfig(locale, currency);
    const targetCurrency = (currency || paymentConfig.currency).toUpperCase();
    const targetEntity = companyEntity || paymentConfig.entity;

    // 1. Server-side validation of prices and totals
    const calculation = await validateOrderTotals(items, deliveryOption, promoCode);

    const customerName = [
      shippingAddress.firstName || customer.firstName || "",
      shippingAddress.lastName || customer.lastName || "",
    ]
      .filter(Boolean)
      .join(" ") || customer.name || "Valued Customer";

    const orderId = generateOrderNumber();

    const orderRecord = {
      id: orderId,
      user_id: userId || null,
      status: "pending",
      payment_status: "unpaid",
      payment_method: paymentMethod,
      customer_name: customerName,
      customer_email: customer.email.trim().toLowerCase(),
      customer_phone: customer.phone || "",
      shipping_address: shippingAddress,
      billing_address: billingAddress || shippingAddress,
      items: calculation.items,
      currency: targetCurrency,
      company_entity: targetEntity,
      locale: locale || "en",
      subtotal: calculation.subtotal,
      discount_amount: calculation.discountAmount,
      promo_code: calculation.promoCode,
      shipping_amount: calculation.shippingAmount,
      vat_amount: calculation.vatAmount,
      total_amount: calculation.totalAmount,
      delivery_option: calculation.delivery.id,
      delivery_label: calculation.delivery.label,
      delivery_message: calculation.delivery.message,
      customer_notes: notes || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 2. Persist order into Supabase
    let savedToDb = false;
    if (supabaseAdmin) {
      try {
        const { error: insertError } = await supabaseAdmin
          .from("orders")
          .insert([orderRecord]);

        if (insertError) {
          console.warn("[Create Order] Supabase insert warning:", insertError.message);
        } else {
          savedToDb = true;
        }
      } catch (dbErr) {
        console.warn("[Create Order] Supabase insert exception:", dbErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      orderId: orderRecord.id,
      total: orderRecord.total_amount,
      savedToDb,
      order: orderRecord,
    });
  } catch (err) {
    console.error("[Create Order] Handler error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process order creation" },
      { status: 500 }
    );
  }
}
