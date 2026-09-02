"use client";

import Link from "next/link";

const DEFAULT_COLORS = ["#A5988E", "#D2AA7C", "#E4E0DE", "#090A0A"];

export function ProductCard({ product, className = "" }) {
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
  const link =
    product.link ||
    (product.parent_category && product.slug
      ? `/products/${product.parent_category}/${product.slug}`
      : product.slug
        ? `/products/beds/${product.slug}`
        : `/products/beds/${product.id || "integrated-bed"}`);

  // Image resolution
  const image =
    product.image ||
    "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp";
  const hoverImage =
    product.hoverImage ||
    product.hover_image ||
    "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp";

  // Pricing format
  const rawPrice =
    product.price || (product.price_gbp ? `£${product.price_gbp}` : "£799");
  const priceDisplay = String(rawPrice).startsWith("£")
    ? rawPrice
    : `£${rawPrice}`;
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
      </div>

      {/* Product Text Details */}
      <div className="space-y-2 px-1">
        <h3 className="font-poppins font-medium text-lg text-wbk-black transition-colors duration-200 group-hover:text-wbk-gold line-clamp-1">
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
        <div className="pt-1 text-sm text-wbk-black font-poppins">
          {isFrom ? "from " : ""}
          <span className="font-semibold text-base">{priceDisplay}</span>
          {product.salePrice && product.salePrice !== priceDisplay && (
            <span className="ml-2 text-xs text-wbk-brown line-through font-normal">
              {product.salePrice}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
