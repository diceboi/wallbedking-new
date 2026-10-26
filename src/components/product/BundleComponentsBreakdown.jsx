"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconCheck,
  IconPlus,
  IconShieldCheck,
  IconPackage,
  IconSparkles,
  IconInfoCircle,
  IconExternalLink,
} from "@tabler/icons-react";
import { useLocale } from "@/context/LocaleContext";

export function BundleComponentsBreakdown({ bundle, selectedCurrency = "GBP" }) {
  const { t, formatPrice, locale } = useLocale();

  if (!bundle || !bundle.is_bundle || !Array.isArray(bundle.items)) {
    return null;
  }

  const curr = selectedCurrency.toUpperCase();
  const currSymbol = curr === "USD" ? "$" : curr === "EUR" ? "€" : "£";

  const subtotal =
    curr === "USD"
      ? bundle.subtotal_usd || bundle.calculated_subtotal_usd
      : curr === "EUR"
      ? bundle.subtotal_euro || bundle.calculated_subtotal_euro
      : bundle.subtotal_gbp || bundle.calculated_subtotal_gbp;

  const finalPrice =
    curr === "USD"
      ? bundle.price_usd || bundle.calculated_price_usd
      : curr === "EUR"
      ? bundle.price_euro || bundle.calculated_price_euro
      : bundle.price_gbp || bundle.calculated_price_gbp;

  const savings = Math.max(0, subtotal - finalPrice);
  const discountPercent = bundle.discount_percent || 10;

  return (
    <div className="space-y-4 my-6 p-5 sm:p-6 rounded-2xl bg-linear-to-b from-wbk-lightgrey/30 to-white border border-wbk-lightgrey/80 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-wbk-lightgrey/60">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-wbk-gold block">
            {t("bundle.prePairedSet", "Pre-Paired Set • Guaranteed Compatibility")}
          </span>
          <h3 className="text-base sm:text-lg font-bold text-wbk-black flex items-center gap-2">
            <span>{t("bundle.whatsIncluded", "What's in this Package?")}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-wbk-gold/15 text-wbk-gold font-semibold">
              Save {discountPercent}%
            </span>
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto font-medium">
          <IconShieldCheck size={16} className="text-emerald-600" />
          <span>{t("bundle.guaranteedFit", "100% Factory Match Guaranteed")}</span>
        </div>
      </div>

      {/* Components Grid */}
      <div className="space-y-3">
        {bundle.items.map((it, idx) => {
          const prod = it.product;
          if (!prod) return null;

          const itemPrice =
            curr === "USD"
              ? prod.price_usd || prod.numericPrice
              : curr === "EUR"
              ? prod.price_euro || prod.numericPrice
              : prod.price_gbp || prod.numericPrice;

          return (
            <React.Fragment key={it.product_id || idx}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 p-3.5 rounded-xl bg-white border border-wbk-lightgrey/70 shadow-2xs hover:border-wbk-gold/50 transition-colors">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative w-16 h-16 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                    {prod.image ? (
                      <Image
                        src={prod.image}
                        alt={prod.name || prod.title}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <IconPackage size={24} className="m-auto text-gray-300" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-gray-100 text-gray-600">
                        {idx === 0 ? "Component 1" : "Component 2"}
                      </span>
                      <span className="text-[10px] font-semibold text-wbk-gold uppercase">
                        {prod.parent_category || "Wall Bed King"}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-wbk-black truncate mt-0.5">
                      {prod.name || prod.title}
                    </h4>

                    <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                      <span>Qty: <strong>{it.quantity || 1}x</strong></span>
                      <span>•</span>
                      <span className="text-emerald-700 font-medium flex items-center gap-1">
                        <IconCheck size={12} />
                        In Stock
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 shrink-0">
                  <span className="text-[10px] text-gray-400">Regular retail price:</span>
                  <span className="text-sm font-bold text-wbk-black font-mono">
                    {currSymbol}{Number(itemPrice).toLocaleString("en-GB", { minimumFractionDigits: 0 })}
                  </span>
                </div>
              </div>

              {idx < bundle.items.length - 1 && (
                <div className="flex items-center justify-center -my-1">
                  <div className="w-6 h-6 rounded-full bg-wbk-gold text-wbk-black flex items-center justify-center shadow-xs">
                    <IconPlus size={14} strokeWidth={2.5} />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Package Savings Breakdown Box */}
      <div className="p-4 rounded-xl bg-white border border-wbk-gold/40 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Individual Retail Value (Combined):</span>
          <span className="line-through font-mono">
            {currSymbol}{Number(subtotal).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs font-semibold text-emerald-700">
          <span>Package Bundle Discount (-{discountPercent}%):</span>
          <span className="font-mono">
            -{currSymbol}{Number(savings).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-wbk-black block">Complete Package Price:</span>
            <span className="text-[10px] text-wbk-brown">Including mechanism, slatted base & cabinet</span>
          </div>
          <div className="text-right">
            <span className="text-xl sm:text-2xl font-bold text-wbk-black font-mono">
              {currSymbol}{Number(finalPrice).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Value Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-[11px] text-wbk-black">
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/80 border border-wbk-lightgrey/60">
          <IconCheck size={16} className="text-wbk-gold shrink-0" />
          <span>Guaranteed dimensional fit</span>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/80 border border-wbk-lightgrey/60">
          <IconShieldCheck size={16} className="text-wbk-gold shrink-0" />
          <span>5-Year Manufacturer Warranty</span>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/80 border border-wbk-lightgrey/60">
          <IconSparkles size={16} className="text-wbk-gold shrink-0" />
          <span>Save {currSymbol}{savings} on this package</span>
        </div>
      </div>
    </div>
  );
}
