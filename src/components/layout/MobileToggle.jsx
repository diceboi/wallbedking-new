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
      className="xl:hidden w-9 h-9 flex items-center justify-center text-wbk-black hover:text-wbk-green transition-colors cursor-pointer"
    >
      {isMobileOpen ? <IconX size={21} /> : <IconMenu2 size={21} />}
    </button>
  );
}
