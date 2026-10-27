"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconCheck,
  IconShieldCheck,
  IconPackage,
  IconArrowUpRight,
} from "@tabler/icons-react";
import { useLocale } from "@/context/LocaleContext";
import { formatPrice } from "@/lib/i18n";
import { getLocalizedProductName, getStorefrontProductUrl } from "@/lib/products";

const BUNDLE_I18N = {
  en: {
    includedTitle: "Package Contents",
    saveLabel: "Bundle Savings",
    individualTotal: "Individual value:",
    packageSavings: "Package saving:",
    guaranteedCompatibility: "100% Guaranteed dimensional fit",
    fiveYearWarranty: "5-Year Manufacturer Warranty",
    componentBed: "Wall Bed",
    componentCabinet: "Cabinet Enclosure",
    qty: "Qty",
  },
  us: {
    includedTitle: "Package Contents",
    saveLabel: "Bundle Savings",
    individualTotal: "Individual value:",
    packageSavings: "Package saving:",
    guaranteedCompatibility: "100% Guaranteed dimensional fit",
    fiveYearWarranty: "5-Year Manufacturer Warranty",
    componentBed: "Murphy Bed",
    componentCabinet: "Cabinet Enclosure",
    qty: "Qty",
  },
  es: {
    includedTitle: "Contenido del Pack",
    saveLabel: "Ahorro en Pack",
    individualTotal: "Valor por separado:",
    packageSavings: "Ahorro del pack:",
    guaranteedCompatibility: "100% Compatibilidad y encaje garantizados",
    fiveYearWarranty: "5 años de garantía",
    componentBed: "Cama Abatible",
    componentCabinet: "Armario a Medida",
    qty: "Cant.",
  },
  de: {
    includedTitle: "Lieferumfang des Komplett-Sets",
    saveLabel: "Set-Rabatt",
    individualTotal: "Einzelwert zusammen:",
    packageSavings: "Set-Ersparnis:",
    guaranteedCompatibility: "100% Passgenauigkeit garantiert",
    fiveYearWarranty: "5 Jahre Herstellergarantie",
    componentBed: "Schrankbett",
    componentCabinet: "Passendes Schranksystem",
    qty: "Menge",
  },
  fr: {
    includedTitle: "Contenu du Pack",
    saveLabel: "Remise Pack",
    individualTotal: "Valeur individuelle :",
    packageSavings: "Économie du pack :",
    guaranteedCompatibility: "Compatibilité dimensionnelle 100% garantie",
    fiveYearWarranty: "Garantie 5 ans",
    componentBed: "Lit Escamotable",
    componentCabinet: "Armoire Assortie",
    qty: "Qté",
  },
  it: {
    includedTitle: "Contenuto del Set Completo",
    saveLabel: "Sconto Set",
    individualTotal: "Valore separato:",
    packageSavings: "Risparmio del set:",
    guaranteedCompatibility: "Compatibilità dimensionale garantita al 100%",
    fiveYearWarranty: "5 anni di garanzia",
    componentBed: "Letto a Scomparsa",
    componentCabinet: "Armadio Coordinato",
    qty: "Qtà",
  },
  por: {
    includedTitle: "Conteúdo do Pacote",
    saveLabel: "Poupança do Pacote",
    individualTotal: "Valor individual:",
    packageSavings: "Poupança do pacote:",
    guaranteedCompatibility: "Compatibilidade dimensional 100% garantida",
    fiveYearWarranty: "5 anos de garantia",
    componentBed: "Cama Rebatível",
    componentCabinet: "Armário a Medida",
    qty: "Qtd",
  },
};

export function BundleComponentsBreakdown({ bundle, selectedCurrency = "GBP" }) {
  const { t, locale } = useLocale();

  if (!bundle || !bundle.is_bundle || !Array.isArray(bundle.items) || bundle.items.length === 0) {
    return null;
  }

  const dict = BUNDLE_I18N[locale] || BUNDLE_I18N.en;
  const curr = selectedCurrency.toUpperCase();

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

  const savings = Math.max(0, (Number(subtotal) || 0) - (Number(finalPrice) || 0));
  const discountPercent =
    bundle.discount_percent ||
    (subtotal > 0 && savings > 0 ? Math.round((savings / subtotal) * 100) : 10);

  return (
    <div className="space-y-2.5 my-3 font-poppins">
      {/* Clean Section Header matching option labels */}
      <div className="flex items-center justify-between">
        <label className="block text-[10px] uppercase tracking-wider font-semibold text-wbk-brown">
          {dict.includedTitle} ({bundle.items.length})
        </label>
        <span className="inline-flex items-center text-[10px] font-semibold tracking-wider uppercase text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
          -{discountPercent}% {dict.saveLabel}
        </span>
      </div>

      {/* Clean Components Container */}
      <div className="border border-wbk-black/20 rounded-xl bg-white/70 backdrop-blur-xs overflow-hidden shadow-2xs divide-y divide-wbk-lightgrey/50">
        {bundle.items.map((it, idx) => {
          const prod = it.product;
          if (!prod) return null;

          const localizedName = getLocalizedProductName(prod, locale) || prod.name || prod.title;
          const itemPrice =
            curr === "USD"
              ? prod.price_usd || prod.numericPrice
              : curr === "EUR"
              ? prod.price_euro || prod.numericPrice
              : prod.price_gbp || prod.numericPrice;

          const productUrl = getStorefrontProductUrl(prod, locale);
          const isBed =
            idx === 0 ||
            prod.parent_category === "beds" ||
            prod.parent_category === "morphy-beds" ||
            prod.parent_category === "traditional-beds";

          return (
            <div
              key={it.product_id || idx}
              className="p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-white/90 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Thumbnail */}
                <div className="relative w-12 h-12 rounded-lg bg-[#F9F8F6] border border-wbk-lightgrey/60 overflow-hidden shrink-0">
                  {prod.image ? (
                    <Image
                      src={prod.image}
                      alt={localizedName}
                      fill
                      sizes="48px"
                      className="object-contain p-0.5"
                    />
                  ) : (
                    <IconPackage size={20} className="m-auto text-gray-300" />
                  )}
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-wbk-gold uppercase tracking-wider">
                      {isBed ? dict.componentBed : dict.componentCabinet}
                    </span>
                    <span className="text-wbk-brown/40 text-[10px]">•</span>
                    <span className="text-[10px] text-wbk-brown font-medium">
                      {dict.qty}: {it.quantity || 1}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-wbk-black truncate leading-snug group-hover:text-wbk-gold transition-colors">
                    {localizedName}
                  </h4>

                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-medium">
                      <IconCheck size={11} strokeWidth={2.5} />
                      {t("common.inStock", "In Stock")}
                    </span>
                    {productUrl && (
                      <Link
                        href={productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-wbk-brown/70 hover:text-wbk-black underline inline-flex items-center gap-0.5 transition-colors"
                        title={t("common.viewDetails", "View details")}
                      >
                        <span>{t("common.details", "Details")}</span>
                        <IconArrowUpRight size={10} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Price */}
              {itemPrice != null && Number(itemPrice) > 0 && (
                <div className="text-right shrink-0 pl-2">
                  <span className="text-xs font-semibold text-wbk-black">
                    {formatPrice(Number(itemPrice), locale)}
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {/* Subtle Savings Bottom Bar */}
        {savings > 0 && subtotal > 0 && (
          <div className="bg-[#F9F8F6]/80 px-3.5 py-2 flex items-center justify-between text-xs text-wbk-brown">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-wbk-brown/75">{dict.individualTotal}</span>
              <span className="text-[11px] line-through text-wbk-brown/70 font-medium">
                {formatPrice(Number(subtotal), locale)}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
              <span>{dict.packageSavings}</span>
              <span>-{formatPrice(Number(savings), locale)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Subtle 1-line compatibility reassurance */}
      <div className="flex items-center justify-center gap-1.5 text-[10px] text-wbk-brown/80 pt-0.5">
        <IconShieldCheck size={13} className="text-wbk-gold shrink-0" />
        <span>{dict.guaranteedCompatibility} • {dict.fiveYearWarranty}</span>
      </div>
    </div>
  );
}
