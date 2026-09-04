"use client";

import { useState, useContext, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
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
import { useLocale } from "@/context/LocaleContext";
import { FlagIcon } from "@/components/ui/FlagIcon";

/* ── Language choices (7 Parallel Markets) ────────────────── */
const LANGUAGES = [
  { code: "en", label: "UK", name: "English (UK)", flag: "🇬🇧" },
  { code: "us", label: "US", name: "English (US $)", flag: "🇺🇸" },
  { code: "de", label: "DE", name: "Deutsch", flag: "🇩🇪" },
  { code: "fr", label: "FR", name: "Français", flag: "🇫🇷" },
  { code: "es", label: "ES", name: "Español", flag: "🇪🇸" },
  { code: "por", label: "POR", name: "Português", flag: "🇵🇹" },
  { code: "it", label: "IT", name: "Italiano", flag: "🇮🇹" },
];

export function Header() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  const [langOpen, setLangOpen] = useState(false);
  const { locale, market, switchLocale, localizedHref, t } = useLocale();
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
  const scrollDeltaAccumulator = useRef(0);
  const isMenuVisibleRef = useRef(true);
  const isTransitioningRef = useRef(false);
  const transitionTimerRef = useRef(null);
  const headerRef = useRef(null);

  // Keep ref synchronized with state
  useEffect(() => {
    isMenuVisibleRef.current = isMenuVisible;
  }, [isMenuVisible]);

  const headerFullHeightRef = useRef(0);

  const updateHeaderHeight = () => {
    if (headerRef.current) {
      const h = Math.round(headerRef.current.getBoundingClientRect().height);
      if (h > 0) {
        if (isMenuVisibleRef.current) {
          headerFullHeightRef.current = h;
        }
        document.documentElement.style.setProperty(
          "--header-height",
          `${h}px`,
        );
      }
    }
  };

  const changeMenuVisibility = (visible) => {
    if (isMenuVisibleRef.current === visible) return;
    isMenuVisibleRef.current = visible;
    setIsMenuVisible(visible);
    if (!visible) setSubMenu(null);

    // Immediately update --header-height to target height so sticky elements animate in exact sync!
    if (typeof window !== "undefined") {
      const isMobile = window.innerWidth < 768;
      const isDesktop = window.innerWidth >= 1280;
      const delta = isMobile ? 52 : isDesktop ? 50 : 0;
      const full =
        headerFullHeightRef.current ||
        (headerRef.current
          ? Math.round(headerRef.current.getBoundingClientRect().height)
          : 144);
      const targetHeight = visible ? full : Math.max(0, full - delta);

      document.documentElement.style.setProperty(
        "--header-height",
        `${targetHeight}px`,
      );
    }

    // Hard lock scroll listener during animation to completely eliminate oscillation feedback loops
    isTransitioningRef.current = true;
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = setTimeout(() => {
      isTransitioningRef.current = false;
      lastScrollY.current = Math.max(0, window.scrollY);
      scrollDeltaAccumulator.current = 0;
      updateHeaderHeight();
    }, 280);
  };

  useEffect(() => {
    updateHeaderHeight();

    const ro = new ResizeObserver(() => {
      // Only update if not actively transitioning to prevent mid-animation thrashing
      if (!isTransitioningRef.current) {
        updateHeaderHeight();
      }
    });

    if (headerRef.current) {
      ro.observe(headerRef.current);
    }

    window.addEventListener("resize", updateHeaderHeight);
    return () => {
      ro.disconnect();
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      window.removeEventListener("resize", updateHeaderHeight);
    };
  }, []);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = Math.max(0, window.scrollY);

          // If currently animating transition, do not evaluate state changes!
          if (isTransitioningRef.current) {
            lastScrollY.current = currentScrollY;
            ticking = false;
            return;
          }

          // Never collapse header while user is searching or typing!
          if (isSearchOpen) {
            changeMenuVisibility(true);
            lastScrollY.current = currentScrollY;
            scrollDeltaAccumulator.current = 0;
            ticking = false;
            return;
          }

          // Top zone: Always keep header fully visible near top of page
          if (currentScrollY <= 40) {
            changeMenuVisibility(true);
            scrollDeltaAccumulator.current = 0;
          } else {
            const stepDiff = currentScrollY - lastScrollY.current;

            if (stepDiff > 0) {
              // Scrolling down
              if (scrollDeltaAccumulator.current < 0) {
                scrollDeltaAccumulator.current = 0;
              }
              scrollDeltaAccumulator.current += stepDiff;

              // Collapse only after a definite cumulative downward scroll of >= 30px past 100px
              if (
                scrollDeltaAccumulator.current >= 30 &&
                currentScrollY > 100
              ) {
                changeMenuVisibility(false);
              }
            } else if (stepDiff < 0) {
              // Scrolling up
              if (scrollDeltaAccumulator.current > 0) {
                scrollDeltaAccumulator.current = 0;
              }
              scrollDeltaAccumulator.current += stepDiff;

              // Reveal only after a clear, deliberate cumulative upward scroll of >= 60px
              if (scrollDeltaAccumulator.current <= -60) {
                changeMenuVisibility(true);
              }
            }
          }

          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [setSubMenu, isSearchOpen]);

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
        style={{ position: "sticky", top: 0 }}
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
              href={localizedHref("/")}
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
              href={localizedHref("/configurator")}
              className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-2 bg-wbk-green hover:bg-wbk-black border border-wbk-green hover:border-wbk-black text-wbk-white text-xs font-medium tracking-[0.14em] uppercase transition-colors shadow-xs rounded-full"
            >
              <Icon3dCubeSphere size={15} />
              <span>{t("header.configuratorCta", "Configurator")}</span>
            </Link>

            {/* Language Selector Dropdown */}
            <div
              className="relative hidden sm:block"
              onMouseEnter={() => setLangOpen(true)}
              onMouseLeave={() => setLangOpen(false)}
            >
              <button
                type="button"
                className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-wbk-black hover:text-wbk-green py-1 transition-colors cursor-pointer"
                aria-label="Select language"
              >
                <FlagIcon country={locale} size={16} />
                <span>{market?.label || "UK"}</span>
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
                    className="absolute right-0 top-full mt-1 min-w-[110px] bg-wbk-white shadow-lg border border-wbk-lightgrey py-1 z-50 rounded-none"
                  >
                    {LANGUAGES.map((lang) => {
                      const isSelected = locale === lang.code;
                      return (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => {
                            switchLocale(lang.code);
                            setLangOpen(false);
                          }}
                          className={`flex items-center gap-2.5 w-full px-3 py-1.5 text-left text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer ${
                            isSelected
                              ? "text-wbk-green font-semibold bg-[#F4F2F0]"
                              : "text-wbk-black hover:text-wbk-green hover:bg-[#FBF9F8]"
                          }`}
                        >
                          <FlagIcon country={lang.code} size={16} />
                          <span>{lang.label}</span>
                        </button>
                      );
                    })}
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
            paddingTop: isMenuVisible ? 8 : 0,
            paddingBottom: isMenuVisible ? 8 : 0,
          }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          onAnimationComplete={updateHeaderHeight}
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
          onAnimationComplete={updateHeaderHeight}
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
