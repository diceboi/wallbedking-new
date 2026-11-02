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
} from "@tabler/icons-react";
import { ContactInfo } from "./ContactInfo";
import { SearchBar } from "./SearchBar";
import { MainMenu } from "./MainMenu";
import { Submenu } from "./Submenu";
import { SubmenuSplitTest } from "./SubmenuSplitTest";
import { useDesktopMenuABTest } from "@/hooks/useDesktopMenuABTest";
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
  const isAdminRoute = pathname?.startsWith("/admin");
  const menuVariant = useDesktopMenuABTest();

  const [langOpen, setLangOpen] = useState(false);
  const { locale, market, switchLocale, localizedHref } = useLocale();
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
        document.documentElement.style.setProperty("--header-height", `${h}px`);
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
      const delta = isMobile ? 56 : 0;
      const full =
        headerFullHeightRef.current ||
        (headerRef.current
          ? Math.round(headerRef.current.getBoundingClientRect().height)
          : isMobile
            ? 112
            : 64);
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
    if (isAdminRoute) return;
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
  }, [isAdminRoute]);

  useEffect(() => {
    if (isAdminRoute) return;
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

          // Ignore scroll events during body lock or synthetic layout shifts
          if (
            typeof document !== "undefined" &&
            document.body.style.overflow === "hidden"
          ) {
            lastScrollY.current = currentScrollY;
            ticking = false;
            return;
          }

          // Top zone: Always keep header fully visible near top of page
          if (currentScrollY <= 40) {
            changeMenuVisibility(true);
            scrollDeltaAccumulator.current = 0;
          } else {
            const stepDiff = currentScrollY - lastScrollY.current;

            // Disregard abrupt artificial jumps (>250px) caused by modal open/close or layout shifts
            if (Math.abs(stepDiff) > 250) {
              lastScrollY.current = currentScrollY;
              scrollDeltaAccumulator.current = 0;
              ticking = false;
              return;
            }

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

  if (isAdminRoute) return null;

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
        onMouseLeave={() => setSubMenu(null)}
      >
        {/* Single-row primary header bar */}
        <div className="w-full mx-auto px-4 sm:px-6 xl:px-6 2xl:px-8 h-14 sm:h-16 xl:h-[64px] flex items-center justify-between gap-3 xl:gap-4 2xl:gap-6 relative z-30 bg-wbk-white border-b border-wbk-lightgrey">
          {/* Left section: Logo + optional Contact Info */}
          <div className="flex items-center gap-4 shrink-0">
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
                className="h-6 sm:h-7 w-auto"
              />
            </Link>
            <ContactInfo />
          </div>

          {/* Desktop Main Menu (between Logo and SearchBar) */}
          <nav
            aria-label="Main navigation"
            className="hidden xl:flex items-stretch h-full shrink-0"
            onMouseEnter={cancelCloseSubmenu}
            onMouseLeave={() => scheduleCloseSubmenu(160)}
          >
            <MainMenu />
          </nav>

          {/* Tablet Full-Height Borderless SearchBar (md to < xl) */}
          <div className="hidden md:flex xl:hidden flex-1 items-stretch h-full max-w-md mx-2 min-w-0">
            <SearchBar compact />
          </div>

          {/* Desktop Full-Height Borderless SearchBar (xl+) */}
          <div className="hidden xl:flex flex-1 items-stretch justify-end h-full min-w-[150px]">
            <div className="w-full max-w-[235px] 2xl:max-w-[300px] h-full">
              <SearchBar compact />
            </div>
          </div>

          {/* Right section: Language, Account, Cart, MobileToggle */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
            {/* Language Selector Dropdown */}
            <div
              className="relative hidden sm:block"
              onMouseEnter={() => {
                setSubMenu(null);
                setLangOpen(true);
              }}
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

            {/* User Account - Always visible in small circle before cart */}
            <button
              type="button"
              onClick={() => openUserDrawer()}
              aria-label={user ? "Your account" : "Sign in"}
              className="flex items-center justify-center cursor-pointer transition-transform active:scale-95"
            >
              {user ? (
                <div className="w-7 h-7 rounded-full bg-wbk-black text-wbk-white text-xs font-semibold flex items-center justify-center border border-wbk-gold shadow-2xs hover:border-wbk-green transition-colors">
                  {(
                    user.user_metadata?.full_name?.[0] ||
                    user.email?.[0] ||
                    "U"
                  ).toUpperCase()}
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-white hover:border-wbk-green hover:bg-[#FBF9F8] flex items-center justify-center text-wbk-black hover:text-wbk-green transition-colors">
                  <IconUser size={18} strokeWidth={1.75} />
                </div>
              )}
            </button>

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

            {/* Mobile Navigation Toggle */}
            <MobileToggle />
          </div>
        </div>

        {/* Mobile Search Row (< md screens) */}
        <motion.div
          className="md:hidden px-4 border-b border-wbk-lightgrey bg-wbk-white relative z-20"
          initial={false}
          animate={{
            height: isMenuVisible ? 56 : 0,
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

        {/* Desktop Mega Submenu (Anchored to bottom of single-row header; PostHog A/B test untouched) */}
        <div
          className="hidden xl:block relative z-20 bg-wbk-white"
          onMouseEnter={cancelCloseSubmenu}
          onMouseLeave={() => setSubMenu(null)}
        >
          {menuVariant === "test" ? <SubmenuSplitTest /> : <Submenu />}
        </div>
      </header>

      {/* Slide-out Mobile Menu Drawer */}
      <MobileMenuDrawer />
    </>
  );
}
