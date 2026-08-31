"use client";

import { useContext } from "react";
import { MAIN_NAV_ITEMS } from "@/data/navigation";
import { MenuContext } from "@/context/MenuContext";
import { MainMenuItem } from "./MainMenuItem";

export function MainMenu() {
  const { cancelCloseSubmenu } = useContext(MenuContext);

  return (
    <div
      onMouseEnter={cancelCloseSubmenu}
      className="border-t border-b border-wbk-lightgrey bg-wbk-white relative z-20 h-[50px]"
    >
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-stretch justify-between h-full">
        {/* Main navigation item tabs */}
        <div className="flex items-stretch flex-wrap h-full">
          {MAIN_NAV_ITEMS.map((item) => (
            <MainMenuItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
