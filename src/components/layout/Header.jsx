"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  IconShoppingBag,
  IconUser,
  IconChevronDown,
} from "@tabler/icons-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { NavItem } from "@/components/layout/NavItem";
import { Button } from "@/components/ui/Button";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/* ── Navigation data ─────────────────────────────────────── */
const NAV_ITEMS = [
  {
    label: "Products",
    dropdown: {
      isImageGrid: true,
      items: [
        {
          label: "Murphy Beds",
          href: "/products/beds",
          image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
        },
        {
          label: "Sofas",
          href: "/products/sofas",
          image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
        },
        {
          label: "Mattresses",
          href: "/products/mattresses",
          image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
        },
        {
          label: "Cabinets",
          href: "/products/cabinets",
          image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
        },
        {
          label: "Extras",
          href: "/products/extras",
          image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
        },
      ],
    },
  },
  {
    label: "Support",
    dropdown: {
      columns: [
        {
          label: "Help",
          items: [
            {
              label: "Installation Guides",
              href: "/support/installation-guides",
            },
            {
              label: "Installation Videos",
              href: "/support/installation-videos",
            },
            { label: "FAQ", href: "/support/faq" },
            { label: "Delivery", href: "/support/delivery" },
          ],
        },
      ],
    },
  },
  {
    label: "About",
    href: "/about",
  },
  {
    label: "Contact",
    href: "/contact",
  },
  {
    label: "More",
    dropdown: {
      columns: [
        {
          label: "Discover",
          items: [
            { label: "Case Studies", href: "/more/case-studies" },
            { label: "Trade Customers", href: "/more/trade-customers" },
            { label: "Reviews", href: "/more/reviews" },
          ],
        },
      ],
    },
  },
];

/* ── Language options ────────────────────────────────────── */
const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "hu", label: "HU" },
  { code: "de", label: "DE" },
];

/* ── Header ─────────────────────────────────────────────── */
export function Header() {
  const [openItem, setOpenItem] = useState(null);
  const [langOpen, setLangOpen] = useState(false);
  const [activeLang, setActiveLang] = useState("EN");

  const closeTimer = useRef(null);

  const handleEnter = useCallback((label) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenItem(label);
    setLangOpen(false);
  }, []);

  const handleLeave = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpenItem(null), 120);
  }, []);

  return (
    <>
      {/* Overlay – dims page content when dropdown is open */}
      <AnimatePresence>
        {openItem && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-[60px] z-30 bg-wbk-black/10"
            onMouseEnter={() => setOpenItem(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Header bar ────────────────────────────────────── */}
      <header className="fixed inset-x-0 top-0 z-50 h-[60px] bg-wbk-white border-b border-wbk-lightgrey">
        <div className="mx-auto flex h-full w-full items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="shrink-0" aria-label="WallBedKing home">
            <Image
              src="/logos/WBK-Logo-Gold-Black.svg"
              alt="WallBedKing"
              width={140}
              height={32}
              priority
              className="h-7 w-auto"
            />
          </Link>

          {/* Main nav */}
          <nav
            className="hidden lg:flex items-center gap-8 h-full"
            onMouseLeave={handleLeave}
          >
            {NAV_ITEMS.map((item) => (
              <NavItem
                key={item.label}
                item={item}
                isOpen={openItem === item.label}
                onMouseEnter={() => handleEnter(item.label)}
                onMouseLeave={handleLeave}
              />
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            {/* Configurator button */}
            <Button
              as="link"
              href="/configurator"
              variant="primary"
              size="sm"
              className="hidden lg:inline-flex bg-wbk-green hover:bg-wbk-black border-wbk-green hover:border-wbk-black text-wbk-white shadow-sm font-medium tracking-widest uppercase"
            >
              Configurator
            </Button>

            {/* Language selector */}
            <div
              className="relative"
              onMouseEnter={() => {
                setLangOpen(true);
                setOpenItem(null);
              }}
              onMouseLeave={() => setLangOpen(false)}
            >
              <button
                className="flex items-center gap-1 text-xs font-medium uppercase tracking-widest text-wbk-black hover:text-wbk-green transition-colors duration-150"
                aria-label="Select language"
              >
                {activeLang}
                <IconChevronDown
                  size={12}
                  className={cn(
                    "transition-transform duration-200",
                    langOpen ? "rotate-180" : "rotate-0",
                  )}
                />
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 min-w-[60px] bg-wbk-white shadow-md border border-wbk-lightgrey py-1"
                  >
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setActiveLang(lang.label);
                          setLangOpen(false);
                        }}
                        className={cn(
                          "block w-full px-4 py-2 text-left text-xs font-medium uppercase tracking-widest transition-colors duration-150",
                          activeLang === lang.label
                            ? "text-wbk-green"
                            : "text-wbk-black hover:text-wbk-green hover:bg-wbk-lightgrey",
                        )}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart */}
            <Link
              href="/cart"
              aria-label="Shopping cart"
              className="relative text-wbk-black hover:text-wbk-green transition-colors duration-150"
            >
              <IconShoppingBag size={20} strokeWidth={1.5} />
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-wbk-gold text-[9px] font-semibold text-wbk-black">
                0
              </span>
            </Link>

            {/* User */}
            <Link
              href="/account"
              aria-label="Your account"
              className="text-wbk-black hover:text-wbk-green transition-colors duration-150"
            >
              <IconUser size={20} strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </header>

      {/* Spacer so page content sits below the fixed header */}
      <div className="h-[60px]" aria-hidden="true" />
    </>
  );
}
