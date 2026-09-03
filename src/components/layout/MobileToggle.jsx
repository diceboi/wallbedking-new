"use client";

import { useContext } from "react";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { MenuContext } from "@/context/MenuContext";

export function MobileToggle() {
  const { isMobileOpen, openMobileMenu, closeMobileMenu } = useContext(MenuContext);

  const handleClick = () => {
    if (isMobileOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isMobileOpen ? "Close menu" : "Open navigation menu"}
      aria-expanded={isMobileOpen}
      className="xl:hidden w-9 h-9 flex items-center justify-center bg-wbk-white border border-wbk-lightgrey text-wbk-black hover:bg-wbk-black hover:text-wbk-white hover:border-wbk-black transition-colors rounded-full cursor-pointer"
    >
      {isMobileOpen ? <IconX size={19} /> : <IconMenu2 size={19} />}
    </button>
  );
}
