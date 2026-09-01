"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import {
  IconShoppingBag,
  IconTrash,
  IconPlus,
  IconMinus,
  IconArrowRight,
  IconTruck,
  IconShieldCheck,
  IconLock,
  IconArrowLeft,
  IconTag,
  IconCheck,
  IconHeadset,
} from "@tabler/icons-react";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    discount,
    vatIncluded,
    total,
    promoCode,
    promoError,
    activePromoDetails,
    applyPromoCode,
    removePromoCode,
    totalItems,
    isMounted,
  } = useCart();

  const [inputCode, setInputCode] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");

  if (!isMounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-wbk-brown font-poppins text-sm">
          Loading your shopping basket...
        </div>
      </div>
    );
  }

  const handleApplyCode = (e) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    const ok = applyPromoCode(inputCode);
    if (ok) setInputCode("");
  };

  return (
    <div className="bg-wbk-white min-h-screen font-poppins pb-24">
      {/* Breadcrumb Header */}
      <div className="bg-[#FBF9F8] border-b border-wbk-lightgrey/60 py-6 sm:py-8">
        <Container size="xl">
          <div className="flex items-center gap-2 text-xs text-wbk-brown mb-2">
            <Link href="/" className="hover:text-wbk-black transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-wbk-black font-medium">Shopping Basket</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <h1 className="font-new-york text-3xl sm:text-4xl text-wbk-black">
              Shopping Basket
            </h1>
            {items.length > 0 && (
              <span className="text-xs text-wbk-brown font-poppins">
                {totalItems} {totalItems === 1 ? "item" : "items"} in your order
              </span>
            )}
          </div>
        </Container>
      </div>

      <Container size="xl" className="pt-8 sm:pt-12">
        {items.length === 0 ? (
          /* Empty Basket View */
          <div className="max-w-xl mx-auto text-center py-20 px-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#F4F2F0] flex items-center justify-center text-wbk-brown mb-6">
              <IconShoppingBag size={36} strokeWidth={1.5} />
            </div>
            <h2 className="font-new-york text-2xl sm:text-3xl text-wbk-black mb-3">
              Your basket is currently empty
            </h2>
            <p className="text-sm text-wbk-brown font-poppins leading-relaxed max-w-md mx-auto mb-8">
              Looks like you haven't added any wall beds or accessories to your basket yet. Explore our space-saving solutions designed for modern living.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/products/beds"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-wbk-black text-white text-xs font-semibold uppercase tracking-[0.14em] hover:bg-wbk-green hover:text-wbk-black transition-all shadow-sm"
              >
                <span>Browse Murphy Beds</span>
                <IconArrowRight size={15} />
              </Link>
              <Link
                href="/products"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 border border-wbk-lightgrey text-wbk-black text-xs font-medium uppercase tracking-[0.14em] hover:border-wbk-black transition-all"
              >
                View All Products
              </Link>
            </div>
          </div>
        ) : (
          /* Populated Basket Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start">
            {/* Left Column: Items list & instructions (8 cols) */}
            <div className="lg:col-span-8 space-y-8">
              {/* Delivery info banner */}
              <div className="p-4 bg-[#F4F2F0] border border-wbk-lightgrey/80 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2.5">
                  <IconTruck size={20} className="text-wbk-green shrink-0" />
                  <span className="text-wbk-black">
                    <strong>Free UK Mainland Delivery</strong> applies to all products in your basket.
                  </span>
                </div>
                <span className="hidden sm:inline-block text-[11px] font-semibold text-wbk-gold uppercase tracking-wider shrink-0">
                  Standard 3–5 Days
                </span>
              </div>

              {/* Items Table / Cards */}
              <div className="border border-wbk-lightgrey divide-y divide-wbk-lightgrey bg-white">
                {/* Table Header (hidden on mobile) */}
                <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3.5 bg-[#FBF9F8] text-[11px] font-semibold uppercase tracking-wider text-wbk-brown">
                  <div className="col-span-6">Product Details</div>
                  <div className="col-span-2 text-center">Unit Price</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>

                {/* Rows */}
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-12 gap-4 sm:items-center hover:bg-[#FBF9F8]/40 transition-colors"
                  >
                    {/* Product info (thumbnail + titles) */}
                    <div className="sm:col-span-6 flex gap-4 items-start">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-[#F4F2F0] border border-wbk-lightgrey/60 shrink-0 p-2 flex items-center justify-center">
                        <Image
                          src={item.image || "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp"}
                          alt={item.title}
                          fill
                          sizes="96px"
                          className="object-contain p-1.5"
                        />
                      </div>

                      <div className="min-w-0 space-y-1">
                        <Link
                          href={item.href || "/products/beds"}
                          className="font-medium text-sm text-wbk-black hover:text-wbk-green transition-colors leading-snug line-clamp-2"
                        >
                          {item.title}
                        </Link>

                        {/* Options pills */}
                        {item.options && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {item.options.size && (
                              <span className="text-[11px] bg-[#F4F2F0] text-wbk-black px-2 py-0.5 border border-wbk-lightgrey/60 font-medium">
                                {item.options.size}
                              </span>
                            )}
                            {item.options.orientation && (
                              <span className="text-[11px] bg-[#F4F2F0] text-wbk-black px-2 py-0.5 border border-wbk-lightgrey/60 font-medium">
                                {item.options.orientation}
                              </span>
                            )}
                            {item.options.type && (
                              <span className="text-[11px] bg-[#F4F2F0] text-wbk-black px-2 py-0.5 border border-wbk-lightgrey/60 font-medium">
                                {item.options.type}
                              </span>
                            )}
                            {item.options.sofaIncluded && (
                              <span className="text-[11px] bg-[#F4F2F0] text-wbk-gold px-2 py-0.5 border border-wbk-lightgrey/60 font-semibold">
                                + Front Sofa Module
                              </span>
                            )}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="inline-flex items-center gap-1 text-xs text-wbk-brown hover:text-red-600 transition-colors pt-2 cursor-pointer"
                        >
                          <IconTrash size={13} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>

                    {/* Unit Price */}
                    <div className="sm:col-span-2 sm:text-center text-xs text-wbk-brown sm:text-wbk-black font-poppins">
                      <span className="sm:hidden font-medium text-wbk-black mr-1">Price:</span>
                      £{Number(item.price || 0).toLocaleString()}
                    </div>

                    {/* Quantity Stepper */}
                    <div className="sm:col-span-2 flex sm:justify-center items-center">
                      <div className="inline-flex items-center border border-wbk-lightgrey bg-white">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-wbk-brown hover:text-wbk-black hover:bg-wbk-lightgrey/30 transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <IconMinus size={13} />
                        </button>
                        <span className="w-9 text-center text-xs font-semibold text-wbk-black">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-wbk-brown hover:text-wbk-black hover:bg-wbk-lightgrey/30 transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <IconPlus size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Line Total */}
                    <div className="sm:col-span-2 sm:text-right font-bold text-sm text-wbk-black font-poppins">
                      <span className="sm:hidden font-normal text-xs text-wbk-brown mr-1">Total:</span>
                      £{(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Actions Row: Continue Shopping & Clear */}
              <div className="flex items-center justify-between pt-2">
                <Link
                  href="/products/beds"
                  className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-wbk-black hover:text-wbk-green transition-colors"
                >
                  <IconArrowLeft size={16} />
                  <span>Continue Shopping</span>
                </Link>

                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs text-wbk-brown hover:text-red-600 transition-colors underline cursor-pointer"
                >
                  Clear entire basket
                </button>
              </div>

              {/* Special Delivery Instructions / Notes */}
              <div className="p-6 bg-[#FBF9F8] border border-wbk-lightgrey space-y-2">
                <label
                  htmlFor="delivery-notes"
                  className="block text-xs font-semibold uppercase tracking-wider text-wbk-black"
                >
                  Special Delivery Instructions or Assembly Notes (Optional)
                </label>
                <p className="text-xs text-wbk-brown">
                  If you live in a flat, need specific delivery access, or have questions for our courier team, please leave a note below:
                </p>
                <textarea
                  id="delivery-notes"
                  rows={3}
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  placeholder="e.g. 2nd floor with elevator, please call 30 minutes before arrival..."
                  className="w-full mt-2 p-3 text-xs border border-wbk-lightgrey bg-white rounded-none focus:outline-none focus:border-wbk-black transition-colors"
                />
              </div>
            </div>

            {/* Right Column: Order Summary (4 cols) */}
            <div className="lg:col-span-4 sticky top-28 space-y-6">
              <div className="bg-[#FBF9F8] border border-wbk-lightgrey p-6 sm:p-8 space-y-6">
                <h2 className="font-new-york text-xl sm:text-2xl text-wbk-black pb-4 border-b border-wbk-lightgrey">
                  Order Summary
                </h2>

                {/* Price Breakdown */}
                <div className="space-y-3 text-xs text-wbk-brown font-poppins">
                  <div className="flex items-center justify-between">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-wbk-black text-sm">
                      £{subtotal.toLocaleString()}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex items-center justify-between text-wbk-green font-medium">
                      <span>Discount ({activePromoDetails?.label})</span>
                      <span>-£{discount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span>UK Mainland Delivery</span>
                      <IconCheck size={14} className="text-wbk-green" />
                    </div>
                    <span className="font-semibold text-wbk-green uppercase text-[11px] tracking-wider">
                      Free
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-wbk-brown/80 pt-1">
                    <span>Includes 20% UK VAT</span>
                    <span>£{vatIncluded.toLocaleString()}</span>
                  </div>
                </div>

                {/* Total */}
                <div className="pt-4 border-t border-wbk-lightgrey flex items-baseline justify-between">
                  <div>
                    <span className="block text-sm font-semibold uppercase tracking-wider text-wbk-black">
                      Total
                    </span>
                    <span className="text-[10px] text-wbk-brown">
                      No hidden fees or customs duties
                    </span>
                  </div>
                  <span className="font-bold text-2xl text-wbk-black font-poppins">
                    £{total.toLocaleString()}
                  </span>
                </div>

                {/* Promo Code Form */}
                <div className="pt-2 border-t border-wbk-lightgrey/60">
                  {promoCode ? (
                    <div className="flex items-center justify-between p-2.5 bg-wbk-green/15 border border-wbk-green/30 text-xs">
                      <div className="flex items-center gap-2">
                        <IconTag size={15} className="text-wbk-green" />
                        <span className="font-semibold text-wbk-black">
                          {promoCode}
                        </span>
                        <span className="text-[11px] text-wbk-brown">
                          (-£{discount})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={removePromoCode}
                        className="text-xs text-red-600 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCode} className="space-y-2">
                      <label
                        htmlFor="promo-input"
                        className="block text-[11px] font-semibold uppercase tracking-wider text-wbk-brown"
                      >
                        Discount Code
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="promo-input"
                          type="text"
                          value={inputCode}
                          onChange={(e) => setInputCode(e.target.value)}
                          placeholder="e.g. WBK10"
                          className="flex-1 px-3 py-2 text-xs border border-wbk-lightgrey bg-white focus:outline-none focus:border-wbk-black uppercase"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-wbk-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-wbk-green hover:text-wbk-black transition-colors cursor-pointer"
                        >
                          Apply
                        </button>
                      </div>
                      {promoError && (
                        <p className="text-[11px] text-red-600">{promoError}</p>
                      )}
                    </form>
                  )}
                </div>

                {/* Checkout Primary Button */}
                <Link
                  href="/checkout"
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-wbk-black text-white hover:bg-wbk-green hover:text-wbk-black text-xs font-semibold uppercase tracking-[0.16em] transition-all shadow-md group cursor-pointer"
                >
                  <IconLock size={16} />
                  <span>Proceed to Checkout</span>
                  <IconArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>

                {/* Accepted Payment Icons */}
                <div className="pt-3 text-center space-y-2 border-t border-wbk-lightgrey/60">
                  <span className="text-[10px] uppercase font-medium tracking-widest text-wbk-brown block">
                    Guaranteed Safe & Secure Checkout
                  </span>
                  <div className="flex items-center justify-center gap-2 text-[11px] font-semibold text-wbk-brown/70 flex-wrap">
                    <span className="px-2 py-1 bg-white border border-wbk-lightgrey text-[10px]">VISA</span>
                    <span className="px-2 py-1 bg-white border border-wbk-lightgrey text-[10px]">Mastercard</span>
                    <span className="px-2 py-1 bg-white border border-wbk-lightgrey text-[10px]">AMEX</span>
                    <span className="px-2 py-1 bg-white border border-wbk-lightgrey text-[10px]">Klarna</span>
                    <span className="px-2 py-1 bg-white border border-wbk-lightgrey text-[10px]">PayPal</span>
                    <span className="px-2 py-1 bg-white border border-wbk-lightgrey text-[10px]">Apple Pay</span>
                  </div>
                </div>
              </div>

              {/* Guarantees & Help card */}
              <div className="p-6 bg-white border border-wbk-lightgrey space-y-4">
                <div className="flex items-start gap-3">
                  <IconShieldCheck size={20} className="text-wbk-gold shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-wbk-black">
                      30-Year Mechanism Guarantee
                    </h4>
                    <p className="text-[11px] text-wbk-brown leading-relaxed mt-0.5">
                      Piston and steel framework engineered to withstand over 10,000 fold cycles.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2 border-t border-wbk-lightgrey/50">
                  <IconHeadset size={20} className="text-wbk-green shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-wbk-black">
                      UK Support & Advice
                    </h4>
                    <p className="text-[11px] text-wbk-brown leading-relaxed mt-0.5">
                      Need help checking room dimensions? Call our technical specialists free at{" "}
                      <strong className="text-wbk-black">0800 028 8940</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
