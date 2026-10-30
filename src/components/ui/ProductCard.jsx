"use client";

import { useState } from "react";
import Link from "next/link";
import { IconShoppingCart, IconHeart } from "@tabler/icons-react";
import { useLocale } from "@/context/LocaleContext";
import { getProductPrice, formatSizeLabel } from "@/lib/i18n";
import { getTagMeta, getLocalizedTagName } from "@/lib/tags";
import { TagBadge } from "@/components/ui/TagBadge";
import { QuickAddModal } from "@/components/product/QuickAddModal";
import { WaitlistModal } from "@/components/product/WaitlistModal";
import { getLocalizedProductName, getStorefrontProductUrl } from "@/lib/products";
import tablesCatalogData from "@/data/tables-catalog.json";

const DEFAULT_COLORS = ["#A5988E", "#D2AA7C", "#E4E0DE", "#090A0A"];

function getTableSwatches(product) {
  if (!product) return [];
  const slug = product.slug;
  const variants = (tablesCatalogData?.variants || []).filter(
    (v) => v.parent_slug === slug || v.slug === slug
  );
  if (variants.length === 0) {
    if (product.colors && Array.isArray(product.colors)) return product.colors;
    return ["#D2B48C"];
  }
  const hexes = [];
  variants.forEach((v) => {
    const s = (v.color || v.name || "").toLowerCase();
    let hex = "#D2B48C";
    if (s.includes("walnut")) hex = "#5C4033";
    else if (s.includes("white")) hex = "#FFFFFF";
    else if (s.includes("black")) hex = "#1A1A1A";
    else if (s.includes("natural wood") || s.includes("oak")) hex = "#C19A6B";
    else if (s.includes("grey") || s.includes("gray")) hex = "#6E6E6E";
    else if (s.includes("blue")) hex = "#1E3A8A";
    else if (s.includes("silver")) hex = "#C0C0C0";
    else if (s.includes("khaki")) hex = "#BDB76B";
    if (!hexes.includes(hex)) hexes.push(hex);
  });
  return hexes.slice(0, 5);
}

export function ProductCard({ product, className = "" }) {
  const { locale, localizedHref, t } = useLocale();
  const [isQuickOpen, setIsQuickOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  if (!product) return null;

  const isTable =
    product.parent_category === "tables" ||
    Boolean(product.is_space_saving_table);
  const isMattress =
    product.parent_category === "mattresses" ||
    product.categoryKey === "mattresses" ||
    (typeof product.slug === "string" && product.slug.includes("mattress"));
  const title = getLocalizedProductName(product, locale);
  const orientation = product.orientation || "Vertical";
  const isUS = locale === "us";
  const isMultiSize = Boolean(
    product.sizeLabel && /Available|Modular|Sizes|[-–—]|to/i.test(product.sizeLabel)
  );

  let rawSize;
  if (isMattress) {
    rawSize = product.sizeLabel || "Single to Super King (90x190 - 180x200 cm)";
    if (!/[-–—\d]/i.test(rawSize)) {
      rawSize = `${rawSize} (90x190 - 180x200 cm)`;
    }
  } else if (isMultiSize) {
    rawSize = product.sizeLabel;
  } else {
    rawSize =
      (isUS ? (product.size_us || product.sizeLabel_us) : (product.size_eu || (product.width && product.length ? `${Math.round(product.width / 10)}x${Math.round(product.length / 10)} cm` : null) || product.sizeLabel_eu)) ||
      product.sizeLabel ||
      product.size ||
      (product.width && product.length
        ? `${Math.round(product.width / 10)}x${Math.round(product.length / 10)} cm`
        : "Standard");
  }

  const size = formatSizeLabel(rawSize, locale);

  // Standardize colors
  let colors = product.colors;
  if (!colors || !Array.isArray(colors) || colors.length === 0) {
    if (isTable) {
      colors = getTableSwatches(product);
    } else if (product.color === "Beige") colors = ["#D2AA7C"];
    else if (product.color === "Grey") colors = ["#A5988E"];
    else if (product.color === "White") colors = ["#FFFFFF"];
    else if (product.color === "Black") colors = ["#090A0A"];
    else colors = DEFAULT_COLORS;
  }

  // Calculate destination link
  const rawLink = product.link || getStorefrontProductUrl(product);
  const link = localizedHref(rawLink);

  // Image resolution
  let image =
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

  // Tag metadata
  const productTags = Array.isArray(product.tags)
    ? product.tags.map(getTagMeta).filter(Boolean)
    : [];
  const primaryTag = productTags[0] || null;

  const isMorphyItem =
    Boolean(product.isMorphy) ||
    (typeof image === "string" && image.includes("MORPHY")) ||
    (typeof product.name === "string" && product.name.includes("MORPHY")) ||
    (typeof product.title === "string" && product.title.includes("MORPHY"));

  if (isMorphyItem && typeof image === "string") {
    image = image.replace(/MORPHY_1\.webp/, "MORPHY_5.webp");
  }

  const isIntegrated =
    product.type === "Integrated" ||
    (typeof image === "string" &&
      (image.includes("-IV-") || image.includes("-IH-")));
  const isSofa = product.parent_category === "sofas";

  const imageScaleClass = isIntegrated
    ? "scale-[1.2] group-hover:scale-[1.34]"
    : isMorphyItem
      ? "scale-[1.3] group-hover:scale-[1.46]"
      : isSofa
        ? "scale-[1.05] group-hover:scale-[1.08]"
        : "scale-[1.15] group-hover:scale-[1.18]";

  return (
    <>
      <Link href={link} className={`group block space-y-4 ${className}`}>
        {/* Image Box - Light grey background container */}
        <div className="relative aspect-[1/1] w-full overflow-hidden bg-[#E4E0DE]/45 flex items-center justify-center p-2 sm:p-3 transition-colors duration-300 group-hover:bg-[#E4E0DE]/60 rounded-none border border-wbk-lightgrey/30">
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
            className={`h-full w-full object-contain transition-all duration-500 group-hover:opacity-0 relative z-1 ${imageScaleClass}`}
          />
          {/* Hover Product Image */}
          <img
            src={hoverImage}
            alt={`${title} details`}
            className={`absolute inset-0 h-full w-full object-contain p-2 sm:p-3 opacity-0 transition-all duration-500 group-hover:opacity-100 z-1 ${imageScaleClass}`}
          />

          {/* Sale badge */}
          {pricing.isOnSale && (
            <span className="absolute top-0 left-0 px-6 py-3 bg-wbk-green text-white text-xs sm:text-[13px] font-bold uppercase tracking-wider z-10 border-0 select-none">
              {t("product.sale", "Sale")}{" "}
              {pricing.discountLabel ||
                (pricing.discountPercent > 0
                  ? `-${pricing.discountPercent}%`
                  : "")}
            </span>
          )}

          {/* Primary Tag badge */}
          {primaryTag && (
            <TagBadge
              tagIdOrSlug={primaryTag.id}
              locale={locale}
              variant="corner"
            />
          )}
        </div>

        {/* Product Text Details */}
        <div className="space-y-2 px-1">
          {/* Tags row */}
          {productTags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {productTags.map((t) => (
                <TagBadge
                  key={t.id}
                  tagIdOrSlug={t.id}
                  locale={locale}
                  variant="micro"
                />
              ))}
            </div>
          )}

          {/* Title */}
          <h3 className="font-poppins font-medium text-base text-wbk-black group-hover:text-wbk-green transition-colors leading-snug">
            {title}
          </h3>

          {/* Specs */}
          <div className="text-xs text-wbk-black space-y-0.5 font-poppins">
            {/* Orientation: Only for beds and cabinets (where vertical / horizontal is a core distinguishing feature) */}
            {orientation &&
              orientation !== "Universal" &&
              !isMattress &&
              !isTable &&
              product.parent_category !== "sofas" && (
                <div>
                  <span className="text-wbk-brown">{t("product.orientation", "Orientation")}:</span>{" "}
                  <span className="font-medium text-wbk-black">{orientation}</span>
                </div>
              )}

            {/* Size / Finishes row */}
            {isTable ? (
              <div>
                <span className="text-wbk-brown">
                  {product.variants_count && product.variants_count > 1
                    ? t("product.options", "Options")
                    : t("product.design", "Design")}:
                </span>{" "}
                <span className="font-medium text-wbk-black">
                  {product.variants_count && product.variants_count > 1
                    ? `${product.variants_count} ${t("product.finishesAvailable", "Finishes Available")}`
                    : t("product.spaceSavingTransforming", "Space-Saving Transforming")}
                </span>
              </div>
            ) : (
              <div>
                <span className="text-wbk-brown">{t("product.size", "Size")}:</span>{" "}
                <span className="font-medium text-wbk-black">{size}</span>
              </div>
            )}

            {/* Colors Swatches (hide for mattresses which only have single white dot) */}
            {colors && colors.length > 0 && !isMattress && (
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-wbk-brown">{t("product.colors", "Colors")}:</span>
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
                <IconShoppingCart
                  size={18}
                  className="transition-transform duration-200 group-hover/btn:scale-110"
                />
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
                title={t(
                  "waitlist.joinWaitlistBtn",
                  "Add to Wishlist / Notify Me",
                )}
                aria-label={t(
                  "waitlist.joinWaitlistBtn",
                  "Add to Wishlist / Notify Me",
                )}
              >
                <IconHeart
                  size={18}
                  className="transition-transform duration-200 group-hover/fav:scale-110"
                />
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
