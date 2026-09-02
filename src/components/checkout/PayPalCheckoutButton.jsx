"use client";

import { useEffect, useRef, useState } from "react";
import { IconLoader2, IconAlertCircle } from "@tabler/icons-react";
import { useCart } from "@/context/CartContext";

const PAYPAL_CLIENT_ID = "AatfEC-B5arwZNWs2BbzxxYC0P1Z9jGIXw0HFXQ0f-57xEsm2W0y_4GGl_o0wF_vlliq2vE5hzRkhvrL";

export function PayPalCheckoutButton({ disabled = false }) {
  const {
    items,
    subtotal,
    discount,
    shipping,
    total,
    customCartId,
    deliveryOption,
    selectedDeliveryDetails,
  } = useCart();

  const containerRef = useRef(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Keep references to latest cart values inside PayPal callbacks
  const cartRef = useRef({ items, subtotal, discount, shipping, total, customCartId, deliveryOption, selectedDeliveryDetails });
  useEffect(() => {
    cartRef.current = { items, subtotal, discount, shipping, total, customCartId, deliveryOption, selectedDeliveryDetails };
  }, [items, subtotal, discount, shipping, total, customCartId, deliveryOption, selectedDeliveryDetails]);

  // Load PayPal SDK Script
  useEffect(() => {
    const scriptId = "wbk-paypal-sdk";

    if (window.paypal) {
      setSdkReady(true);
      return;
    }

    let script = document.getElementById(scriptId);
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=GBP&components=buttons&enable-funding=card&disable-funding=sofort`;
      script.async = true;
      script.onload = () => setSdkReady(true);
      script.onerror = () => setSdkError("Failed to load PayPal SDK. Please refresh or try another payment method.");
      document.body.appendChild(script);
    } else {
      script.addEventListener("load", () => setSdkReady(true));
      script.addEventListener("error", () => setSdkError("Failed to load PayPal SDK."));
    }
  }, []);

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

          createOrder: (data, actions) => {
            const current = cartRef.current;
            const finalTotal = Number(current.total).toFixed(2);
            const discountMult = current.subtotal > 0 ? Math.max(0, (current.subtotal - current.discount) / current.subtotal) : 1;

            const paypalItems = current.items.map((it) => {
              const unitPrice = (Math.round(Number(it.price) * discountMult * 100) / 100).toFixed(2);
              const opt = [it.options?.size, it.options?.orientation].filter(Boolean).join(" ");
              return {
                name: String(it.title || "Product").slice(0, 120),
                description: String(opt || "Standard").slice(0, 120),
                sku: String(it.rawId || it.productId || it.id).slice(0, 60),
                unit_amount: {
                  currency_code: "GBP",
                  value: unitPrice,
                },
                tax: { currency_code: "GBP", value: "0.00" },
                quantity: String(it.quantity || 1),
                category: "PHYSICAL_GOODS",
              };
            });

            if (current.shipping > 0) {
              paypalItems.push({
                name: String(current.selectedDeliveryDetails?.label || "Delivery").slice(0, 120),
                description: "Delivery option",
                sku: `DELIVERY_${current.deliveryOption.toUpperCase()}`,
                unit_amount: {
                  currency_code: "GBP",
                  value: Number(current.shipping).toFixed(2),
                },
                tax: { currency_code: "GBP", value: "0.00" },
                quantity: "1",
                category: "PHYSICAL_GOODS",
              });
            }

            return actions.order.create({
              intent: "CAPTURE",
              purchase_units: [
                {
                  description: `WBK_order_${finalTotal}_${Date.now()}`,
                  custom_id: current.customCartId,
                  soft_descriptor: "WBK UK",
                  amount: {
                    currency_code: "GBP",
                    value: finalTotal,
                  },
                },
              ],
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

              // Optional: notify legacy email handler or logging
              try {
                await fetch("https://www.wallbedking.co.uk/inc/email_en_uk_v5.php", {
                  method: "POST",
                  mode: "no-cors",
                  headers: { "Content-Type": "application/x-www-form-urlencoded" },
                  body: new URLSearchParams({
                    address_name: shipping.name?.full_name || "",
                    address_street: shipping.address?.address_line_1 || "",
                    address_city: shipping.address?.admin_area_2 || "",
                    address_country: shipping.address?.country_code || "GB",
                    address_zip: shipping.address?.postal_code || "",
                    contact_phone: payer.phone?.phone_number?.national_number || "",
                    first_name: payer.name?.given_name || "",
                    last_name: payer.name?.surname || "",
                    payment_status: pu.payments?.captures?.[0]?.status || "COMPLETED",
                    cart_id: current.customCartId,
                    mc_gross: pu.amount?.value || finalTotal,
                    mc_currency: "GBP",
                    txn_id: orderData.id,
                    payer_email: payer.email_address || "",
                  }).toString(),
                });
              } catch (e) {
                console.warn("Background notification notice:", e);
              }

              // Redirect to thank you page
              const params = new URLSearchParams({
                tx: orderData.id || "",
                cartIdFORM: current.customCartId || "",
                amtFORM: pu.amount?.value || String(current.total),
                payerEmail: btoa(payer.email_address || ""),
                firstName: btoa(payer.name?.given_name || ""),
                lastName: btoa(payer.name?.surname || ""),
                street: shipping.address?.address_line_1 || "",
                zip: shipping.address?.postal_code || "",
                city: shipping.address?.admin_area_2 || "",
                country: shipping.address?.country_code || "GB",
              });

              window.location.href = `/thanks?${params.toString()}`;
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
          <span>Finalizing your PayPal payment...</span>
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
          Loading PayPal payment options...
        </div>
      )}

      <div ref={containerRef} className="w-full relative z-0" />
    </div>
  );
}
