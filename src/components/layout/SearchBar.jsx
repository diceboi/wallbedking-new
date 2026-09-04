"use client";

import { useState, useRef, useEffect, useMemo, useContext } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { IconSearch, IconX, IconArrowRight } from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import { RAW_CATALOG } from "@/data/products";
import { MenuContext } from "@/context/MenuContext";
import { useLocale } from "@/context/LocaleContext";

const normalizeStr = (s) =>
  s ? String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";

export function SearchBar() {
  const router = useRouter();
  const { t, localizedHref, formatPrice } = useLocale();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const { setIsSearchOpen } = useContext(MenuContext);

  // Synchronize search open state with MenuContext to lock header during search
  useEffect(() => {
    setIsSearchOpen?.(isOpen);
  }, [isOpen, setIsSearchOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, {
      passive: true,
    });
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Filter catalog items across all dimensions, metadata and synonyms
  const results = useMemo(() => {
    const rawQ = normalizeStr(query).trim();
    if (!rawQ || rawQ.length < 2) return [];

    // Normalize delimiters and Hungarian suffixes (e.g. 160-as -> 160)
    const cleanQ = rawQ.replace(/\s*[*x×]\s*/g, "x");
    const tokens = cleanQ
      .split(/[\s,]+/)
      .map((tok) => tok.replace(/-(as|es|os|us)$/i, ""))
      .filter(Boolean);

    return RAW_CATALOG.filter((item) => {
      const widthCm = item.width ? Math.round(item.width / 10) : "";
      const lengthCm = item.length ? Math.round(item.length / 10) : "";
      const dimCm =
        widthCm && lengthCm
          ? [
              `${widthCm}x${lengthCm}`,
              `${lengthCm}x${widthCm}`,
              String(widthCm),
              String(lengthCm),
            ]
          : [];

      const catSynonyms =
        {
          beds: "agy agyak murphy bed lenyithato falagy",
          sofas: "kanape kanapek sofa",
          mattresses: "matrac matracok mattress",
          cabinets: "szekreny szekrenyek cabinet",
        }[item.parent_category] || "";

      const searchable = normalizeStr(
        [
          item.name,
          item.slug,
          item.parent_category,
          catSynonyms,
          item.category,
          item.sub_category,
          item.type,
          item.orientation,
          item.color,
          item.meta_title,
          item.meta_description,
          item.description,
          item.product_image_alt,
          item.ean,
          item.ean_uk,
          item.ean_us,
          item.ean_de,
          item.ean_fr,
          item.ean_es,
          item.ean_it,
          item.ean_pt,
          ...dimCm,
          item.width,
          item.length,
        ]
          .filter(Boolean)
          .join(" ")
      );

      return tokens.every((tok) => searchable.includes(tok));
    }).slice(0, 8);
  }, [query]);

  const handleSelect = (item) => {
    setIsOpen(false);
    setQuery("");
    router.push(localizedHref(`/products/${item.parent_category}/${item.slug}`));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && results.length > 0) {
      handleSelect(results[0]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full md:max-w-sm lg:max-w-md rounded-none"
    >
      {/* Search Input Box */}
      <div className="relative flex items-center rounded-none">
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
          placeholder={t("header.searchPlaceholder", "Search beds, sofas, mattresses...")}
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
            className="absolute left-0 right-0 top-full mt-1.5 bg-wbk-white border border-wbk-lightgrey shadow-2xl z-50 max-h-[65vh] sm:max-h-[70vh] overflow-y-auto"
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
                    className="w-full flex items-center gap-3 p-3 hover:bg-[#FBF9F8] transition-colors text-left group cursor-pointer"
                  >
                    <div className="w-12 h-12 shrink-0 bg-[#F4F2F0] border border-wbk-lightgrey/60 p-1 flex items-center justify-center">
                      <Image
                        src={
                          item.image ||
                          "/product-images/morphy-integrated/160x200.jpg"
                        }
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
                        {item.width && item.length && (
                          <>
                            <span className="text-[10px] text-wbk-brown/50">•</span>
                            <span className="text-[10px] font-medium text-wbk-brown">
                              {Math.round(item.width / 10)}x{Math.round(item.length / 10)} cm
                            </span>
                          </>
                        )}
                        <span className="text-[10px] text-wbk-brown/50">•</span>
                        <span className="text-[11px] font-semibold text-wbk-black">
                          {formatPrice(item.sale_price_gbp || item.price_gbp)}
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
                  href={localizedHref(`/products?search=${encodeURIComponent(query)}`)}
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
