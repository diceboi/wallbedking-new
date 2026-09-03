"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  IconX,
  IconShoppingBag,
  IconTrash,
  IconPlus,
  IconMinus,
  IconArrowRight,
  IconTruck,
  IconShieldCheck,
  IconLock,
} from "@tabler/icons-react";
import { useCart } from "@/context/CartContext";
import { useLocale } from "@/context/LocaleContext";

export function CartDrawer() {
  const {
    items,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
    totalItems,
    subtotal,
    isMounted,
  } = useCart();
  const { t, formatPrice, localizedHref } = useLocale();

  // Prevent background scrolling when cart drawer is open
  useEffect(() => {
    if (isCartOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isCartOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isCartOpen) {
        closeCart();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartOpen, closeCart]);

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Dimmed backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeCart}
            className="fixed inset-0 bg-wbk-black/60 backdrop-blur-xs cursor-pointer"
            aria-hidden="true"
          />

          {/* Slide-in panel */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
            className="relative w-full max-w-md h-full bg-wbk-white shadow-2xl flex flex-col z-10 font-poppins border-l border-wbk-lightgrey overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-wbk-lightgrey/70 bg-[#FBF9F8]">
              <div className="flex items-center gap-2.5">
                <IconShoppingBag size={20} className="text-wbk-gold" />
                <h2 className="font-new-york text-xl text-wbk-black">
                  {t("cart.title", "Shopping Cart")}
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-wbk-lightgrey/60 text-wbk-black">
                  {totalItems}
                </span>
              </div>
              <button
                type="button"
                onClick={closeCart}
                aria-label="Close cart"
                className="w-8 h-8 flex items-center justify-center rounded-full text-wbk-brown hover:text-wbk-black hover:bg-wbk-lightgrey/40 transition-colors cursor-pointer"
              >
                <IconX size={18} />
              </button>
            </div>

            {/* Free UK Delivery Alert */}
            <div className="px-6 py-2.5 bg-[#F4F2F0] border-b border-wbk-lightgrey/50 flex items-center gap-2 text-xs text-wbk-brown">
              <IconTruck size={16} className="text-wbk-green shrink-0" />
              <span>
                <strong className="text-wbk-black font-semibold">
                  {t("common.freeDelivery", "Free Mainland Delivery")}
                </strong>
              </span>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar divide-y divide-wbk-lightgrey/40">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4">
                  <div className="w-16 h-16 rounded-full bg-[#F4F2F0] flex items-center justify-center text-wbk-brown mb-4">
                    <IconShoppingBag size={28} strokeWidth={1.5} />
                  </div>
                  <h3 className="font-new-york text-xl text-wbk-black mb-1">
                    {t("cart.empty", "Your cart is empty")}
                  </h3>
                  <p className="text-xs text-wbk-brown max-w-xs leading-relaxed mb-6">
                    {t(
                      "cart.emptyDesc",
                      "Explore our precision-engineered wall beds, modular sofas, and orthopedic mattresses.",
                    )}
                  </p>
                  <Link
                    href={localizedHref("/products/beds")}
                    onClick={closeCart}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-wbk-black text-white text-xs font-medium uppercase tracking-[0.14em] hover:bg-wbk-green hover:text-wbk-black transition-colors rounded-full shadow-sm"
                  >
                    <span>{t("cart.discoverBeds", "Discover Murphy Beds")}</span>
                    <IconArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="pt-4 first:pt-0 flex gap-4">
                    {/* Thumbnail */}
                    <div className="relative w-20 h-20 shrink-0 bg-[#FBF9F8] border border-wbk-lightgrey/50 overflow-hidden flex items-center justify-center p-1.5">
                      <Image
                        src={item.image || "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp"}
                        alt={item.title}
                        fill
                        sizes="80px"
                        className="object-contain p-1"
                      />
                    </div>

                    {/* Info & Quantity */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={item.href || "/products/beds"}
                            onClick={closeCart}
                            className="text-xs font-medium text-wbk-black hover:text-wbk-green transition-colors leading-snug line-clamp-2"
                          >
                            {item.title}
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            aria-label={`Remove ${item.title}`}
                            className="text-wbk-brown hover:text-red-600 transition-colors p-1 shrink-0 cursor-pointer"
                          >
                            <IconTrash size={14} />
                          </button>
                        </div>

                        {/* Options pills */}
                        {item.options && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.options.size && (
                              <span className="text-[10px] bg-[#F4F2F0] text-wbk-black font-medium px-1.5 py-0.5 border border-wbk-lightgrey/60">
                                {item.options.size}
                              </span>
                            )}
                            {item.options.orientation && (
                              <span className="text-[10px] bg-[#F4F2F0] text-wbk-black font-medium px-1.5 py-0.5 border border-wbk-lightgrey/60">
                                {item.options.orientation}
                              </span>
                            )}
                            {item.options.sofaIncluded && (
                              <span className="text-[10px] bg-[#F4F2F0] text-wbk-gold font-semibold px-1.5 py-0.5 border border-wbk-lightgrey/60">
                                + Front Sofa
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Quantity & Unit Price */}
                      <div className="flex items-center justify-between mt-3 pt-1">
                        {/* Stepper */}
                        <div className="inline-flex items-center border border-wbk-lightgrey bg-white">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-wbk-brown hover:text-wbk-black hover:bg-wbk-lightgrey/30 transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <IconMinus size={12} />
                          </button>
                          <span className="w-8 text-center text-xs font-semibold text-wbk-black">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-wbk-brown hover:text-wbk-black hover:bg-wbk-lightgrey/30 transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <IconPlus size={12} />
                          </button>
                        </div>

                        {/* Line Total */}
                        <div className="text-right">
                          <span className="text-xs font-bold text-wbk-black font-poppins">
                            {formatPrice((Number(item.price) || 0) * (Number(item.quantity) || 1))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer / Checkout Actions */}
            {items.length > 0 && (
              <div className="p-6 border-t border-wbk-lightgrey/70 bg-[#FBF9F8] space-y-4">
                {/* Subtotal summary */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-wbk-brown font-medium">
                    {t("cart.subtotal", "Subtotal")}
                  </span>
                  <span className="text-lg font-bold text-wbk-black font-poppins">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-wbk-brown pb-1">
                  <span>{t("cart.shipping", "Shipping")}</span>
                  <span className="text-wbk-green font-semibold">
                    {t("common.freeDelivery", "Free Mainland Delivery")}
                  </span>
                </div>

                {/* Checkout CTA Buttons */}
                <div className="space-y-2 pt-1">
                  <Link
                    href={localizedHref("/checkout")}
                    onClick={closeCart}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-wbk-black text-white hover:bg-wbk-green hover:text-wbk-black text-xs font-semibold uppercase tracking-[0.16em] transition-colors duration-200 rounded-full shadow-md group cursor-pointer"
                  >
                    <IconLock size={15} />
                    <span>{t("cart.proceedToCheckout", "Proceed to Checkout")}</span>
                    <IconArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    href={localizedHref("/cart")}
                    onClick={closeCart}
                    className="w-full flex items-center justify-center py-2.5 px-4 border border-wbk-lightgrey bg-white text-wbk-black hover:border-wbk-black text-xs font-medium uppercase tracking-[0.14em] transition-colors rounded-full cursor-pointer"
                  >
                    {t("cart.viewBasket", "View Shopping Basket")}
                  </Link>
                </div>

                {/* Trust Badges in Drawer Footer */}
                <div className="pt-2 flex items-center justify-center gap-4 text-[10px] text-wbk-brown border-t border-wbk-lightgrey/40">
                  <div className="flex items-center gap-1">
                    <IconShieldCheck size={13} className="text-wbk-gold" />
                    <span>30-Yr Warranty</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <IconLock size={12} className="text-wbk-green" />
                    <span>SSL Encrypted</span>
                  </div>
                  <span>•</span>
                  <span>Klarna Available</span>
                </div>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
