"use client";

import { useContext, useMemo } from "react";
import { MAIN_NAV_ITEMS } from "@/data/navigation";
import { MenuContext } from "@/context/MenuContext";
import { MainMenuItem } from "./MainMenuItem";
import { useLocale } from "@/context/LocaleContext";
import { useProductCatalog } from "@/context/ProductCatalogContext";
import { isProductAvailableInLocale } from "@/lib/products";

export function MainMenu() {
  const { cancelCloseSubmenu, navItems } = useContext(MenuContext);
  const { locale } = useLocale();
  const { allProducts } = useProductCatalog();
  const rawItems = navItems || MAIN_NAV_ITEMS;

  const items = useMemo(() => {
    if (!locale || !allProducts) return rawItems;
    return rawItems.filter((item) => {
      const catKey = item.slug || item.category_id || item.id;
      const catList = allProducts[catKey];
      if (Array.isArray(catList) && catList.length > 0) {
        return catList.some((p) => isProductAvailableInLocale(p, locale));
      }
      return true;
    });
  }, [rawItems, allProducts, locale]);

  return (
    <div
      onMouseEnter={cancelCloseSubmenu}
      className="border-t border-b border-wbk-lightgrey bg-wbk-white relative z-20 h-[50px]"
    >
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-stretch justify-between h-full">
        {/* Main navigation item tabs */}
        <div className="flex items-stretch flex-wrap h-full">
          {items.map((item) => (
            <MainMenuItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
