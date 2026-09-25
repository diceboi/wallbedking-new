"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  IconX,
  IconShoppingCart,
  IconCheck,
  IconPlus,
  IconMinus,
  IconArrowRight,
  IconShieldCheck,
  IconTruck,
  IconBell,
} from "@tabler/icons-react";
import { WaitlistModal } from "@/components/product/WaitlistModal";
import { useCart } from "@/context/CartContext";
import { useLocale } from "@/context/LocaleContext";
import { getProductVariants, formatCatalogItem } from "@/data/products";
import { getProductPrice, formatPrice, formatSizeLabel } from "@/lib/i18n";

export function QuickAddModal({ isOpen, onClose, product }) {
  const { locale, localizedHref, t } = useLocale();
  const { addItem, openCart } = useCart();

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch all variants for this product family
  const variants = useMemo(() => {
    if (!product) return [];
    const list = getProductVariants(product);
    if (!list || list.length === 0) {
      return [formatCatalogItem(product)];
    }
    return list;
  }, [product]);

  // Available orientations if bed
  const formats = useMemo(() => {
    if (!product || product.parent_category !== "beds") return [];
    return ["Vertical", "Horizontal"];
  }, [product]);

  // Initialize selected variant and format on open
  useEffect(() => {
    if (product && isOpen) {
      const initialFmt = product.orientation || "Vertical";
      setSelectedFormat(initialFmt);
      setQuantity(1);
      setIsAdded(false);

      // Match current product in variants list
      let matched = variants.find(
        (v) =>
          String(v.rawId || v.id) === String(product.rawId || product.id)
      );

      if (!matched && product.defaultSizeSlug) {
        matched = variants.find(
          (v) =>
            v.sizeSlug === product.defaultSizeSlug &&
            (!product.orientation || v.orientation === product.orientation)
        );
      }

      if (!matched) {
        matched = variants.find((v) => v.slug === product.slug);
      }

      if (!matched) {
        matched = variants.find(
          (v) =>
            (v.orientation || "Vertical").toLowerCase() === initialFmt.toLowerCase()
        );
      }

      setSelectedVariant(matched || variants[0] || product);
    }
  }, [product, isOpen, variants]);

  // Prevent background scroll while modal is open WITHOUT breaking sticky headers
  useEffect(() => {
    if (!isOpen) return;

    const preventBackgroundScroll = (e) => {
      if (e.target.closest("[data-modal-card]") || e.target.closest(".custom-scrollbar")) {
        return;
      }
      e.preventDefault();
    };

    window.addEventListener("wheel", preventBackgroundScroll, { passive: false });
    window.addEventListener("touchmove", preventBackgroundScroll, { passive: false });

    return () => {
      window.removeEventListener("wheel", preventBackgroundScroll);
      window.removeEventListener("touchmove", preventBackgroundScroll);
    };
  }, [isOpen]);

  if (!isOpen || !product || !mounted) return null;

  // Active product to display details for
  const activeProduct = selectedVariant || product;

  // Sizes available for the active format / type
  const availableSizes = variants.filter((v) => {
    if (product.parent_category === "beds" && selectedFormat) {
      return (v.orientation || "Vertical").toLowerCase() === selectedFormat.toLowerCase();
    }
    return true;
  });

  // Calculate pricing
  const pricing = getProductPrice(activeProduct, locale);
  const unitPrice =
    Number(pricing?.raw ?? pricing?.numeric ?? pricing?.regularRaw) ||
    Number(activeProduct?.sale_price_gbp) ||
    Number(activeProduct?.price_gbp) ||
    Number(activeProduct?.numericPrice) ||
    Number(product?.sale_price_gbp) ||
    Number(product?.price_gbp) ||
    0;
  const totalPrice = unitPrice * quantity;
  const isOutOfStock =
    (activeProduct?.stock !== undefined &&
      activeProduct?.stock !== null &&
      Number(activeProduct.stock) <= 0) ||
    activeProduct?.in_stock === false;

  const handleSelectSize = (variant) => {
    setSelectedVariant(variant);
  };

  const handleSelectFormat = (fmt) => {
    setSelectedFormat(fmt);
    // Find matching size variant in new format
    const currentSizeLabel = activeProduct.sizeLabel || activeProduct.size;
    const sameSize = variants.find(
      (v) =>
        (v.orientation || "Vertical").toLowerCase() === fmt.toLowerCase() &&
        (v.sizeLabel === currentSizeLabel || v.size === activeProduct.size)
    );
    if (sameSize) {
      setSelectedVariant(sameSize);
    } else {
      const firstInFormat = variants.find(
        (v) => (v.orientation || "Vertical").toLowerCase() === fmt.toLowerCase()
      );
      if (firstInFormat) setSelectedVariant(firstInFormat);
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    const sizeStr = activeProduct.sizeLabel || activeProduct.size || "Standard";
    const itemToAdd = {
      id: `${activeProduct.slug || activeProduct.rawId || activeProduct.id}-${sizeStr}-${activeProduct.orientation || "Vertical"}-${activeProduct.type || "Classic"}`,
      productId: activeProduct.slug || activeProduct.rawId || activeProduct.id,
      title: activeProduct.title || activeProduct.name || product.title || product.name,
      image:
        activeProduct.image ||
        product.image ||
        "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
      price: unitPrice,
      options: {
        size: formatSizeLabel(sizeStr, locale),
        orientation: activeProduct.orientation || selectedFormat || "Vertical",
        type: activeProduct.type || activeProduct.sub_category || "Classic",
        sku: activeProduct.sku || product.sku || "",
      },
      href: `/products/${product.parent_category || "beds"}/${activeProduct.slug || product.slug}`,
    };

    addItem(itemToAdd, quantity, true);
    setIsAdded(true);

    setTimeout(() => {
      setIsAdded(false);
      onClose();
      openCart();
    }, 600);
  };

  const fullProductUrl = localizedHref(
    `/products/${product.parent_category || "beds"}/${activeProduct.slug || product.slug}`
  );

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] bg-wbk-black/50 backdrop-blur-[4px] overflow-y-auto overscroll-contain flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200 font-poppins"
      onClick={onClose}
    >
      <div
        data-modal-card="true"
        className="bg-white max-w-lg w-full rounded-2xl border border-wbk-lightgrey/80 shadow-2xl relative my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-wbk-lightgrey/60 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-wbk-gold/15 text-wbk-black border border-wbk-gold/30 flex items-center justify-center">
              <IconShoppingCart size={16} className="text-wbk-gold" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-wbk-brown block">
                {product.parent_category === "beds"
                  ? `${activeProduct.orientation || "Vertical"} Murphy Bed`
                  : product.parent_category || "Wall Bed King"}
              </span>
              <h3 className="font-new-york text-base sm:text-lg text-wbk-black font-semibold truncate max-w-[240px] sm:max-w-xs">
                {product.title || product.name}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-wbk-brown hover:text-wbk-black hover:bg-black/5 rounded-full transition-colors cursor-pointer"
            aria-label="Close"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Product preview box */}
        <div className="p-4 sm:p-5 bg-[#FAF9F7] border-b border-wbk-lightgrey/60 flex items-center gap-3.5">
          <div className="relative w-18 h-18 sm:w-20 sm:h-20 bg-white border border-wbk-lightgrey/70 rounded-xl overflow-hidden shrink-0 p-1 flex items-center justify-center">
            <img
              src={
                activeProduct.image ||
                product.image ||
                "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp"
              }
              alt={activeProduct.name || product.name}
              className="w-full h-full object-contain"
            />
            {pricing.isOnSale && (
              <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-wbk-green text-white text-[9px] font-bold uppercase rounded-xs">
                Sale
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-bold text-lg sm:text-xl text-wbk-black">
                {pricing.display || formatPrice(unitPrice, locale)}
              </span>
              {pricing.isOnSale && (
                <span className="text-xs text-wbk-brown line-through">
                  {pricing.regularDisplay}
                </span>
              )}
            </div>

            <div className="text-xs text-wbk-brown truncate">
              {formatSizeLabel(activeProduct.sizeLabel || activeProduct.size || "Standard", locale)}
            </div>

            {/* In stock badge */}
            <div className="flex items-center gap-1.5 pt-0.5">
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
                  : t("common.inStock", "In Stock • Fast Dispatch")}
              </span>
            </div>
          </div>
        </div>

        {/* Options Body */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[55vh] overflow-y-auto custom-scrollbar">
          {/* Format selector (Vertical / Horizontal) for beds */}
          {formats.length > 1 && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-wbk-black flex items-center justify-between">
                <span>{t("product.orientation", "Orientation")}</span>
                <span className="text-wbk-brown font-normal text-[11px]">
                  {selectedFormat}
                </span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {formats.map((fmt) => {
                  const isSelected =
                    (selectedFormat || "").toLowerCase() === fmt.toLowerCase();
                  return (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => handleSelectFormat(fmt)}
                      className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all cursor-pointer text-center ${
                        isSelected
                          ? "bg-wbk-black text-white border-wbk-black shadow-xs font-semibold"
                          : "bg-white text-wbk-black border-wbk-lightgrey/80 hover:border-wbk-black/60"
                      }`}
                    >
                      {fmt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Pills Selector */}
          {availableSizes.length > 1 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-wbk-black flex items-center justify-between">
                <span>{t("product.size", "Size")}</span>
                <span className="text-wbk-brown font-normal text-[11px]">
                  {formatSizeLabel(activeProduct.sizeLabel || activeProduct.size || "Standard", locale)}
                </span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {availableSizes.map((variant) => {
                  const isSelected =
                    String(variant.rawId || variant.id) ===
                    String(activeProduct.rawId || activeProduct.id);
                  const label = formatSizeLabel(
                    variant.sizeLabel || variant.size || variant.name,
                    locale
                  );
                  const pPrice = getProductPrice(variant, locale);
                  const isVariantOutOfStock =
                    (variant.stock !== undefined &&
                      variant.stock !== null &&
                      Number(variant.stock) <= 0) ||
                    variant.in_stock === false;

                  return (
                    <button
                      key={variant.rawId || variant.id || variant.slug}
                      type="button"
                      onClick={() => handleSelectSize(variant)}
                      className={`p-2.5 text-left rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-wbk-black text-white border-wbk-black shadow-sm"
                          : "bg-white text-wbk-black border-wbk-lightgrey/80 hover:border-wbk-black/60"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 w-full">
                        <span className="text-xs font-medium leading-tight line-clamp-1">
                          {label}
                        </span>
                        {isVariantOutOfStock && (
                          <span
                            className={`text-[9px] font-semibold tracking-tight shrink-0 ${
                              isSelected ? "text-wbk-gold" : "text-wbk-gold"
                            }`}
                          >
                            {t("waitlist.outOfStockShort", "Out of stock")}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[11px] font-semibold mt-1 ${
                          isSelected ? "text-wbk-gold" : "text-wbk-brown"
                        }`}
                      >
                        {pPrice.display}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector & Trust Badges */}
          <div className="pt-2 flex items-center justify-between gap-4 border-t border-wbk-lightgrey/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-wbk-black uppercase tracking-wider">
                {t("cart.quantity", "Qty")}:
              </span>
              <div className="flex items-center border border-wbk-lightgrey/80 rounded-lg overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-8 h-8 flex items-center justify-center text-wbk-black hover:bg-black/5 disabled:opacity-40 transition-colors cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <IconMinus size={13} />
                </button>
                <span className="w-9 text-center text-xs font-semibold text-wbk-black">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 flex items-center justify-center text-wbk-black hover:bg-black/5 transition-colors cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <IconPlus size={13} />
                </button>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-wbk-brown uppercase tracking-wider block">
                {t("common.total", "Total")}
              </span>
              <span className="font-bold text-base text-wbk-black">
                {formatPrice(totalPrice, locale)}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-white border-t border-wbk-lightgrey/60 space-y-2.5">
          {isOutOfStock ? (
            <button
              type="button"
              onClick={() => setIsWaitlistOpen(true)}
              className="w-full py-3.5 px-6 rounded-full text-xs font-semibold uppercase tracking-widest transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer bg-wbk-gold hover:bg-wbk-black text-wbk-black hover:text-white border border-wbk-gold hover:border-wbk-black group"
            >
              <IconBell size={16} className="animate-bounce text-wbk-black group-hover:text-white transition-colors" />
              <span>{t("waitlist.joinWaitlistBtn", "Join Waitlist / Notify Me")}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isAdded}
              className={`w-full py-3.5 px-6 rounded-full text-xs font-semibold uppercase tracking-widest transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                isAdded
                  ? "bg-emerald-600 border-emerald-600 text-white"
                  : "bg-wbk-black hover:bg-wbk-green hover:text-wbk-black text-white"
              }`}
            >
              {isAdded ? (
                <>
                  <IconCheck size={16} />
                  <span>{t("common.addedToCart", "Added to Cart!")}</span>
                </>
              ) : (
                <>
                  <IconShoppingCart size={16} />
                  <span>
                    {t("common.addToCart", "Add to Cart")} • {formatPrice(totalPrice, locale)}
                  </span>
                </>
              )}
            </button>
          )}

          <div className="flex items-center justify-between text-[11px] text-wbk-brown pt-1">
            <div className="flex items-center gap-1.5">
              <IconTruck size={13} className="text-wbk-green" />
              <span>{t("common.freeDelivery", "Free Delivery")}</span>
            </div>
            <Link
              href={fullProductUrl}
              onClick={onClose}
              className="hover:text-wbk-black underline flex items-center gap-1 transition-colors"
            >
              <span>{t("common.viewDetails", "Full product details")}</span>
              <IconArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* Waitlist Modal when opened from QuickAdd */}
      <WaitlistModal
        isOpen={isWaitlistOpen}
        onClose={() => setIsWaitlistOpen(false)}
        product={product}
        selectedVariant={activeProduct}
        productSize={activeProduct?.sizeLabel || activeProduct?.size}
      />
    </div>,
    document.body
  );
}
