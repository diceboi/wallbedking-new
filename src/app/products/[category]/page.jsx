"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect, useContext } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/ui/ProductCard";
import {
  IconChevronDown,
  IconFilter,
  Icon3dCubeSphere,
} from "@tabler/icons-react";
import {
  ALL_PRODUCTS,
  CATEGORIES_INFO,
  OTHER_CATEGORIES_LIST,
} from "@/data/products";
import { MenuContext } from "@/context/MenuContext";

export default function CategoryArchivePage() {
  const params = useParams();
  const currentCategory = params?.category || "beds";

  const catInfo = CATEGORIES_INFO[currentCategory] || {
    label: currentCategory.replace("-", " "),
    title: currentCategory.replace("-", " "),
    description: "Explore our collection.",
    subcategories: [],
  };

  const rawCategoryProducts = ALL_PRODUCTS[currentCategory] || [];
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const searchParams = useSearchParams();

  // ── FILTER STATES ──
  const [selectedSize, setSelectedSize] = useState("All");
  const [selectedOrientation, setSelectedOrientation] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedPrice, setSelectedPrice] = useState("All");
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const orient = searchParams?.get("orientation");
    if (orient) {
      const match = ["Vertical", "Horizontal"].find(
        (o) => o.toLowerCase() === orient.toLowerCase()
      );
      if (match) setSelectedOrientation(match);
    }
    const typ = searchParams?.get("type");
    if (typ) {
      const match = ["Classic", "Studio", "Integrated"].find(
        (t) => t.toLowerCase() === typ.toLowerCase()
      );
      if (match) setSelectedType(match);
    }
  }, [searchParams]);

  // Derive dynamic filter choices
  const distinctSizes =
    currentCategory === "beds"
      ? [
          "All",
          "Small Single",
          "Single",
          "Small Double",
          "Double",
          "King",
          "Super King",
        ]
      : [
          "All",
          ...Array.from(
            new Set(rawCategoryProducts.map((p) => p.size).filter(Boolean))
          ),
        ];

  const distinctOrientations = [
    "All",
    ...Array.from(
      new Set(rawCategoryProducts.map((p) => p.orientation).filter(Boolean))
    ),
  ];

  const distinctTypes = [
    "All",
    ...Array.from(
      new Set(
        rawCategoryProducts
          .map((p) => p.type || p.sub_category)
          .filter(Boolean)
      )
    ),
  ];

  const priceOptions = ["All", "Under £500", "£500 - £800", "Over £800"];

  // Filter products
  const filteredProducts = rawCategoryProducts
    .filter((prod) => {
      if (
        selectedOrientation !== "All" &&
        prod.orientation !== selectedOrientation
      )
        return false;
      if (
        selectedType !== "All" &&
        prod.type !== selectedType &&
        prod.sub_category !== selectedType
      )
        return false;
      if (selectedPrice !== "All") {
        const p = prod.numericPrice;
        if (selectedPrice === "Under £500" && p >= 500) return false;
        if (selectedPrice === "£500 - £800" && (p < 500 || p > 800)) return false;
        if (selectedPrice === "Over £800" && p <= 800) return false;
      }
      return true;
    })
    .map((prod) => {
      // If user filtered by size on beds, link directly with ?size= query param
      if (currentCategory === "beds" && selectedSize !== "All") {
        const sizeSlug = selectedSize.toLowerCase().replace(/\s+/g, "-");
        return {
          ...prod,
          link: `/products/beds/${prod.slug}?size=${sizeSlug}`,
        };
      }
      return prod;
    });

  const { isMenuVisible } = useContext(MenuContext);
  const [isSticky, setIsSticky] = useState(false);
  const sentinelRef = useRef(null);
  const filterContainerRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        filterContainerRef.current &&
        !filterContainerRef.current.contains(e.target)
      ) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Track sticky state when scrolled past sentinel
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: "-90px 0px 0px 0px",
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  if (!mounted) {
    return (
      <div className="bg-wbk-white min-h-screen pt-16 flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-wbk-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-wbk-white min-h-screen pt-28 pb-20">
      <Container size="xl">
        {/* Category Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <nav className="flex items-center gap-1.5 text-[11px] font-poppins text-wbk-brown/80 mb-2">
              <Link
                href="/products"
                className="hover:text-wbk-black transition-colors"
              >
                Products
              </Link>
              <span>/</span>
              <span className="capitalize text-wbk-black font-medium">
                {catInfo.label}
              </span>
            </nav>
            <h1 className="font-new-york text-5xl md:text-6xl text-wbk-black capitalize leading-none tracking-tight">
              {catInfo.label}
            </h1>
            <p className="mt-3 text-sm text-wbk-brown font-poppins max-w-xl leading-relaxed">
              {catInfo.description}
            </p>
          </div>
          <div className="text-xs text-wbk-brown font-poppins">
            Showing{" "}
            <span className="font-semibold text-wbk-black">
              {filteredProducts.length}
            </span>{" "}
            of {rawCategoryProducts.length} items
          </div>
        </div>

        {/* Separator line */}
        <hr className="border-wbk-lightgrey/60 mb-6" />

        {/* Sentinel for sticky detection */}
        <div ref={sentinelRef} className="h-px w-full pointer-events-none -mt-6 mb-2" />

        {/* Filters bar */}
        <div
          ref={filterContainerRef}
          className={`sticky z-30 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
            isMenuVisible ? "top-[88px] xl:top-[138px]" : "top-[88px]"
          } ${
            isSticky
              ? "bg-wbk-white/95 backdrop-blur-md border-b border-wbk-lightgrey py-3 shadow-xs -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-8"
              : "relative mb-8 py-1"
          }`}
        >
          <motion.div
            animate={{
              x: isSticky ? [10, 0] : 0,
            }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex items-center justify-start gap-2.5 sm:gap-3 flex-wrap"
          >
            {/* Left label animation when sticky */}
            {isSticky && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-wbk-black px-3.5 py-2 rounded-full bg-[#F4F2F0] border border-wbk-lightgrey/80 shrink-0"
              >
                <IconFilter size={14} className="text-wbk-gold" />
                <span>Filters</span>
              </motion.div>
            )}

            {/* Type / Model Filter */}
            {distinctTypes.length > 2 && (
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() =>
                    setActiveDropdown(activeDropdown === "type" ? null : "type")
                  }
                  className={`flex items-center justify-between gap-3 px-5 py-2.5 border text-xs font-poppins transition-all rounded-full cursor-pointer ${
                    selectedType !== "All"
                      ? "border-wbk-black bg-[#FBF9F8] font-semibold text-wbk-black shadow-2xs"
                      : "border-wbk-lightgrey bg-white text-wbk-black hover:border-wbk-black shadow-2xs"
                  }`}
                >
                  <span>
                    Type:{" "}
                    <strong className="font-semibold">{selectedType}</strong>
                  </span>
                  <IconChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      activeDropdown === "type" ? "rotate-180 text-wbk-gold" : "text-wbk-brown"
                    }`}
                  />
                </button>
                {activeDropdown === "type" && (
                  <div className="absolute top-full left-0 mt-1.5 z-50 bg-wbk-white border border-wbk-lightgrey/80 shadow-xl p-2 min-w-[170px] rounded-2xl">
                    {distinctTypes.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setSelectedType(opt);
                          setActiveDropdown(null);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs font-poppins rounded-xl transition-colors ${
                          selectedType === opt
                            ? "bg-[#F4F2F0] font-semibold text-wbk-black"
                            : "text-wbk-black hover:bg-[#FBF9F8] hover:text-wbk-green"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Size Filter */}
            {distinctSizes.length > 2 && (
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() =>
                    setActiveDropdown(activeDropdown === "size" ? null : "size")
                  }
                  className={`flex items-center justify-between gap-3 px-5 py-2.5 border text-xs font-poppins transition-all rounded-full cursor-pointer ${
                    selectedSize !== "All"
                      ? "border-wbk-black bg-[#FBF9F8] font-semibold text-wbk-black shadow-2xs"
                      : "border-wbk-lightgrey bg-white text-wbk-black hover:border-wbk-black shadow-2xs"
                  }`}
                >
                  <span>
                    Size:{" "}
                    <strong className="font-semibold">{selectedSize}</strong>
                  </span>
                  <IconChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      activeDropdown === "size" ? "rotate-180 text-wbk-gold" : "text-wbk-brown"
                    }`}
                  />
                </button>
                {activeDropdown === "size" && (
                  <div className="absolute top-full left-0 mt-1.5 z-50 bg-wbk-white border border-wbk-lightgrey/80 shadow-xl p-2 min-w-[170px] rounded-2xl">
                    {distinctSizes.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setSelectedSize(opt);
                          setActiveDropdown(null);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs font-poppins rounded-xl transition-colors ${
                          selectedSize === opt
                            ? "bg-[#F4F2F0] font-semibold text-wbk-black"
                            : "text-wbk-black hover:bg-[#FBF9F8] hover:text-wbk-green"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Orientation Filter */}
            {distinctOrientations.length > 2 && (
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() =>
                    setActiveDropdown(
                      activeDropdown === "orientation" ? null : "orientation",
                    )
                  }
                  className={`flex items-center justify-between gap-3 px-5 py-2.5 border text-xs font-poppins transition-all rounded-full cursor-pointer ${
                    selectedOrientation !== "All"
                      ? "border-wbk-black bg-[#FBF9F8] font-semibold text-wbk-black shadow-2xs"
                      : "border-wbk-lightgrey bg-white text-wbk-black hover:border-wbk-black shadow-2xs"
                  }`}
                >
                  <span>
                    Orientation:{" "}
                    <strong className="font-semibold">
                      {selectedOrientation}
                    </strong>
                  </span>
                  <IconChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      activeDropdown === "orientation" ? "rotate-180 text-wbk-gold" : "text-wbk-brown"
                    }`}
                  />
                </button>
                {activeDropdown === "orientation" && (
                  <div className="absolute top-full left-0 mt-1.5 z-50 bg-wbk-white border border-wbk-lightgrey/80 shadow-xl p-2 min-w-[170px] rounded-2xl">
                    {distinctOrientations.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setSelectedOrientation(opt);
                          setActiveDropdown(null);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs font-poppins rounded-xl transition-colors ${
                          selectedOrientation === opt
                            ? "bg-[#F4F2F0] font-semibold text-wbk-black"
                            : "text-wbk-black hover:bg-[#FBF9F8] hover:text-wbk-green"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Price Filter */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() =>
                  setActiveDropdown(activeDropdown === "price" ? null : "price")
                }
                className={`flex items-center justify-between gap-3 px-5 py-2.5 border text-xs font-poppins transition-all rounded-full cursor-pointer ${
                  selectedPrice !== "All"
                    ? "border-wbk-black bg-[#FBF9F8] font-semibold text-wbk-black shadow-2xs"
                    : "border-wbk-lightgrey bg-white text-wbk-black hover:border-wbk-black shadow-2xs"
                }`}
              >
                <span>
                  Price:{" "}
                  <strong className="font-semibold">{selectedPrice}</strong>
                </span>
                <IconChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    activeDropdown === "price" ? "rotate-180 text-wbk-gold" : "text-wbk-brown"
                  }`}
                />
              </button>
              {activeDropdown === "price" && (
                <div className="absolute top-full left-0 mt-1.5 z-50 bg-wbk-white border border-wbk-lightgrey/80 shadow-xl p-2 min-w-[170px] rounded-2xl">
                  {priceOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setSelectedPrice(opt);
                        setActiveDropdown(null);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-poppins rounded-xl transition-colors ${
                        selectedPrice === opt
                          ? "bg-[#F4F2F0] font-semibold text-wbk-black"
                          : "text-wbk-black hover:bg-[#FBF9F8] hover:text-wbk-green"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reset Filters button */}
            {(selectedSize !== "All" ||
              selectedOrientation !== "All" ||
              selectedType !== "All" ||
              selectedPrice !== "All") && (
              <button
                type="button"
                onClick={() => {
                  setSelectedSize("All");
                  setSelectedOrientation("All");
                  setSelectedType("All");
                  setSelectedPrice("All");
                }}
                className="px-4 py-2 text-xs font-poppins text-wbk-brown hover:text-wbk-black underline cursor-pointer whitespace-nowrap rounded-full hover:bg-[#F4F2F0] transition-colors"
              >
                Reset filters
              </button>
            )}
          </motion.div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-[#F4F2F0]/40 rounded-2xl border border-wbk-lightgrey/60">
            <p className="font-new-york text-2xl text-wbk-black">
              No products found
            </p>
            <p className="text-xs font-poppins text-wbk-brown">
              Try adjusting your filters to see more results.
            </p>
            <button
              onClick={() => {
                setSelectedSize("All");
                setSelectedOrientation("All");
                setSelectedType("All");
                setSelectedPrice("All");
              }}
              className="px-6 py-2.5 bg-wbk-black text-white text-xs font-poppins font-medium rounded-full"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-24">
            {filteredProducts.map((prod) => (
              <ProductCard key={prod.id || prod.slug} product={prod} />
            ))}
          </div>
        )}

        {/* Other Categories Section */}
        <div className="mt-20 border-t border-wbk-lightgrey/80 pt-16">
          <h2 className="font-new-york text-3xl md:text-4xl text-wbk-black mb-8">
            Other categories
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {OTHER_CATEGORIES_LIST.filter(
              (cat) => cat.slug !== currentCategory,
            ).map((otherCat) => (
              <Link
                key={otherCat.slug}
                href={`/products/${otherCat.slug}`}
                className="group flex flex-col items-center text-center"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F4F2F0] flex items-center justify-center p-6 transition-all duration-300 group-hover:bg-[#E4E0DE]/60 border border-wbk-lightgrey/40 rounded-xl">
                  <img
                    src={otherCat.image}
                    alt={otherCat.label}
                    className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <span className="mt-3 text-xs font-poppins font-medium uppercase tracking-[0.1em] text-wbk-black transition-colors duration-200 group-hover:text-wbk-green">
                  {otherCat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
