"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconShoppingCart,
  IconBox,
  IconLock,
  IconCheck,
} from "@tabler/icons-react";
import { useLocale } from "@/context/LocaleContext";
import { formatSizeLabel } from "@/lib/i18n";
import { getTagMeta } from "@/lib/tags";
import { TagBadge } from "@/components/ui/TagBadge";
import { getLocalizedProductName } from "@/lib/products";
import { formatWholesaleMoney } from "@/lib/wholesale-constants";
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
    const s = (product.color || product.name || "").toLowerCase();
    if (s.includes("walnut")) return ["#5C4033"];
    if (s.includes("white")) return ["#FFFFFF"];
    if (s.includes("black")) return ["#1A1A1A"];
    if (s.includes("natural wood") || s.includes("oak")) return ["#C19A6B"];
    if (s.includes("grey") || s.includes("gray")) return ["#6E6E6E"];
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

function formatOrientation(val, locale) {
  if (!val) return "";
  const norm = (locale || "en").toLowerCase();
  const lower = String(val).toLowerCase();
  if (lower.includes("vertical") && lower.includes("horizontal")) {
    if (norm === "fr") return "Vertical et horizontal";
    if (norm === "de") return "Vertikal & Horizontal";
    if (norm === "es") return "Vertical y horizontal";
    if (norm === "it") return "Verticale e orizzontale";
    if (norm === "por" || norm === "pt") return "Vertical e horizontal";
    return "Vertical & Horizontal";
  }
  if (lower.includes("vertical")) {
    if (norm === "de") return "Vertikal";
    if (norm === "it") return "Verticale";
    return "Vertical";
  }
  if (lower.includes("horizontal")) {
    if (norm === "it") return "Orizzontale";
    return "Horizontal";
  }
  return val;
}

export function getWholesaleCategorySlug(product) {
  const pc = String(product?.parent_category || "").toLowerCase();
  if (["morphy-beds", "traditional-beds", "beds"].includes(pc)) return "beds";
  return pc || "beds";
}

/**
 * WholesaleProductCard
 * Matches WallBedKing's signature ProductCard aesthetic in both compact Grid & dense List views,
 * with strict B2B price gating, Net (Excl. VAT) labeling, and Single Unit + Full Container quick-add.
 */
export function WholesaleProductCard({
  product,
  viewMode = "grid", // "grid" | "list"
  authorized = false,
  partner = null,
  pricingInfo = null,
  onLoginClick,
  onQuickAdd,
  className = "",
}) {
  const { locale, localizedHref, t } = useLocale();
  const [addedUnit, setAddedUnit] = useState(null); // "unit" | "container" | null

  if (!product) return null;

  const isTable =
    product.parent_category === "tables" ||
    Boolean(product.is_space_saving_table);
  const isMattress =
    product.parent_category === "mattresses" ||
    product.categoryKey === "mattresses" ||
    (typeof product.slug === "string" && product.slug.includes("mattress"));

  const title = getLocalizedProductName(product, locale) || product.name;
  const orientation = product.orientation || "";
  const isUS = locale === "us";
  const isMultiSize = Boolean(
    product.sizeLabel && /Available|Modular|Sizes|[-–—]|to/i.test(product.sizeLabel)
  );

  let rawSize;
  if (isMattress) {
    rawSize = product.sizeLabel || "Single to Super King (90x190 - 180x200 cm)";
  } else if (isMultiSize) {
    rawSize = product.sizeLabel;
  } else {
    rawSize =
      (isUS
        ? product.size_us || product.sizeLabel_us
        : product.size_eu ||
          (product.width && product.length
            ? `${Math.round(product.width / 10)}x${Math.round(product.length / 10)} cm`
            : null) ||
          product.sizeLabel_eu) ||
      product.sizeLabel ||
      product.size ||
      product.table_size ||
      (product.width && product.length
        ? `${Math.round(product.width / 10)}x${Math.round(product.length / 10)} cm`
        : "");
  }
  const size = rawSize ? formatSizeLabel(rawSize, locale) : "";

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

  const catSlug = getWholesaleCategorySlug(product);
  const detailHref = localizedHref(`/wholesale/${catSlug}/${product.slug || product.id}`);

  let image =
    product.image ||
    "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp";
  const hoverImage =
    product.hoverImage ||
    product.hover_image ||
    (Array.isArray(product.product_images) && product.product_images[1]) ||
    image;

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
    ? "scale-[1.15] group-hover:scale-[1.24]"
    : isMorphyItem
      ? "scale-[1.2] group-hover:scale-[1.3]"
      : isSofa
        ? "scale-[1.03] group-hover:scale-[1.07]"
        : "scale-[1.08] group-hover:scale-[1.12]";

  const pr = authorized ? pricingInfo : null;

  const triggerAdd = (e, orderUnit) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onQuickAdd || !pr?.hasPrice) return;
    onQuickAdd(product, pr, orderUnit);
    setAddedUnit(orderUnit);
    setTimeout(() => setAddedUnit((prev) => (prev === orderUnit ? null : prev)), 1500);
  };

  // ── DENSE LIST VIEW (WallBedKing-styled horizontal product row) ──
  if (viewMode === "list") {
    return (
      <div
        className={`group flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-3 sm:p-3.5 bg-wbk-white border border-wbk-lightgrey/60 hover:border-wbk-black/40 transition-colors ${className}`}
      >
        {/* Thumbnail in signature WBK warm grey box */}
        <Link
          href={detailHref}
          className="relative w-full sm:w-24 md:w-28 aspect-[4/3] sm:aspect-square shrink-0 overflow-hidden bg-[#E4E0DE]/45 border border-wbk-lightgrey/30 flex items-center justify-center p-1.5 transition-colors group-hover:bg-[#E4E0DE]/65"
        >
          <img
            src={image}
            alt={title}
            className="h-full w-full object-contain transition-all duration-300 group-hover:opacity-0 relative z-1"
          />
          <img
            src={hoverImage}
            alt={`${title} view`}
            className="absolute inset-0 h-full w-full object-contain p-1.5 opacity-0 transition-all duration-300 group-hover:opacity-100 z-1"
          />
          {authorized && pr?.hasPrice && pr?.containerQty > 0 && (
            <span className="absolute bottom-1 left-1 z-10 px-1.5 py-0.5 bg-wbk-black/85 text-white text-[9px] font-mono font-semibold leading-none">
              {pr.containerQty} pcs/ctn
            </span>
          )}
        </Link>

        {/* Product Details */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            {product.sku && (
              <span className="text-[10px] font-mono text-wbk-brown bg-[#F4F2F0] px-1.5 py-0.5">
                SKU: {product.sku}
              </span>
            )}
            {product.ean && (
              <span className="text-[10px] font-mono text-wbk-brown/80 hidden md:inline">
                EAN: {product.ean}
              </span>
            )}
            {productTags.slice(0, 2).map((tg) => (
              <TagBadge key={tg.id} tagIdOrSlug={tg.id} locale={locale} variant="micro" />
            ))}
          </div>

          <Link
            href={detailHref}
            className="font-poppins font-medium text-sm sm:text-[15px] text-wbk-black group-hover:text-wbk-green transition-colors leading-snug line-clamp-1 block"
          >
            {title}
          </Link>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-wbk-brown font-poppins">
            {orientation &&
              orientation !== "Universal" &&
              !isMattress &&
              !isTable &&
              product.parent_category !== "sofas" && (
                <span>
                  {t("product.orientation", "Orientation")}:{" "}
                  <strong className="font-medium text-wbk-black">
                    {formatOrientation(orientation, locale)}
                  </strong>
                </span>
              )}
            {size && (
              <span>
                {t("product.size", "Size")}:{" "}
                <strong className="font-medium text-wbk-black">{size}</strong>
              </span>
            )}
            {product.color && (
              <span>
                {t("product.colors", "Color")}:{" "}
                <strong className="font-medium text-wbk-black">{product.color}</strong>
              </span>
            )}
            {colors && colors.length > 0 && !isMattress && (
              <span className="inline-flex items-center gap-1">
                {colors.slice(0, 5).map((color, cIdx) => (
                  <span
                    key={cIdx}
                    className="inline-block h-3 w-3 rounded-full border border-wbk-lightgrey/80"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </span>
            )}
          </div>
        </div>

        {/* Right: Wholesale Price + Actions */}
        <div className="flex sm:flex-col md:flex-row items-start sm:items-end md:items-center justify-between gap-3 sm:gap-2 md:gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-wbk-lightgrey/50 shrink-0">
          {/* Pricing Block */}
          <div className="text-left sm:text-right">
            {!authorized ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onLoginClick?.();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FBF9F8] border border-wbk-lightgrey hover:border-wbk-black text-[11px] font-medium text-wbk-black transition-colors cursor-pointer"
              >
                <IconLock size={12} className="text-wbk-gold" />
                <span>Log in for wholesale price</span>
              </button>
            ) : pr?.hasPrice ? (
              <div className="space-y-0.5">
                <div className="flex items-baseline sm:justify-end gap-1.5">
                  <span className="font-semibold text-base text-wbk-black">
                    {formatWholesaleMoney(pr.unitPrice, pr.currency)}
                  </span>
                  <span className="text-[10px] font-semibold text-wbk-green uppercase tracking-tight">
                    Net • Excl. VAT
                  </span>
                </div>
                {pr.containerQty > 0 && (
                  <div className="text-[11px] text-wbk-brown">
                    Container ({pr.containerQty} pcs):{" "}
                    <strong className="text-wbk-black font-semibold">
                      {formatWholesaleMoney(pr.containerTotal, pr.currency)}
                    </strong>{" "}
                    <span className="text-[10px]">excl. VAT</span>
                  </div>
                )}
              </div>
            ) : (
              <span className="text-xs text-wbk-brown italic">Price on request</span>
            )}
          </div>

          {/* Action Buttons */}
          {authorized && pr?.hasPrice ? (
            <div className="flex items-center gap-1.5 shrink-0">
              {partner?.allowSingleUnit !== false && (
                <button
                  type="button"
                  onClick={(e) => triggerAdd(e, "unit")}
                  className="h-9 px-3.5 rounded-full border border-wbk-black bg-wbk-black hover:bg-wbk-green hover:border-wbk-green text-white hover:text-wbk-black text-[11px] font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
                  title="Add 1 unit to Wholesale Cart"
                >
                  {addedUnit === "unit" ? <IconCheck size={14} /> : <IconShoppingCart size={14} />}
                  <span>{addedUnit === "unit" ? "Added" : "+1 pc"}</span>
                </button>
              )}
              {partner?.allowContainer !== false && pr.containerQty > 0 && (
                <button
                  type="button"
                  onClick={(e) => triggerAdd(e, "container")}
                  className="h-9 px-3.5 rounded-full border border-wbk-gold bg-wbk-gold hover:bg-wbk-black hover:border-wbk-black text-wbk-black hover:text-white text-[11px] font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
                  title={`Add 1 Full Container (${pr.containerQty} pcs)`}
                >
                  {addedUnit === "container" ? <IconCheck size={14} /> : <IconBox size={14} />}
                  <span>{addedUnit === "container" ? "Added" : `Container (${pr.containerQty})`}</span>
                </button>
              )}
            </div>
          ) : (
            <Link
              href={detailHref}
              className="h-8 px-4 rounded-full border border-wbk-lightgrey hover:border-wbk-black text-[11px] font-semibold text-wbk-black inline-flex items-center justify-center transition-colors whitespace-nowrap"
            >
              Details
            </Link>
          )}
        </div>
      </div>
    );
  }

  // ── COMPACT GRID VIEW (Reworked signature ProductCard in tighter B2B proportions) ──
  return (
    <Link href={detailHref} className={`group block space-y-2.5 ${className}`}>
      {/* Image Box — signature WBK warm grey container, compact 4:3 ratio so more rows fit */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#E4E0DE]/45 flex items-center justify-center p-2 transition-colors duration-300 group-hover:bg-[#E4E0DE]/60 rounded-none border border-wbk-lightgrey/30">
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
          className={`absolute inset-0 h-full w-full object-contain p-2 opacity-0 transition-all duration-500 group-hover:opacity-100 z-1 ${imageScaleClass}`}
        />

        {/* Container Qty corner pill for authorized partners */}
        {authorized && pr?.hasPrice && pr?.containerQty > 0 && (
          <div className="absolute top-0 left-0 z-10 select-none pointer-events-none">
            <span className="px-2.5 py-1 bg-wbk-black/90 text-white text-[10px] font-mono font-semibold uppercase tracking-wider block">
              {pr.containerQty} pcs / container
            </span>
          </div>
        )}

        {/* Primary Tag badge */}
        {primaryTag && (
          <TagBadge tagIdOrSlug={primaryTag.id} locale={locale} variant="corner" />
        )}
      </div>

      {/* Product Text Details — same ProductCard typography & spec layout, compacted */}
      <div className="space-y-1.5 px-0.5">
        {/* SKU + Micro Tags */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {product.sku && (
            <span className="text-[10px] font-mono text-wbk-brown truncate max-w-full">
              {product.sku}
            </span>
          )}
          {productTags.slice(0, 1).map((tg) => (
            <TagBadge key={tg.id} tagIdOrSlug={tg.id} locale={locale} variant="micro" />
          ))}
        </div>

        {/* Title */}
        <h3 className="font-poppins font-medium text-sm text-wbk-black group-hover:text-wbk-green transition-colors leading-snug line-clamp-2 min-h-[2.5rem]">
          {title}
        </h3>

        {/* Compact Specs */}
        <div className="text-[11px] text-wbk-black space-y-0.5 font-poppins">
          {orientation &&
            orientation !== "Universal" &&
            !isMattress &&
            !isTable &&
            product.parent_category !== "sofas" && (
              <div className="truncate">
                <span className="text-wbk-brown">{t("product.orientation", "Orientation")}:</span>{" "}
                <span className="font-medium text-wbk-black">{formatOrientation(orientation, locale)}</span>
              </div>
            )}

          {size && (
            <div className="truncate">
              <span className="text-wbk-brown">{t("product.size", "Size")}:</span>{" "}
              <span className="font-medium text-wbk-black">{size}</span>
            </div>
          )}

          {colors && colors.length > 0 && !isMattress && (
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="text-wbk-brown">{t("product.colors", "Colors")}:</span>
              <div className="flex items-center">
                {colors.slice(0, 5).map((color, cIdx) => (
                  <span
                    key={cIdx}
                    className="inline-block h-3 w-3 rounded-full border border-wbk-lightgrey/80 -mr-1"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Wholesale Price Block (Strictly Gated) */}
        <div className="pt-1.5">
          {!authorized ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onLoginClick?.();
              }}
              className="w-full py-1.5 px-3 rounded-full bg-[#FBF9F8] border border-wbk-lightgrey hover:border-wbk-black text-[11px] font-medium text-wbk-black inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <IconLock size={12} className="text-wbk-gold shrink-0" />
              <span className="truncate">Log in to view wholesale price</span>
            </button>
          ) : pr?.hasPrice ? (
            <div className="space-y-2">
              <div>
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="font-semibold text-base text-wbk-black leading-none">
                    {formatWholesaleMoney(pr.unitPrice, pr.currency)}
                  </span>
                  <span className="text-[10px] font-semibold text-wbk-green uppercase">
                    Net • Excl. VAT
                  </span>
                </div>
                {pr.containerQty > 0 && (
                  <div className="text-[11px] text-wbk-brown mt-0.5 truncate">
                    Container ({pr.containerQty}):{" "}
                    <strong className="text-wbk-black font-semibold">
                      {formatWholesaleMoney(pr.containerTotal, pr.currency)}
                    </strong>{" "}
                    excl. VAT
                  </div>
                )}
              </div>

              {/* Action Buttons in signature WBK rounded-full style */}
              <div className="flex items-center gap-1.5">
                {partner?.allowSingleUnit !== false && (
                  <button
                    type="button"
                    onClick={(e) => triggerAdd(e, "unit")}
                    className="h-8 px-3 rounded-full border border-wbk-black bg-wbk-black hover:bg-wbk-green hover:border-wbk-green text-white hover:text-wbk-black text-[11px] font-semibold inline-flex items-center justify-center gap-1 transition-all duration-200 cursor-pointer flex-1"
                    title="Add 1 piece to Wholesale Cart"
                  >
                    {addedUnit === "unit" ? <IconCheck size={13} /> : <IconShoppingCart size={13} />}
                    <span>{addedUnit === "unit" ? "Added" : "+1 pc"}</span>
                  </button>
                )}
                {partner?.allowContainer !== false && pr.containerQty > 0 && (
                  <button
                    type="button"
                    onClick={(e) => triggerAdd(e, "container")}
                    className="h-8 px-3 rounded-full border border-wbk-gold bg-wbk-gold hover:bg-wbk-black hover:border-wbk-black text-wbk-black hover:text-white text-[11px] font-semibold inline-flex items-center justify-center gap-1 transition-all duration-200 cursor-pointer flex-1"
                    title={`Add 1 Full Container (${pr.containerQty} pcs)`}
                  >
                    {addedUnit === "container" ? <IconCheck size={13} /> : <IconBox size={13} />}
                    <span>{addedUnit === "container" ? "Added" : "+1 Ctn"}</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-xs text-wbk-brown italic pt-0.5">Price on request</div>
          )}
        </div>
      </div>
    </Link>
  );
}
