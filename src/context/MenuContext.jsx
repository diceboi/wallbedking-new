"use client";

import { createContext, useRef, useState, useCallback, useEffect } from "react";

export const MenuContext = createContext({
  // Desktop mega-submenu
  subMenu: null,
  setSubMenu: () => {},
  cancelCloseSubmenu: () => {},
  scheduleCloseSubmenu: () => {},

  // Unified drawer system
  activeDrawer: null, // null | 'mobile' | 'cart' | 'user'
  setActiveDrawer: () => {},
  closeDrawer: () => {},

  // Mobile menu compatibility
  isMobileOpen: false,
  openMobileMenu: () => {},
  closeMobileMenu: () => {},
});

export function MenuContextProvider({ children }) {
  // --- Desktop submenu ---
  const [subMenu, setSubMenuState] = useState(null);
  const closeTimeoutRef = useRef(null);

  const setSubMenu = useCallback((slug) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setSubMenuState(slug ?? null);
  }, []);

  const scheduleCloseSubmenu = useCallback((delayMs = 500) => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setSubMenuState(null);
      closeTimeoutRef.current = null;
    }, delayMs);
  }, []);

  const cancelCloseSubmenu = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  // --- Unified drawer system ---
  const [activeDrawer, setActiveDrawer] = useState(null);

  const closeDrawer = useCallback(() => setActiveDrawer(null), []);

  const isMobileOpen = activeDrawer === "mobile";
  const openMobileMenu = useCallback(() => setActiveDrawer("mobile"), []);
  const closeMobileMenu = closeDrawer;

  // Body scroll lock when any drawer is active
  useEffect(() => {
    if (activeDrawer) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [activeDrawer]);

  return (
    <MenuContext.Provider
      value={{
        subMenu,
        setSubMenu,
        scheduleCloseSubmenu,
        cancelCloseSubmenu,
        activeDrawer,
        setActiveDrawer,
        closeDrawer,
        isMobileOpen,
        openMobileMenu,
        closeMobileMenu,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
}
