"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import { useCategories } from "@/context/CategoriesContext";
import { useProductCatalog } from "@/context/ProductCatalogContext";
import { isProductAvailableInLocale } from "@/lib/products";
import { getLocalizedCategoryTitle } from "@/lib/categories-utils";
import { getCategoryTileImage } from "@/components/ui/CategoryTileGrid";

const getGridBorderClass = (idx, total) => {
  const isOddTotal = total % 2 === 1 && total >= 5;
  const inLastThreeRow = isOddTotal && idx >= total - 3;

  const colSpanClass = inLastThreeRow
    ? "col-span-6 md:col-span-2"
    : "col-span-6 md:col-span-3";

  const isLastMobile = idx === total - 1;
  const isLastRowDesktop = inLastThreeRow ? true : idx >= total - 2;
  const needsRightBorder = inLastThreeRow
    ? idx < total - 1
    : idx % 2 === 0;

  let classes = `${colSpanClass} border-wbk-lightgrey/40`;
  if (!isLastMobile) {
    classes += " border-b";
  }
  if (isLastRowDesktop) {
    classes += " md:border-b-0";
  }
  if (needsRightBorder) {
    classes += " md:border-r";
  }
  return classes;
};

export function CategoryGrid() {
  const { t, localizedHref, locale } = useLocale();
  const { categories, featuredCategories } = useCategories();
  const { allProducts } = useProductCatalog();

  const displayCategories = useMemo(() => {
    const list = categories && categories.length > 0 ? categories : featuredCategories;
    const available = list.filter((cat) => {
      if (cat.is_visible === false) return false;
      const catKey = cat.id || cat.slug;
      if (allProducts && allProducts[catKey] && locale) {
        const catProds = allProducts[catKey];
        if (Array.isArray(catProds)) {
          if (catProds.length === 0) return false;
          const hasAvailable = catProds.some((p) => isProductAvailableInLocale(p, locale));
          if (!hasAvailable) return false;
        }
      }
      return true;
    });

    const sorted = [...available].sort(
      (a, b) => (a.display_order ?? 999) - (b.display_order ?? 999)
    );
    const featured = sorted.filter((c) => c.is_featured !== false);
    return featured.length >= 4 ? featured : sorted;
  }, [categories, featuredCategories, allProducts, locale]);

  const total = displayCategories.length;

  return (
    <section className="w-full bg-wbk-white">
      <div className="container m-auto grid grid-cols-6 gap-1 w-full">
        {displayCategories.map((cat, idx) => {
          const href =
            cat.href ||
            (cat.slug?.startsWith("/")
              ? cat.slug
              : `/products/${cat.slug || cat.id}`);
          const imageSrc = getCategoryTileImage(cat);
          const title =
            getLocalizedCategoryTitle(cat, locale) ||
            t(`categories.${cat.key}`, cat.title || cat.name);
          const borderClass = getGridBorderClass(idx, total);

          return (
            <Link
              key={cat.id || idx}
              href={localizedHref(href)}
              className={`group relative block w-full overflow-hidden h-[340px] md:h-[420px] bg-[#F4F2F0] ${borderClass}`}
            >
              {/* Background Image */}
              <img
                src={imageSrc}
                alt={title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Subtle warm brown gradient starting from top-left */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#F4F2F0]/75 to-transparent z-10 pointer-events-none" />

              {/* Text Overlay */}
              <div className="relative z-20 h-full w-full p-10 md:p-12 flex flex-col justify-start items-start">
                <h3 className="font-new-york text-3xl md:text-4xl text-wbk-black leading-tight tracking-wide transition-colors duration-300">
                  {title}
                </h3>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
