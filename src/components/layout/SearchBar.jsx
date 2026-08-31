"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { IconSearch, IconX, IconArrowRight } from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import { RAW_CATALOG } from "@/data/products";

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter catalog items
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) return [];

    return RAW_CATALOG.filter((item) => {
      const matchName = item.name?.toLowerCase().includes(q);
      const matchCat = item.parent_category?.toLowerCase().includes(q);
      const matchType = item.type?.toLowerCase().includes(q);
      const matchSize = item.size_label?.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      return matchName || matchCat || matchType || matchSize || matchDesc;
    }).slice(0, 6);
  }, [query]);

  const handleSelect = (item) => {
    setIsOpen(false);
    setQuery("");
    router.push(`/products/${item.parent_category}/${item.slug}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xs md:max-w-sm lg:max-w-md">
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <IconSearch
          size={16}
          strokeWidth={1.5}
          className="absolute left-3 text-wbk-brown pointer-events-none"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search beds, sofas, mattresses..."
          className="w-full h-9 pl-9 pr-8 text-xs bg-[#FBF9F8] border border-wbk-lightgrey text-wbk-black placeholder:text-wbk-brown/70 focus:outline-none focus:border-wbk-black transition-colors rounded-none font-poppins"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 text-wbk-brown hover:text-wbk-black p-0.5"
            aria-label="Clear search"
          >
            <IconX size={14} />
          </button>
        )}
      </div>

      {/* Instant Results Dropdown */}
      <AnimatePresence>
        {isOpen && query.trim().length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-1 bg-wbk-white border border-wbk-lightgrey shadow-xl z-50 overflow-hidden"
          >
            {results.length > 0 ? (
              <div className="divide-y divide-wbk-lightgrey/60">
                <div className="px-4 py-2 bg-[#F4F2F0] text-[10px] uppercase font-semibold tracking-wider text-wbk-brown flex items-center justify-between">
                  <span>Product Suggestions</span>
                  <span>{results.length} found</span>
                </div>
                {results.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-[#FBF9F8] transition-colors text-left group"
                  >
                    <div className="w-12 h-12 shrink-0 bg-[#F4F2F0] border border-wbk-lightgrey/60 p-1 flex items-center justify-center">
                      <Image
                        src={item.image || "/product-images/morphy-integrated/160x200.jpg"}
                        alt={item.name}
                        width={44}
                        height={44}
                        className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-wbk-black truncate group-hover:text-wbk-green transition-colors">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] uppercase tracking-wider text-wbk-brown">
                          {item.parent_category}
                        </span>
                        <span className="text-[10px] text-wbk-brown/50">•</span>
                        <span className="text-[11px] font-semibold text-wbk-black">
                          £{item.price_gbp}
                        </span>
                      </div>
                    </div>
                    <IconArrowRight
                      size={14}
                      className="text-wbk-brown group-hover:text-wbk-green group-hover:translate-x-1 transition-all shrink-0"
                    />
                  </button>
                ))}
                <Link
                  href={`/products?search=${encodeURIComponent(query)}`}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2.5 text-center text-xs font-medium text-wbk-green hover:text-wbk-black hover:bg-[#F4F2F0] transition-colors tracking-wide uppercase"
                >
                  View all results for &ldquo;{query}&rdquo;
                </Link>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-wbk-brown">
                No matching products found for &ldquo;{query}&rdquo;.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
