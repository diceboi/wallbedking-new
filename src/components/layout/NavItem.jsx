"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/* ── Dropdown animation variants ──────────────────────────── */
const dropdownVariants = {
  hidden: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.15, ease: "easeIn" },
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: "easeOut" },
  },
};

/* ── Single nav item + its mega dropdown ──────────────────── */
export function NavItem({ item, isOpen, onMouseEnter, onMouseLeave }) {
  const hasDropdown = Boolean(item.dropdown);

  return (
    <div
      className="relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Trigger */}
      {item.href && !hasDropdown ? (
        <Link
          href={item.href}
          className={cn(
            "relative flex items-center gap-1 py-1 text-xs font-medium uppercase tracking-widest transition-colors duration-150",
            "text-wbk-black hover:text-wbk-green",
            "after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-wbk-gold after:transition-all after:duration-200 hover:after:w-full"
          )}
        >
          {item.label}
        </Link>
      ) : (
        <button
          className={cn(
            "relative flex items-center gap-1 py-1 text-xs font-medium uppercase tracking-widest transition-colors duration-150",
            isOpen ? "text-wbk-green" : "text-wbk-black hover:text-wbk-green",
            "after:absolute after:bottom-0 after:left-0 after:h-px after:bg-wbk-gold after:transition-all after:duration-200",
            isOpen ? "after:w-full" : "after:w-0 hover:after:w-full"
          )}
        >
          {item.label}
          {hasDropdown && (
            <span
              className={cn(
                "ml-0.5 text-[10px] transition-transform duration-200",
                isOpen ? "rotate-180" : "rotate-0"
              )}
            >
              ▾
            </span>
          )}
        </button>
      )}

      {/* Mega Dropdown */}
      <AnimatePresence>
        {isOpen && item.dropdown && (
          <motion.div
            key="dropdown"
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed left-0 right-0 top-[60px] z-40 bg-wbk-white shadow-sm border-t border-wbk-lightgrey"
          >
            <div className="mx-auto flex max-w-7xl gap-12 px-8 py-10 lg:px-12">
              {/* Featured image (optional) */}
              {item.dropdown.featuredImage && (
                <Link
                  href={item.dropdown.featuredImage.href}
                  className="group relative hidden w-64 shrink-0 overflow-hidden lg:block"
                >
                  <img
                    src={item.dropdown.featuredImage.src}
                    alt={item.dropdown.featuredImage.alt}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute bottom-4 left-4 font-new-york text-lg text-wbk-white drop-shadow">
                    {item.dropdown.featuredImage.label}
                  </span>
                </Link>
              )}

              {/* Columns */}
              <div className="flex flex-1 gap-10">
                {item.dropdown.columns.map((col) => (
                  <div key={col.label} className="min-w-[130px]">
                    <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-wbk-brown">
                      {col.label}
                    </p>
                    <ul className="space-y-3">
                      {col.items.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            className="text-sm text-wbk-black transition-colors duration-150 hover:text-wbk-green"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
