"use client";

import { useEffect, useRef, useState } from "react";
import { IconLoader2, IconAlertCircle } from "@tabler/icons-react";
import { useCart } from "@/context/CartContext";
import { useLocale } from "@/context/LocaleContext";
import { useAuth } from "@/context/AuthContext";
import { getPaymentConfig } from "@/lib/payments";

export function PayPalCheckoutButton({ disabled = false, customerDetails = null, onBeforeCheckout = null }) {
  const { user } = useAuth();
  const { locale, market, t } = useLocale();
  const paymentConfig = getPaymentConfig(locale, market?.currency);
  const paypalClientId = paymentConfig.paypalClientId;
  const paypalCurrency = paymentConfig.paypalCurrency;
  const paypalDescriptor = paymentConfig.paypalDescriptor;

  const {
    items,
    subtotal,
    discount,
    shipping,
    total,
    customCartId,
    deliveryOption,
    promoCode,
    selectedDeliveryDetails,
  } = useCart();

  const containerRef = useRef(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Keep references to latest cart and payment values inside PayPal callbacks
  const cartRef = useRef({ items, subtotal, discount, shipping, total, customCartId, deliveryOption, promoCode, selectedDeliveryDetails, locale, paypalCurrency, paymentConfig, customerDetails, onBeforeCheckout, user });
  useEffect(() => {
    cartRef.current = { items, subtotal, discount, shipping, total, customCartId, deliveryOption, promoCode, selectedDeliveryDetails, locale, paypalCurrency, paymentConfig, customerDetails, onBeforeCheckout, user };
  }, [items, subtotal, discount, shipping, total, customCartId, deliveryOption, promoCode, selectedDeliveryDetails, locale, paypalCurrency, paymentConfig, customerDetails, onBeforeCheckout, user]);

  // Load PayPal SDK Script dynamically based on selected market / entity
  useEffect(() => {
    setSdkReady(false);
    setSdkError("");

    const targetScriptId = `wbk-paypal-sdk-${paypalClientId}-${paypalCurrency}`;

    // If an existing PayPal script for another entity or currency exists, remove it first
    const existingScripts = document.querySelectorAll("script[id^='wbk-paypal-sdk']");
    let hasMatchingScript = false;

    existingScripts.forEach((s) => {
      if (s.id === targetScriptId) {
        hasMatchingScript = true;
      } else {
        s.remove();
        if (typeof window !== "undefined") {
          window.paypal = undefined;
        }
      }
    });

    if (hasMatchingScript && window.paypal) {
      setSdkReady(true);
      return;
    }

    const script = document.createElement("script");
    script.id = targetScriptId;
    script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=${paypalCurrency}&components=buttons&enable-funding=card&disable-funding=sofort`;
    script.async = true;
    script.onload = () => {
      console.log(`[PayPal SDK] Loaded successfully for entity: ${paymentConfig.entity}, Currency: ${paypalCurrency}`);
      setSdkReady(true);
    };
    script.onerror = () => setSdkError("Failed to load PayPal SDK. Please refresh or try another payment method.");
    document.body.appendChild(script);

    return () => {
      // Cleanup if unmounted while changing
    };
  }, [paypalClientId, paypalCurrency, paymentConfig.entity]);

  // Render PayPal Buttons when SDK is ready
  useEffect(() => {
    if (!sdkReady || !containerRef.current || !window.paypal || disabled || items.length === 0) {
      return;
    }

    containerRef.current.innerHTML = "";

    try {
      window.paypal
        .Buttons({
          style: {
            layout: "vertical",
            color: "gold",
            shape: "rect",
            label: "checkout",
            tagline: false,
          },

          createOrder: async (data, actions) => {
            const current = cartRef.current;
            if (typeof current.onBeforeCheckout === "function") {
              try {
                await current.onBeforeCheckout();
              } catch (err) {
                console.warn("PayPal onBeforeCheckout error:", err);
              }
            }
            const curr = current.paypalCurrency || "GBP";

            // 1. Authoritative real-time server-side price validation against Supabase database
            let effectiveItems = current.items || [];
            let effectiveShippingVal = Number(current.shipping) || 0;
            let effectiveTotalVal = Number(current.total) || 0;

            try {
              const valRes = await fetch("/api/checkout/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  items: current.items,
                  deliveryOption: current.deliveryOption,
                  promoCode: current.promoCode || "",
                  currency: curr,
                  locale: current.locale || "en",
                }),
              });
              const valData = await valRes.json();
              if (valData?.success && Array.isArray(valData?.items) && valData.items.length > 0) {
                effectiveItems = valData.items;
                effectiveShippingVal = Number(valData.shippingAmount) || 0;
                effectiveTotalVal = Number(valData.totalAmount) || 0;
              }
            } catch (vErr) {
              console.warn("[PayPal Checkout] Real-time database validation notice:", vErr);
            }

            // Calculate precise monetary values in cents to avoid IEEE 754 rounding mismatches
            const parsedItems = effectiveItems.map((it) => {
              const priceCents = Math.round((Math.max(0, Number(it.price)) || 0) * 100);
              const qty = Math.max(1, parseInt(it.quantity, 10) || 1);
              const opt = [it.options?.size, it.options?.orientation, it.options?.color].filter(Boolean).join(" - ");
              return {
                it,
                priceCents,
                qty,
                totalCents: priceCents * qty,
                opt,
              };
            });

            const itemsTotalCents = parsedItems.reduce((acc, currItem) => acc + currItem.totalCents, 0);
            const shippingCents = Math.round(effectiveShippingVal * 100);
            const finalTotalCents = Math.round(effectiveTotalVal * 100);

            // Calculate exact discount needed so that itemsTotal + shipping - discount === finalTotal
            const effectiveDiscountCents = Math.max(0, itemsTotalCents + shippingCents - finalTotalCents);

            const finalTotal = (finalTotalCents / 100).toFixed(2);
            const itemsTotalStr = (itemsTotalCents / 100).toFixed(2);
            const shippingStr = (shippingCents / 100).toFixed(2);
            const discountStr = (effectiveDiscountCents / 100).toFixed(2);

            // Construct human-readable order summary description (max 127 chars for PayPal)
            // e.g.: "Classic Vertical Wall Bed (Double 135x190) x1"
            const itemsSummary = parsedItems
              .map(({ it, opt, qty }) => {
                const optText = opt ? ` (${opt})` : "";
                return `${it.title || it.name || "Product"}${optText} x${qty}`;
              })
              .join(", ");

            const orderDescription = (itemsSummary || "Wall Bed King Order").slice(0, 127);

            // Build itemized list for PayPal invoice and receipt emails
            const paypalItems = parsedItems.map(({ it, priceCents, qty, opt }) => ({
              name: String(it.title || it.name || "Wall Bed King Product").slice(0, 127),
              description: String(opt || "Standard").slice(0, 127),
              sku: String(it.rawId || it.productId || it.id || "WBK").slice(0, 60),
              unit_amount: {
                currency_code: curr,
                value: (priceCents / 100).toFixed(2),
              },
              quantity: String(qty),
              category: "PHYSICAL_GOODS",
            }));

            // Construct purchase_unit payload
            const purchaseUnit = {
              description: orderDescription,
              custom_id: String(current.customCartId || "").slice(0, 127),
              soft_descriptor: paypalDescriptor,
              amount: {
                currency_code: curr,
                value: finalTotal,
              },
            };

            // If we have items and the breakdown matches the final total, provide detailed itemization
            if (
              paypalItems.length > 0 &&
              itemsTotalCents + shippingCents - effectiveDiscountCents === finalTotalCents
            ) {
              const breakdown = {
                item_total: {
                  currency_code: curr,
                  value: itemsTotalStr,
                },
              };

              if (shippingCents > 0) {
                breakdown.shipping = {
                  currency_code: curr,
                  value: shippingStr,
                };
              }

              if (effectiveDiscountCents > 0) {
                breakdown.discount = {
                  currency_code: curr,
                  value: discountStr,
                };
              }

              purchaseUnit.items = paypalItems;
              purchaseUnit.amount.breakdown = breakdown;
            }

            return actions.order.create({
              intent: "CAPTURE",
              purchase_units: [purchaseUnit],
            });
          },

          onApprove: async (data, actions) => {
            setIsProcessing(true);
            try {
              const orderData = await actions.order.capture();
              const pu = orderData?.purchase_units?.[0] || {};
              const payer = orderData?.payer || {};
              const shipping = pu.shipping || {};
              const current = cartRef.current;

              // Determine effective customer identity:
              // Prioritize checkout form input > logged-in store account > PayPal payer info
              const effectiveEmail = (
                current.customerDetails?.email ||
                current.user?.email ||
                payer.email_address ||
                ""
              ).trim().toLowerCase();

              const formFullName = `${current.customerDetails?.firstName || ""} ${current.customerDetails?.lastName || ""}`.trim();
              const userFullName =
                current.user?.user_metadata?.full_name ||
                `${current.user?.user_metadata?.first_name || ""} ${current.user?.user_metadata?.last_name || ""}`.trim();
              const payerFullName = `${payer.name?.given_name || ""} ${payer.name?.surname || ""}`.trim();

              const effectiveFirstName = (
                current.customerDetails?.firstName ||
                current.user?.user_metadata?.first_name ||
                (userFullName ? userFullName.split(" ")[0] : "") ||
                payer.name?.given_name ||
                ""
              ).trim();

              const effectiveLastName = (
                current.customerDetails?.lastName ||
                current.user?.user_metadata?.last_name ||
                (userFullName ? userFullName.split(" ").slice(1).join(" ") : "") ||
                payer.name?.surname ||
                ""
              ).trim();

              const effectiveFullName =
                formFullName ||
                userFullName ||
                [effectiveFirstName, effectiveLastName].filter(Boolean).join(" ") ||
                payerFullName ||
                "Valued Customer";

              const effectivePhone =
                current.customerDetails?.phone ||
                payer.phone?.phone_number?.national_number ||
                "";

              const effectiveUserId =
                current.customerDetails?.userId ||
                current.user?.id ||
                null;

              const effectiveShippingAddress = {
                firstName: effectiveFirstName,
                lastName: effectiveLastName,
                address1:
                  current.customerDetails?.address1 ||
                  shipping.address?.address_line_1 ||
                  shipping.address?.street ||
                  "Address provided via PayPal",
                city:
                  current.customerDetails?.city ||
                  shipping.address?.admin_area_2 ||
                  shipping.address?.admin_area_1 ||
                  "City",
                postcode:
                  current.customerDetails?.postcode ||
                  shipping.address?.postal_code ||
                  "N/A",
                country:
                  current.customerDetails?.country ||
                  shipping.address?.country_code ||
                  (current.locale === "en" ? "United Kingdom" : "International"),
                phone: effectivePhone,
              };

              // 1. Save order in Supabase database
              let confirmedOrderId = null;
              try {
                const orderRes = await fetch("/api/checkout/create-order", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    items: current.items,
                    customer: {
                      email: effectiveEmail,
                      phone: effectivePhone,
                      name: effectiveFullName,
                      firstName: effectiveFirstName,
                      lastName: effectiveLastName,
                    },
                    shippingAddress: effectiveShippingAddress,
                    deliveryOption: current.deliveryOption,
                    paymentMethod: "paypal",
                    userId: effectiveUserId,
                    locale: current.locale,
                    currency: current.paypalCurrency,
                    companyEntity: current.paymentConfig.entity,
                  }),
                });
                const orderJson = await orderRes.json();
                if (orderJson.success && orderJson.orderId) {
                  confirmedOrderId = orderJson.orderId;
                }
              } catch (errDb) {
                console.warn("PayPal database order sync notice:", errDb);
              }

              // 2. Finalize payment, update DB status, and trigger confirmation email
              try {
                await fetch("/api/checkout/paypal/capture", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    orderId: confirmedOrderId,
                    paypalOrderId: orderData.id,
                    captureData: pu.payments?.captures?.[0],
                    customer: {
                      email: effectiveEmail,
                      name: effectiveFullName,
                      firstName: effectiveFirstName,
                      lastName: effectiveLastName,
                      phone: effectivePhone,
                      userId: effectiveUserId,
                    },
                    shippingAddress: effectiveShippingAddress,
                    payer,
                    shipping,
                    items: current.items,
                    total: pu.amount?.value || current.total,
                    locale: current.locale,
                    currency: current.paypalCurrency,
                    companyEntity: current.paymentConfig.entity,
                  }),
                });
              } catch (errCapture) {
                console.warn("PayPal capture sync notice:", errCapture);
              }

              // 3. Redirect to thank you page in customer's selected language
              // Parameters are standard UTF-8 URL encoded via URLSearchParams (NO base64 / btoa)
              const params = new URLSearchParams({
                tx: orderData.id || "",
                order_id: confirmedOrderId || "",
                cartIdFORM: current.customCartId || "",
                amtFORM: pu.amount?.value || String(current.total),
                payerEmail: effectiveEmail,
                firstName: effectiveFirstName,
                lastName: effectiveLastName,
                fullName: effectiveFullName,
                street: effectiveShippingAddress.address1 || "",
                zip: effectiveShippingAddress.postcode || "",
                city: effectiveShippingAddress.city || "",
                country: effectiveShippingAddress.country || (current.locale === "en" ? "GB" : "EU"),
              });

              window.location.href = `/${current.locale}/thanks?${params.toString()}`;
            } catch (err) {
              console.error("PayPal capture error:", err);
              setSdkError("Payment could not be captured. Please try again or contact support.");
              setIsProcessing(false);
            }
          },

          onError: (err) => {
            console.error("PayPal button error:", err);
            setSdkError("PayPal encountered an unexpected error. Please try again.");
          },
        })
        .render(containerRef.current);
    } catch (e) {
      console.error("PayPal render error:", e);
    }
  }, [sdkReady, disabled, items]);

  return (
    <div className="w-full space-y-2">
      {isProcessing && (
        <div className="flex items-center justify-center gap-2 p-3 bg-wbk-gold/10 text-wbk-black text-xs font-semibold">
          <IconLoader2 size={16} className="animate-spin text-wbk-gold" />
          <span>{t ? t("checkout.finalizingPayPal", "Finalizing your PayPal payment...") : "Finalizing your PayPal payment..."}</span>
        </div>
      )}

      {sdkError && (
        <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200">
          <IconAlertCircle size={16} className="shrink-0" />
          <span>{sdkError}</span>
        </div>
      )}

      {!sdkReady && !sdkError && (
        <div className="h-12 bg-gray-100 animate-pulse flex items-center justify-center text-xs text-gray-500">
          {t ? t("checkout.loadingPayPal", "Loading PayPal payment options...") : "Loading PayPal payment options..."}
        </div>
      )}

      <div ref={containerRef} className="w-full relative z-0" />
    </div>
  );
}
