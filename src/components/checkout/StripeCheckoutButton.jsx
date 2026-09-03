"use client";

import { useState } from "react";
import { IconLock, IconAlertCircle, IconLoader2 } from "@tabler/icons-react";
import { useCart } from "@/context/CartContext";

export function StripeCheckoutButton({ className = "", label = "Pay with Card / Stripe", disabled = false }) {
  const {
    items,
    subtotal,
    discount,
    shipping,
    total,
    customCartId,
    selectedDeliveryDetails,
  } = useCart();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleStripeCheckout = async () => {
    if (items.length === 0) {
      setErrorMessage("Your basket is empty.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
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
            currency: "gbp",
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
            currency: "gbp",
            product_data: {
              name: selectedDeliveryDetails?.label || "Delivery",
              description: selectedDeliveryDetails?.message || "Standard UK Mainland Delivery",
            },
            unit_amount: Math.round(shipping * 100),
          },
          quantity: 1,
        });
      }

      const successUrl = `${window.location.origin}/thanks?session_id={CHECKOUT_SESSION_ID}&cart_id=${encodeURIComponent(customCartId)}`;
      const cancelUrl = `${window.location.origin}/cart`;

      const response = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          line_items: lineItems,
          success_url: successUrl,
          cancel_url: cancelUrl,
          cartId: customCartId,
          collect_phone: true,
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
