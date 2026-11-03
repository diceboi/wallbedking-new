"use client";

import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import { useLocale } from "@/context/LocaleContext";
import { getLocalizedCategoryTitle } from "@/lib/categories-utils";

export function getCategoryTileImage(cat) {
  if (!cat) {
    return "/product-images/tables/b2473m-transformer-storage-shelf-to-dining-table/transformer-storage-shelf-to-dining-table070015e9-9b6d-43bb-bb5d-3c35b18ed648.webp";
  }
  const catId = String(cat.id || cat.slug || "").toLowerCase();

  // Smart & Transforming Tables: guarantee authentic table photography, never a bed
  if (catId === "tables" || catId.includes("table")) {
    const candidate = cat.grid_image || cat.image;
    if (candidate && !candidate.includes("MORPHY-Bed") && (candidate.includes("table") || candidate.includes("tables"))) {
      return candidate;
    }
    return "/product-images/tables/b2473m-transformer-storage-shelf-to-dining-table/transformer-storage-shelf-to-dining-table070015e9-9b6d-43bb-bb5d-3c35b18ed648.webp";
  }

  if (cat.grid_image) return cat.grid_image;
  if (cat.image) return cat.image;

  const defaults = {
    "morphy-beds": "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/CategoryImages/morphy-beds.webp",
    "traditional-beds": "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/CategoryImages/traditional-beds.webp",
    cabinets: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/CategoryImages/cabinets.webp",
    mattresses: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/CategoryImages/mattresses.webp",
    tables: "/product-images/tables/b2473m-transformer-storage-shelf-to-dining-table/transformer-storage-shelf-to-dining-table070015e9-9b6d-43bb-bb5d-3c35b18ed648.webp",
    beds: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/CategoryImages/morphy-beds.webp",
  };

  return defaults[catId] || `/category-images/${cat.id}.webp`;
}

/**
 * CategoryTileGrid
 * Renders category cards matching the editorial layout:
 * - Full-bleed background imagery with smooth zoom on hover
 * - Warm gradient overlay for maximum contrast and elegance
 * - Classic New York serif typography
 * - Responsive grid: default 4 items in a row on desktop (lg:grid-cols-4)
 */
export function CategoryTileGrid({
  categories = [],
  className = "",
  columns = 4,
  cardHeight = "h-[300px] sm:h-[340px] lg:h-[380px]",
}) {
  const { t, localizedHref, locale } = useLocale();

  if (!categories || categories.length === 0) return null;

  const gridClass =
    columns === 4
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      : columns === 2
      ? "grid-cols-1 md:grid-cols-2"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={`grid ${gridClass} gap-4 sm:gap-6 w-full ${className}`}>
      {categories.map((cat, idx) => {
        const href =
          cat.href ||
          (cat.slug?.startsWith("/")
            ? cat.slug
            : `/products/${cat.slug || cat.id}`);

        const imageSrc = getCategoryTileImage(cat);
        const title =
          getLocalizedCategoryTitle(cat, locale) ||
          (cat.titleKey
            ? t(cat.titleKey, cat.title || cat.name || cat.label)
            : t(`categories.${cat.key || cat.slug || cat.id}`, cat.title || cat.name || cat.label));

        return (
          <Link
            key={cat.id || cat.slug || idx}
            href={localizedHref(href)}
            className={`group relative block w-full overflow-hidden ${cardHeight} bg-[#F4F2F0]`}
          >
            {/* Background Photography with smooth hover zoom */}
            <img
              src={imageSrc}
              alt={title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              loading="lazy"
            />

            {/* Subtle warm gradient starting from top-left for clear readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#F4F2F0]/85 via-[#F4F2F0]/40 to-transparent z-10 pointer-events-none" />

            {/* Editorial Content Overlay */}
            <div className="relative z-20 h-full w-full p-6 sm:p-7 lg:p-8 flex flex-col justify-between items-start">
              <h3 className="font-new-york text-xl sm:text-2xl lg:text-2xl xl:text-3xl text-wbk-black leading-tight tracking-wide">
                {title}
              </h3>

              {/* Round action button matching the cart button style */}
              <div
                className="w-10 h-10 rounded-full border border-wbk-black bg-wbk-black group-hover:bg-wbk-green group-hover:border-wbk-green text-white group-hover:text-wbk-black flex items-center justify-center transition-all duration-300 shadow-sm group-hover:shadow-md shrink-0"
                aria-hidden="true"
              >
                <IconArrowRight
                  size={18}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

