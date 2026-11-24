"use client";

import ProductDetailPage from "@/app/[locale]/products/[category]/[product]/page";

/**
 * Wholesale Product Detail Page
 * Reuses the exact original WallBedKing ProductDetailPage (gallery, 3D configurator,
 * variant selectors, specs, installation guides, videos, reviews) in B2B Wholesale mode:
 * - Retail prices are completely hidden
 * - All non-hidden products & variants work regardless of locale or stock === 0
 * - Two-option Add to Cart for Wholesale partners: Single Unit (Net, Excl. VAT) & Full Container
 */
export default function WholesaleProductDetailPage() {
  return <ProductDetailPage isWholesaleMode={true} />;
}
