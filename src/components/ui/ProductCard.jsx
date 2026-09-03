"use client";

import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import { getProductPrice } from "@/lib/i18n";

const DEFAULT_COLORS = ["#A5988E", "#D2AA7C", "#E4E0DE", "#090A0A"];

export function ProductCard({ product, className = "" }) {
  const { locale, localizedHref, t } = useLocale();
  if (!product) return null;

  const title = product.title || product.name || "Wall Bed";
  const orientation = product.orientation || "Vertical";
  const size = product.sizeLabel || product.size || "180x200";

  // Standardize colors
  let colors = product.colors;
  if (!colors || !Array.isArray(colors) || colors.length === 0) {
    if (product.color === "Beige") colors = ["#D2AA7C"];
    else if (product.color === "Grey") colors = ["#A5988E"];
    else if (product.color === "White") colors = ["#FFFFFF"];
    else if (product.color === "Black") colors = ["#090A0A"];
    else colors = DEFAULT_COLORS;
  }

  // Calculate destination link
  const rawLink =
    product.link ||
    (product.parent_category && product.slug
      ? `/products/${product.parent_category}/${product.slug}`
      : product.slug
        ? `/products/beds/${product.slug}`
        : `/products/beds/${product.id || "integrated-bed"}`);
  const link = localizedHref(rawLink);

  // Image resolution
  const image =
    product.image ||
    "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp";
  const hoverImage =
    product.hoverImage ||
    product.hover_image ||
    "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp";

  // Market-aware Pricing format
  const pricing = getProductPrice(product, locale);
  const priceDisplay = pricing.display;
  const isFrom = !String(priceDisplay).toLowerCase().includes("from");

  return (
    <Link href={link} className={`group block space-y-4 ${className}`}>
      {/* Image Box - Light grey background container */}
      <div className="relative aspect-[1/1] w-full overflow-hidden bg-[#E4E0DE]/45 flex items-center justify-center p-8 transition-colors duration-300 group-hover:bg-[#E4E0DE]/60 border border-wbk-lightgrey/30 rounded-none">
        {/* Primary Product Image */}
        <img
          src={image}
          alt={title}
          className="h-full w-full object-contain transition-opacity duration-500 group-hover:opacity-0"
        />
        {/* Hover Product Image */}
        <img
          src={hoverImage}
          alt={`${title} details`}
          className="absolute inset-0 h-full w-full object-contain p-8 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />

        {/* Sale badge */}
        {pricing.isOnSale && (
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-wbk-black text-white text-[10px] font-semibold uppercase tracking-wider rounded-full shadow-2xs z-10">
            Sale {pricing.discountPercent > 0 ? `-${pricing.discountPercent}%` : ""}
          </span>
        )}
      </div>

      {/* Product Text Details */}
      <div className="space-y-2 px-1">
        {/* Title */}
        <h3 className="font-poppins font-medium text-base text-wbk-black group-hover:text-wbk-green transition-colors leading-snug">
          {title}
        </h3>

        {/* Specs */}
        <div className="text-xs text-wbk-black space-y-0.5 font-poppins">
          {orientation && <div>Orientation: {orientation}</div>}
          <div>Size: {size}</div>
          {colors && colors.length > 0 && (
            <div className="flex items-center gap-1.5 pt-1">
              <span>Colors:</span>
              <div className="flex items-center">
                {colors.map((color, cIdx) => (
                  <span
                    key={cIdx}
                    className="inline-block h-3.5 w-3.5 rounded-full border border-wbk-lightgrey/80 -mr-1"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="pt-1 text-sm text-wbk-black font-poppins flex items-baseline gap-2 flex-wrap">
          <div>
            {isFrom ? `${t("common.from", "from")} ` : ""}
            <span className="font-semibold text-base">{priceDisplay}</span>
          </div>
          {pricing.isOnSale && (
            <span className="text-xs text-wbk-brown line-through font-normal">
              {pricing.regularDisplay}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
