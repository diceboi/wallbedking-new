"use client";

import { useContext, useEffect, useMemo } from "react";
import { MAIN_NAV_ITEMS, isNavItemAvailableInLocale } from "@/data/navigation";
import { MenuContext } from "@/context/MenuContext";
import { MainMenuItem } from "./MainMenuItem";
import { useLocale } from "@/context/LocaleContext";

export function MainMenu() {
  const { cancelCloseSubmenu, navItems, subMenu, setSubMenu } = useContext(MenuContext);
  const { locale } = useLocale();
  const rawItems = navItems || MAIN_NAV_ITEMS;

  const items = useMemo(() => {
    return rawItems.filter((item) => isNavItemAvailableInLocale(item, locale));
  }, [rawItems, locale]);

  useEffect(() => {
    if (!subMenu) return;
    const isStillVisible = items.some((item) => {
      const submenuKey = item.slug || item.category_id || item.id;
      return submenuKey === subMenu;
    });
    if (!isStillVisible) {
      setSubMenu(null);
    }
  }, [items, subMenu, setSubMenu]);

  return (
    <div
      onMouseEnter={cancelCloseSubmenu}
      className="flex items-stretch h-full"
    >
      {items.map((item) => (
        <MainMenuItem key={item.id} item={item} />
      ))}
    </div>
  );
}
