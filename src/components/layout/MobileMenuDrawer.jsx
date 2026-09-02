"use client";

import { useState, useContext, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  IconChevronLeft,
  IconChevronRight,
  IconX,
  IconShoppingBag,
  IconUser,
  IconPhone,
  Icon3dCubeSphere,
  IconTruck,
  IconShieldCheck,
  IconTools,
} from "@tabler/icons-react";
import { MenuContext } from "@/context/MenuContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { MAIN_NAV_ITEMS, SUBMENU_DATA } from "@/data/navigation";

export function MobileMenuDrawer() {
  const { isMobileOpen, closeMobileMenu } = useContext(MenuContext);
  const { totalItems, openCart } = useCart();
  const { user, openUserDrawer } = useAuth();

  // Navigation depth: 0 = Top menu, 1 = Category details
  const [level, setLevel] = useState(0);
  const [direction, setDirection] = useState(1);
  const [activeCategorySlug, setActiveCategorySlug] = useState(null);

  // Reset level when opened/closed
  useEffect(() => {
    if (isMobileOpen) {
      setLevel(0);
      setActiveCategorySlug(null);
    }
  }, [isMobileOpen]);

  const pageVariants = {
    enter: (dir) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  const pageTransition = { type: "tween", duration: 0.25, ease: "easeInOut" };

  const goToCategory = (slug) => {
    setDirection(1);
    setActiveCategorySlug(slug);
    setLevel(1);
  };

  const goBack = () => {
    setDirection(-1);
    setLevel(0);
  };

  const activeCategoryData = activeCategorySlug ? SUBMENU_DATA[activeCategorySlug] : null;

  return (
    <AnimatePresence>
      {isMobileOpen && (
        <div className="fixed inset-0 z-[999] xl:hidden flex">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeMobileMenu}
            className="fixed inset-0 bg-wbk-black/60 backdrop-blur-xs"
          />

          {/* Slide-in drawer */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="relative ml-auto w-full max-w-[340px] sm:max-w-[380px] h-full bg-wbk-white border-l border-wbk-lightgrey flex flex-col z-10 font-poppins"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between h-14 px-4 border-b border-wbk-lightgrey bg-[#FBF9F8]">
              {level === 0 ? (
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-wbk-black">
                  Navigation Menu
                </span>
              ) : (
                <button
                  type="button"
                  onClick={goBack}
                  className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-wbk-black hover:text-wbk-green p-1 transition-colors"
                >
                  <IconChevronLeft size={16} />
                  <span>Back</span>
                </button>
              )}

              <button
                type="button"
                onClick={closeMobileMenu}
                className="w-8 h-8 flex items-center justify-center border border-wbk-lightgrey bg-white text-wbk-black hover:bg-wbk-black hover:text-white transition-colors"
                aria-label="Close menu"
              >
                <IconX size={16} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="relative flex-1 overflow-y-auto">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                {level === 0 ? (
                  /* ── Level 0: Main Navigation ── */
                  <motion.div
                    key="level-0"
                    custom={direction}
                    variants={pageVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={pageTransition}
                    className="flex flex-col divide-y divide-wbk-lightgrey/70"
                  >
                    {/* Catalog Categories */}
                    {MAIN_NAV_ITEMS.map((item) => {
                      const hasSub = item.hasSubmenu && SUBMENU_DATA[item.slug];
                      return (
                        <div
                          key={item.id}
                          className="flex items-stretch justify-between bg-wbk-white hover:bg-[#FBF9F8] transition-colors"
                        >
                          <Link
                            href={item.href}
                            onClick={closeMobileMenu}
                            className="flex-1 py-3.5 px-4 text-xs font-medium uppercase tracking-[0.14em] text-wbk-black hover:text-wbk-green transition-colors"
                          >
                            {item.title}
                          </Link>

                          {hasSub && (
                            <button
                              type="button"
                              onClick={() => goToCategory(item.slug)}
                              className="px-4 border-l border-wbk-lightgrey/60 text-wbk-brown hover:text-wbk-green hover:bg-[#F4F2F0] flex items-center justify-center transition-colors"
                              aria-label={`Open ${item.title} subcategories`}
                            >
                              <IconChevronRight size={16} />
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {/* 3D Configurator CTA */}
                    <div className="p-4 bg-[#F4F2F0]">
                      <Link
                        href="/products/beds/integrated-vertical-wall-bed"
                        onClick={closeMobileMenu}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-wbk-green text-wbk-white hover:bg-wbk-black text-xs font-medium uppercase tracking-[0.14em] shadow-sm transition-colors"
                      >
                        <Icon3dCubeSphere size={16} />
                        <span>Interactive 3D Configurator</span>
                      </Link>
                    </div>

                    {/* User & Cart shortcuts */}
                    <div className="grid grid-cols-2 divide-x divide-wbk-lightgrey/70 bg-wbk-white">
                      <button
                        type="button"
                        onClick={() => {
                          closeMobileMenu();
                          openCart();
                        }}
                        className="flex items-center justify-center gap-2 py-3 px-2 text-xs font-medium uppercase tracking-wider text-wbk-black hover:text-wbk-green cursor-pointer"
                      >
                        <IconShoppingBag size={17} strokeWidth={1.5} />
                        <span>Cart ({totalItems})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          closeMobileMenu();
                          openUserDrawer();
                        }}
                        className="flex items-center justify-center gap-2 py-3 px-2 text-xs font-medium uppercase tracking-wider text-wbk-black hover:text-wbk-green cursor-pointer"
                      >
                        {user ? (
                          <div className="w-5 h-5 rounded-full bg-wbk-black text-white text-[10px] flex items-center justify-center font-semibold">
                            {(user.user_metadata?.full_name?.[0] || user.email?.[0] || "U").toUpperCase()}
                          </div>
                        ) : (
                          <IconUser size={17} strokeWidth={1.5} />
                        )}
                        <span className="truncate max-w-[100px]">
                          {user ? (user.user_metadata?.full_name?.split(" ")[0] || "Account") : "Account"}
                        </span>
                      </button>
                    </div>

                    {/* Quick Call */}
                    <div className="p-4 bg-wbk-white">
                      <a
                        href="tel:08000288940"
                        className="flex items-center gap-3 p-3 border border-wbk-lightgrey bg-[#FBF9F8] hover:border-wbk-gold transition-colors"
                      >
                        <div className="w-8 h-8 flex items-center justify-center bg-wbk-black text-white shrink-0">
                          <IconPhone size={15} />
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-semibold tracking-wider text-wbk-brown">
                            Need Assistance?
                          </div>
                          <div className="text-xs font-medium text-wbk-black">
                            0800 028 8940 (Mon-Fri 9-17)
                          </div>
                        </div>
                      </a>
                    </div>

                    {/* Secondary Information & Support Links */}
                    <div className="px-4 py-3 bg-[#FBF9F8] border-t border-wbk-lightgrey flex items-center justify-around text-xs text-wbk-brown font-medium">
                      <Link
                        href="/support/faq"
                        onClick={closeMobileMenu}
                        className="hover:text-wbk-black transition-colors py-1"
                      >
                        FAQ
                      </Link>
                      <span className="text-wbk-lightgrey">|</span>
                      <Link
                        href="/support/installation-guides"
                        onClick={closeMobileMenu}
                        className="hover:text-wbk-black transition-colors py-1"
                      >
                        Installation
                      </Link>
                      <span className="text-wbk-lightgrey">|</span>
                      <Link
                        href="/contact"
                        onClick={closeMobileMenu}
                        className="hover:text-wbk-black transition-colors py-1"
                      >
                        Contact
                      </Link>
                    </div>

                    {/* Brand Trust Assurances */}
                    <div className="p-4 bg-[#F4F2F0] border-t border-wbk-lightgrey/70 space-y-2.5 text-[11px] text-wbk-brown">
                      <div className="flex items-center gap-2">
                        <IconTruck size={15} className="text-wbk-gold shrink-0" strokeWidth={1.5} />
                        <span className="text-wbk-black/80 font-medium">Free UK Mainland Delivery</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IconShieldCheck size={15} className="text-wbk-gold shrink-0" strokeWidth={1.5} />
                        <span className="text-wbk-black/80 font-medium">30-Year Mechanism Warranty</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IconTools size={15} className="text-wbk-gold shrink-0" strokeWidth={1.5} />
                        <span className="text-wbk-black/80 font-medium">Precision Engineered Mechanisms</span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  /* ── Level 1: Subcategories & Products ── */
                  <motion.div
                    key="level-1"
                    custom={direction}
                    variants={pageVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={pageTransition}
                    className="flex flex-col divide-y divide-wbk-lightgrey/70"
                  >
                    {/* Category Title & View All */}
                    {activeCategoryData?.parent && (
                      <Link
                        href={activeCategoryData.parent.href}
                        onClick={closeMobileMenu}
                        className="flex items-center gap-3 p-3 bg-[#F4F2F0] hover:bg-[#E4E0DE] transition-colors"
                      >
                        <div className="w-12 h-12 shrink-0 bg-white border border-wbk-lightgrey/60 p-1 flex items-center justify-center">
                          <Image
                            src={activeCategoryData.parent.image}
                            alt={activeCategoryData.parent.title}
                            width={42}
                            height={42}
                            className="object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] uppercase font-semibold tracking-wider text-wbk-gold block">
                            All Models
                          </span>
                          <span className="text-xs font-semibold text-wbk-black truncate block">
                            {activeCategoryData.parent.title}
                          </span>
                        </div>
                        <IconChevronRight size={16} className="text-wbk-brown" />
                      </Link>
                    )}

                    {/* Subcategories list */}
                    {activeCategoryData?.items?.map((item, idx) => (
                      <Link
                        key={idx}
                        href={item.href}
                        onClick={closeMobileMenu}
                        className="flex items-center gap-3 p-3 bg-wbk-white hover:bg-[#FBF9F8] transition-colors group"
                      >
                        <div className="w-12 h-12 shrink-0 bg-[#F4F2F0] border border-wbk-lightgrey/50 p-1 flex items-center justify-center">
                          <Image
                            src={item.image}
                            alt={item.title}
                            width={42}
                            height={42}
                            className="object-contain group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-wbk-black group-hover:text-wbk-green transition-colors leading-snug">
                            {item.title}
                          </div>
                          {(item.orientation || item.type || item.price) ? (
                            <div className="text-[10px] text-wbk-brown flex items-center gap-1.5 mt-0.5 font-poppins flex-wrap">
                              {item.orientation && <span>{item.orientation}</span>}
                              {item.type && <span>• {item.type}</span>}
                              {item.price && (
                                <span className="font-semibold text-wbk-black">
                                  • {item.price}
                                </span>
                              )}
                            </div>
                          ) : item.badge ? (
                            <span className="inline-block mt-0.5 text-[9px] uppercase tracking-wider text-wbk-brown">
                              {item.badge}
                            </span>
                          ) : null}
                        </div>
                        <IconChevronRight
                          size={14}
                          className="text-wbk-brown group-hover:text-wbk-green group-hover:translate-x-0.5 transition-all"
                        />
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
