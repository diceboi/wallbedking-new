"use client";

import { useState } from "react";
import { IconLock, IconAlertCircle, IconLoader2 } from "@tabler/icons-react";
import { useCart } from "@/context/CartContext";
import { useLocale } from "@/context/LocaleContext";

export function StripeCheckoutButton({
  className = "",
  label = "Pay with Card / Stripe",
  disabled = false,
  customerDetails = null,
  onBeforeCheckout = null,
}) {
  const { locale, market } = useLocale();
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

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleStripeCheckout = async () => {
    if (items.length === 0) {
      setErrorMessage("Your cart is empty.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    // Execute optional pre-checkout hook (e.g., save address to account)
    if (typeof onBeforeCheckout === "function") {
      try {
        await onBeforeCheckout();
      } catch (err) {
        console.warn("Stripe pre-checkout hook error:", err);
      }
    }

    try {
      let activeOrderId = null;
      const currentCurrency = (market?.currency || (locale === "en" ? "GBP" : "EUR")).toUpperCase();
      const currentCurrencyLower = currentCurrency.toLowerCase();
      const companyEntity = locale === "en" ? "UK" : "INTERNATIONAL";

      // 1. If customer details are provided, pre-create the order in database
      if (customerDetails?.email && customerDetails?.address1) {
        try {
          const orderRes = await fetch("/api/checkout/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              items,
              customer: {
                email: customerDetails.email,
                phone: customerDetails.phone,
                name: `${customerDetails.firstName || ""} ${customerDetails.lastName || ""}`.trim(),
              },
              shippingAddress: customerDetails,
              deliveryOption,
              promoCode,
              paymentMethod: "stripe",
              userId: customerDetails?.userId || null,
              locale,
              currency: currentCurrency,
              companyEntity,
            }),
          });
          const orderData = await orderRes.json();
          if (orderData.success && orderData.orderId) {
            activeOrderId = orderData.orderId;
          }
        } catch (e) {
          console.warn("Pre-order creation notice:", e);
        }
      }

      // Calculate discount multiplier if promo applied
      const discountMultiplier = subtotal > 0 ? Math.max(0, (subtotal - discount) / subtotal) : 1;

      // Build line_items matching Wall Bed King standard
      const lineItems = items.map((item) => {
        const itemPrice = Number(item.price) || 0;
        const discountedPrice = Math.round(itemPrice * discountMultiplier * 100) / 100;
        const unitAmountPence = Math.round(discountedPrice * 100);

        const optionsDesc = [
          item.options?.size,
          item.options?.orientation,
          item.options?.type,
          item.options?.sofaIncluded ? "Morphy Sofa Included" : null,
        ]
          .filter(Boolean)
          .join(" | ");

        return {
          price_data: {
            currency: currentCurrencyLower,
            product_data: {
              name: item.title,
              description: optionsDesc || "Wall Bed King Product",
            },
            unit_amount: unitAmountPence,
          },
          quantity: Number(item.quantity) || 1,
        };
      });

      // Append delivery cost if > 0
      if (shipping > 0) {
        lineItems.push({
          price_data: {
            currency: currentCurrencyLower,
            product_data: {
              name: selectedDeliveryDetails?.label || "Delivery",
              description: selectedDeliveryDetails?.message || (locale === "en" ? "Standard UK Mainland Delivery" : "Standard Delivery"),
            },
            unit_amount: Math.round(shipping * 100),
          },
          quantity: 1,
        });
      }

      const orderRef = activeOrderId || customCartId;
      const successUrl = `${window.location.origin}/${locale}/thanks?session_id={CHECKOUT_SESSION_ID}&order_id=${encodeURIComponent(orderRef)}&cart_id=${encodeURIComponent(customCartId)}`;
      const cancelUrl = `${window.location.origin}/${locale}/cart`;

      const response = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          line_items: lineItems,
          success_url: successUrl,
          cancel_url: cancelUrl,
          cartId: customCartId,
          orderId: activeOrderId,
          locale,
          currency: currentCurrency,
          collect_phone: true,
          customerEmail: customerDetails?.email || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || `Payment server error (Status: ${response.status})`);
      }

      if (data && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Unable to create Stripe checkout session. Please try again.");
      }
    } catch (err) {
      console.error("Stripe checkout error:", err);
      setErrorMessage(
        err.message || "There was a problem initiating card payment. Please check your connection and try again."
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-2">
      <button
        type="button"
        onClick={handleStripeCheckout}
        disabled={disabled || isLoading || items.length === 0}
        className={`w-full relative flex items-center justify-center gap-3 py-4 px-6 bg-[#635BFF] hover:bg-[#5349e4] disabled:bg-gray-400 text-white font-semibold text-xs uppercase tracking-[0.16em] transition-all rounded-full shadow-md cursor-pointer disabled:cursor-not-allowed group ${className}`}
      >
        {isLoading ? (
          <>
            <IconLoader2 size={18} className="animate-spin" />
            <span>Connecting to Secure Stripe Checkout...</span>
          </>
        ) : (
          <>
            <IconLock size={16} />
            <span>{label}</span>
            <span className="font-mono text-[11px] bg-white/20 px-2 py-0.5 rounded-full tracking-normal">
              £{total.toLocaleString()}
            </span>
          </>
        )}
      </button>

      {errorMessage && (
        <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200">
          <IconAlertCircle size={16} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
