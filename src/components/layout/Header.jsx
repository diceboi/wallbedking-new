"use client";

import { useState, useContext, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  IconShoppingBag,
  IconUser,
  IconChevronDown,
  Icon3dCubeSphere,
} from "@tabler/icons-react";
import { TopMenu } from "./TopMenu";
import { ContactInfo } from "./ContactInfo";
import { SearchBar } from "./SearchBar";
import { MainMenu } from "./MainMenu";
import { Submenu } from "./Submenu";
import { MobileToggle } from "./MobileToggle";
import { MobileMenuDrawer } from "./MobileMenuDrawer";
import { MenuContext } from "@/context/MenuContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

/* ── Language choices ────────────────────────────────────── */
const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "hu", label: "HU" },
  { code: "de", label: "DE" },
];

export function Header() {
  const [langOpen, setLangOpen] = useState(false);
  const [activeLang, setActiveLang] = useState("EN");
  const { totalItems, openCart } = useCart();
  const { user, openUserDrawer } = useAuth();
  const {
    subMenu,
    setSubMenu,
    cancelCloseSubmenu,
    scheduleCloseSubmenu,
    isMenuVisible,
    setIsMenuVisible,
    isSearchOpen,
  } = useContext(MenuContext);
  const lastScrollY = useRef(0);
  const headerRef = useRef(null);

  const updateHeaderHeight = () => {
    if (headerRef.current) {
      const h = headerRef.current.getBoundingClientRect().height;
      if (h > 0) {
        document.documentElement.style.setProperty(
          "--header-height",
          `${Math.round(h)}px`,
        );
      }
    }
  };

  useEffect(() => {
    updateHeaderHeight();

    const ro = new ResizeObserver(() => {
      updateHeaderHeight();
    });

    if (headerRef.current) {
      ro.observe(headerRef.current);
    }

    window.addEventListener("resize", updateHeaderHeight);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateHeaderHeight);
    };
  }, []);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // Never collapse header while user is searching or typing!
          if (isSearchOpen) {
            setIsMenuVisible(true);
            lastScrollY.current = currentScrollY;
            updateHeaderHeight();
            ticking = false;
            return;
          }

          // Always visible at the top of the page
          if (currentScrollY < 60) {
            setIsMenuVisible(true);
          } else {
            const diff = currentScrollY - lastScrollY.current;

            // Scroll down threshold (> 15px) -> hide behind upper bar
            if (diff > 15) {
              setIsMenuVisible(false);
              setSubMenu(null);
            }
            // Scroll up threshold (< -15px) -> show category bar
            else if (diff < -15) {
              setIsMenuVisible(true);
            }
          }

          lastScrollY.current = currentScrollY;
          updateHeaderHeight();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [setSubMenu, isSearchOpen, setIsMenuVisible]);

  return (
    <>
      {/* Dimmed backdrop when mega submenu is open */}
      <AnimatePresence>
        {subMenu && (
          <motion.div
            key="submenu-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSubMenu(null)}
            className="fixed inset-0 z-40 bg-wbk-black/20 backdrop-blur-[1px] hidden xl:block"
          />
        )}
      </AnimatePresence>

      <header
        ref={headerRef}
        className="sticky top-0 z-50 w-full bg-wbk-white font-poppins"
      >
        {/* Top announcement & quick links bar */}
        <TopMenu />

        {/* Primary header bar */}
        <div
          className={`w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4 lg:gap-8 relative z-30 bg-wbk-white transition-all duration-200 ${
            !isMenuVisible ? "border-b border-wbk-lightgrey " : ""
          }`}
        >
          {/* Left section: Logo + Contact Info */}
          <div className="flex items-center gap-6 shrink-0">
            <Link
              href="/"
              className="shrink-0 flex items-center"
              aria-label="WallBedKing home"
            >
              <Image
                src="/logos/WBK-Logo-Gold-Black.svg"
                alt="WallBedKing"
                width={150}
                height={34}
                priority
                className="h-7 sm:h-8 w-auto"
              />
            </Link>
            <ContactInfo />
          </div>

          {/* Center: Live instant product search */}
          <div className="hidden md:flex flex-1 justify-center max-w-md">
            <SearchBar />
          </div>

          {/* Right section: CTA, Language, Cart, Account, MobileToggle */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* 3D Configurator CTA */}
            <Link
              href="/products/beds/integrated-vertical-wall-bed"
              className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-2 bg-wbk-green hover:bg-wbk-black border border-wbk-green hover:border-wbk-black text-wbk-white text-xs font-medium tracking-[0.14em] uppercase transition-colors shadow-xs"
            >
              <Icon3dCubeSphere size={15} />
              <span>Configurator</span>
            </Link>

            {/* Language Selector Dropdown */}
            <div
              className="relative hidden sm:block"
              onMouseEnter={() => setLangOpen(true)}
              onMouseLeave={() => setLangOpen(false)}
            >
              <button
                type="button"
                className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-wbk-black hover:text-wbk-green py-1 transition-colors"
                aria-label="Select language"
              >
                <span>{activeLang}</span>
                <IconChevronDown
                  size={12}
                  className={`transition-transform duration-200 ${
                    langOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>

              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1 min-w-[70px] bg-wbk-white shadow-lg border border-wbk-lightgrey py-1 z-50 rounded-none"
                  >
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          setActiveLang(lang.label);
                          setLangOpen(false);
                        }}
                        className={`block w-full px-3 py-1.5 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                          activeLang === lang.label
                            ? "text-wbk-green font-semibold bg-[#F4F2F0]"
                            : "text-wbk-black hover:text-wbk-green hover:bg-[#FBF9F8]"
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart Button */}
            <button
              type="button"
              onClick={openCart}
              aria-label={`Shopping cart with ${totalItems} items`}
              className="relative p-1.5 text-wbk-black hover:text-wbk-green transition-colors cursor-pointer"
            >
              <IconShoppingBag size={21} strokeWidth={1.5} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 px-1 items-center justify-center bg-wbk-gold text-[9px] font-bold text-wbk-black rounded-full shadow-xs animate-in zoom-in-50 duration-200">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Account */}
            <button
              type="button"
              onClick={() => openUserDrawer()}
              aria-label={user ? "Your account" : "Sign in"}
              className="p-1.5 text-wbk-black hover:text-wbk-green transition-colors hidden sm:flex items-center relative cursor-pointer"
            >
              {user ? (
                <div className="w-7 h-7 rounded-full bg-wbk-black text-wbk-white text-[11px] font-semibold flex items-center justify-center border border-wbk-gold shadow-2xs">
                  {(
                    user.user_metadata?.full_name?.[0] ||
                    user.email?.[0] ||
                    "U"
                  ).toUpperCase()}
                </div>
              ) : (
                <IconUser size={21} strokeWidth={1.5} />
              )}
            </button>

            {/* Mobile Navigation Toggle */}
            <MobileToggle />
          </div>
        </div>

        {/* Mobile Search Row (< md screens) */}
        <motion.div
          className="md:hidden px-4 border-t border-wbk-lightgrey/60 bg-wbk-white relative z-30"
          initial={false}
          animate={{
            height: isMenuVisible ? 52 : 0,
            opacity: isMenuVisible ? 1 : 0,
            paddingTop: isMenuVisible ? 4 : 0,
            paddingBottom: isMenuVisible ? 12 : 0,
          }}
          transition={{ duration: 0.25 }}
          onUpdate={updateHeaderHeight}
          style={{
            overflow: isMenuVisible ? "visible" : "hidden",
          }}
        >
          <SearchBar />
        </motion.div>

        {/* Desktop Category Navigation & Animated Mega Submenu */}
        <motion.div
          className="hidden xl:block relative z-20 bg-wbk-white"
          initial={false}
          animate={{
            height: isMenuVisible ? 50 : 0,
            y: isMenuVisible ? 0 : -50,
            opacity: isMenuVisible ? 1 : 0,
          }}
          transition={{
            duration: 0.25,
            ease: [0.25, 1, 0.5, 1],
          }}
          onUpdate={updateHeaderHeight}
          style={{
            overflow: isMenuVisible ? "visible" : "hidden",
          }}
          onMouseEnter={cancelCloseSubmenu}
          onMouseLeave={() => setSubMenu(null)}
        >
          <MainMenu />
          <Submenu />
        </motion.div>
      </header>

      {/* Slide-out Mobile Menu Drawer */}
      <MobileMenuDrawer />
    </>
  );
}
