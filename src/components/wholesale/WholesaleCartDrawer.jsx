"use client";

import Link from "next/link";
import Image from "next/image";
import { IconX, IconTrash, IconPlus, IconMinus, IconBox, IconArrowRight, IconShoppingCart } from "@tabler/icons-react";
import { useWholesale } from "@/context/WholesaleContext";
import { useLocale } from "@/context/LocaleContext";
import { formatWholesaleMoney } from "@/lib/wholesale-constants";

export function WholesaleCartDrawer() {
  const {
    wholesaleItems,
    wholesaleSubtotal,
    wholesaleCurrency,
    isWholesaleCartOpen,
    setIsWholesaleCartOpen,
    updateWholesaleQty,
    removeWholesaleItem,
    partner,
  } = useWholesale();
  const { localizedHref } = useLocale();

  if (!isWholesaleCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs font-poppins">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl border-l border-wbk-lightgrey">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-wbk-lightgrey bg-[#FAF8F5]">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-wbk-black flex items-center gap-2">
              <IconShoppingCart size={17} className="text-wbk-green" />
              <span>Wholesale B2B Cart</span>
            </h2>
            <p className="text-[11px] text-wbk-brown mt-0.5">
              Separate from retail cart • All prices <strong>Net (Excl. VAT)</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsWholesaleCartOpen(false)}
            className="p-1.5 text-wbk-brown hover:text-wbk-black cursor-pointer"
            aria-label="Close wholesale cart"
          >
            <IconX size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {wholesaleItems.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <IconBox size={32} className="mx-auto text-wbk-brown/40" />
              <p className="text-sm font-semibold text-wbk-black">Your wholesale cart is empty</p>
              <p className="text-xs text-wbk-brown">
                Add single units or full containers from the wholesale catalog.
              </p>
            </div>
          ) : (
            wholesaleItems.map((item) => {
              const isContainer = item.options?.orderUnit === "container";
              const pcsPerContainer = item.options?.unitsPerContainer || 0;
              const lineTotal = Math.round(Number(item.price || 0) * Number(item.quantity || 1) * 100) / 100;
              return (
                <div
                  key={item.lineKey}
                  className="flex gap-3 pb-4 border-b border-wbk-lightgrey/60"
                >
                  <div className="relative w-16 h-16 bg-[#F8F7F5] border border-wbk-lightgrey shrink-0 overflow-hidden">
                    {item.image ? (
                      <Image src={item.image} alt={item.title} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-wbk-brown">
                        WBK
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs font-semibold text-wbk-black leading-snug line-clamp-2">
                        {item.title}
                      </h3>
                      <button
                        type="button"
                        onClick={() => removeWholesaleItem(item.lineKey)}
                        className="text-wbk-brown hover:text-red-600 p-0.5 cursor-pointer shrink-0"
                        title="Remove item"
                      >
                        <IconTrash size={14} />
                      </button>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      {isContainer ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                          <IconBox size={11} />
                          Full Container ({pcsPerContainer} pcs / container)
                        </span>
                      ) : (
                        <span className="inline-block px-1.5 py-0.5 text-[10px] font-semibold bg-gray-100 text-gray-700">
                          Single Unit
                        </span>
                      )}
                      <span className="text-[10px] text-emerald-800 font-semibold">
                        Excl. VAT (Net)
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="inline-flex items-center border border-wbk-lightgrey">
                        <button
                          type="button"
                          onClick={() => updateWholesaleQty(item.lineKey, item.quantity - 1)}
                          className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                        >
                          <IconMinus size={12} />
                        </button>
                        <span className="px-2.5 py-1 text-xs font-mono font-semibold">
                          {item.quantity} {isContainer ? "ctn" : "pcs"}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateWholesaleQty(item.lineKey, item.quantity + 1)}
                          className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                        >
                          <IconPlus size={12} />
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-wbk-black">
                          {formatWholesaleMoney(lineTotal, item.currency)}
                        </div>
                        <div className="text-[10px] text-wbk-brown">
                          {isContainer
                            ? `${item.quantity * pcsPerContainer} pcs total • excl. VAT`
                            : `${formatWholesaleMoney(item.price, item.currency)} / pc • excl. VAT`}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {wholesaleItems.length > 0 && (
          <div className="p-5 border-t border-wbk-lightgrey bg-[#FAF8F5] space-y-3">
            {partner?.roleKey && (
              <div className="text-[11px] text-emerald-900 bg-emerald-50 border border-emerald-200 px-3 py-1.5">
                Partner tier: <strong className="font-mono uppercase">{partner.roleKey}</strong>
                {partner.discountPercent > 0 ? ` (-${partner.discountPercent}% applied)` : ""}
              </div>
            )}

            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between text-wbk-brown">
                <span>VAT</span>
                <span className="font-semibold text-wbk-black">0% — Net Price (Excl. VAT)</span>
              </div>
              <div className="flex items-center justify-between text-wbk-brown">
                <span>Shipping / Freight</span>
                <span className="font-medium text-wbk-black">Arranged separately</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-wbk-lightgrey text-sm font-bold text-wbk-black">
                <span>Net Subtotal (Excl. VAT)</span>
                <span>{formatWholesaleMoney(wholesaleSubtotal, wholesaleCurrency)}</span>
              </div>
            </div>

            <Link
              href={localizedHref("/wholesale/checkout")}
              onClick={() => setIsWholesaleCartOpen(false)}
              className="w-full py-3 px-4 bg-wbk-black hover:bg-wbk-green text-white text-xs font-semibold uppercase tracking-widest rounded-full flex items-center justify-center gap-2 transition-colors"
            >
              <span>Proceed to Wholesale Checkout</span>
              <IconArrowRight size={15} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
