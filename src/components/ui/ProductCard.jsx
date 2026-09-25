"use client";

import { useState } from "react";
import Link from "next/link";
import { IconShoppingCart, IconHeart } from "@tabler/icons-react";
import { useLocale } from "@/context/LocaleContext";
import { getProductPrice, formatSizeLabel } from "@/lib/i18n";
import { QuickAddModal } from "@/components/product/QuickAddModal";
import { WaitlistModal } from "@/components/product/WaitlistModal";

const DEFAULT_COLORS = ["#A5988E", "#D2AA7C", "#E4E0DE", "#090A0A"];

export function ProductCard({ product, className = "" }) {
  const { locale, localizedHref, t } = useLocale();
  const [isQuickOpen, setIsQuickOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  if (!product) return null;

  const title = product.title || product.name || "Wall Bed";
  const orientation = product.orientation || "Vertical";
  const rawSize =
    product.sizeLabel ||
    product.size ||
    (product.width && product.length
      ? `${Math.round(product.width / 10)}x${Math.round(product.length / 10)} cm`
      : "Standard");

  const size = formatSizeLabel(rawSize, locale);

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

  const isOutOfStock =
    (product.stock !== undefined &&
      product.stock !== null &&
      Number(product.stock) <= 0) ||
    product.in_stock === false;

  return (
    <>
      <Link href={link} className={`group block space-y-4 ${className}`}>
        {/* Image Box - Light grey background container */}
        <div className="relative aspect-[1/1] w-full overflow-hidden bg-[#E4E0DE]/45 flex items-center justify-center p-8 transition-colors duration-300 group-hover:bg-[#E4E0DE]/60 rounded-none border border-wbk-lightgrey/30">
          {/* Subtle top-left green glow behind sale badge */}
          {pricing.isOnSale && (
            <div
              className="absolute top-0 left-0 w-60 h-60 pointer-events-none z-0 transition-opacity duration-300"
              style={{
                background:
                  "radial-gradient(circle at 0% 0%, rgba(163, 164, 140, 0.45) 0%, rgba(163, 164, 140, 0.2) 35%, rgba(163, 164, 140, 0.05) 60%, transparent 80%)",
              }}
            />
          )}

          {/* Primary Product Image */}
          <img
            src={image}
            alt={title}
            className="h-full w-full object-contain transition-opacity duration-500 group-hover:opacity-0 relative z-1"
          />
          {/* Hover Product Image */}
          <img
            src={hoverImage}
            alt={`${title} details`}
            className="absolute inset-0 h-full w-full object-contain p-8 opacity-0 transition-opacity duration-500 group-hover:opacity-100 z-1"
          />

          {/* Sale badge */}
          {pricing.isOnSale && (
            <span className="absolute top-0 left-0 px-6 py-3 bg-wbk-green text-white text-xs sm:text-[13px] font-bold uppercase tracking-wider z-10 border-0 select-none">
              {t("product.sale", "Sale")} {pricing.discountLabel || (pricing.discountPercent > 0 ? `-${pricing.discountPercent}%` : "")}
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
            {product.sku && (
              <div className="text-[11px] text-wbk-brown font-mono font-medium tracking-tight">
                SKU: {product.sku}
              </div>
            )}
            {orientation &&
              product.parent_category !== "mattresses" &&
              product.parent_category !== "sofas" && (
                <div>{t("product.orientation", "Orientation")}: {orientation}</div>
              )}
            <div>{t("product.size", "Size")}: {size}</div>
            {product.weight && (
              <div className="text-[11px] text-wbk-brown">
                {t("product.weight", "Weight")}:{" "}
                {locale === "us"
                  ? `${Math.round(product.weight * 2.20462)} lbs`
                  : `${product.weight} kg`}
              </div>
            )}
            {colors && colors.length > 0 && (
              <div className="flex items-center gap-1.5 pt-1">
                <span>{t("product.colors", "Colors")}:</span>
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

            {/* Stock status indicator under colors */}
            <div className="flex items-center gap-1.5 pt-1.5">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  isOutOfStock ? "bg-wbk-gold animate-pulse" : "bg-wbk-green"
                }`}
              />
              <span
                className={`text-[11px] font-semibold tracking-tight ${
                  isOutOfStock ? "text-wbk-gold" : "text-wbk-green"
                }`}
              >
                {isOutOfStock
                  ? t("waitlist.outOfStock", "Out of Stock")
                  : t("common.inStock", "In Stock")}
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="pt-1 text-sm text-wbk-black font-poppins flex items-baseline gap-2 flex-wrap">
            <div>
              {isFrom ? `${t("common.from", "from")} ` : ""}
              <span
                className={`font-semibold text-base ${
                  pricing.isOnSale ? "text-wbk-green" : "text-wbk-black"
                }`}
              >
                {priceDisplay}
              </span>
            </div>
            {pricing.isOnSale && (
              <span className="text-xs text-wbk-brown line-through font-normal">
                {pricing.regularDisplay}
              </span>
            )}
          </div>

          {/* Action Button below price, left-aligned: Cart if in stock, WBK Gold Wishlist if out of stock */}
          <div className="pt-2 flex items-center justify-start">
            {!isOutOfStock ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsQuickOpen(true);
                }}
                className="w-10 h-10 rounded-full border border-wbk-black bg-wbk-black hover:bg-wbk-green hover:border-wbk-green text-white hover:text-wbk-black flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer group/btn shrink-0"
                title={t("common.addToCart", "Add to Cart")}
                aria-label={t("common.addToCart", "Add to Cart")}
              >
                <IconShoppingCart size={18} className="transition-transform duration-200 group-hover/btn:scale-110" />
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsWishlistOpen(true);
                }}
                className="w-10 h-10 rounded-full border border-wbk-gold bg-wbk-gold hover:bg-wbk-black hover:border-wbk-black text-wbk-black hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer group/fav shrink-0"
                title={t("waitlist.joinWaitlistBtn", "Add to Wishlist / Notify Me")}
                aria-label={t("waitlist.joinWaitlistBtn", "Add to Wishlist / Notify Me")}
              >
                <IconHeart size={18} className="transition-transform duration-200 group-hover/fav:scale-110" />
              </button>
            )}
          </div>
        </div>
      </Link>

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickOpen}
        onClose={() => setIsQuickOpen(false)}
        product={product}
      />

      {/* Wishlist / Waitlist Modal */}
      <WaitlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        product={product}
      />
    </>
  );
}
