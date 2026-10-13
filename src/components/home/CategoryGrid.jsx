"use client";

import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import { useCategories } from "@/context/CategoriesContext";
import { getLocalizedCategoryTitle } from "@/lib/categories-utils";

const getGridBorderClass = (idx, total) => {
  const isLeft = idx % 2 === 0;
  const isLastRowDesktop = idx >= total - 2;
  const isLastMobile = idx === total - 1;

  let classes = "col-span-6 md:col-span-3 border-wbk-lightgrey/40";
  if (!isLastMobile) {
    classes += " border-b";
  }
  if (isLastRowDesktop) {
    classes += " md:border-b-0";
  }
  if (isLeft) {
    classes += " md:border-r";
  }
  return classes;
};

export function CategoryGrid() {
  const { t, localizedHref, locale } = useLocale();
  const { featuredCategories } = useCategories();
  const total = featuredCategories.length;

  return (
    <section className="w-full bg-wbk-white">
      <div className="grid grid-cols-6 gap-1 w-full">
        {featuredCategories.map((cat, idx) => {
          const href = cat.href || (cat.slug?.startsWith("/") ? cat.slug : `/products/${cat.slug || cat.id}`);
          const imageSrc = cat.grid_image || cat.image || `/category-images/${cat.id}.webp`;
          const title = getLocalizedCategoryTitle(cat, locale) || t(`categories.${cat.key}`, cat.title || cat.name);
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
