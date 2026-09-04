"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect, useContext, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/ui/ProductCard";
import {
  IconChevronDown,
  IconFilter,
  IconChevronRight,
  IconX,
} from "@tabler/icons-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import {
  ALL_PRODUCTS,
  CATEGORIES_INFO,
  OTHER_CATEGORIES_LIST,
  RAW_CATALOG,
  formatCatalogItem,
  getFlagshipBed,
} from "@/data/products";
import { MenuContext } from "@/context/MenuContext";
import { useLocale } from "@/context/LocaleContext";
import { resolveCategory } from "@/data/slugs";

export default function CategoryArchivePage() {
  const params = useParams();
  const { localizedHref } = useLocale();
  const rawCategory = params?.category || "beds";
  const currentCategory = resolveCategory(rawCategory, params?.locale);

  const catInfo = CATEGORIES_INFO[currentCategory] || {
    label: currentCategory.replace("-", " "),
    title: currentCategory.replace("-", " "),
    description: "Explore our collection.",
    subcategories: [],
  };

  const rawCategoryProducts = useMemo(() => {
    return ALL_PRODUCTS[currentCategory] || [];
  }, [currentCategory]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const searchParams = useSearchParams();

  // ── FILTER STATES ──
  const [selectedOrientation, setSelectedOrientation] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedPrice, setSelectedPrice] = useState("All");
  const [activeDropdown, setActiveDropdown] = useState(null);

  const distinctOrientations = useMemo(() => {
    const orients = Array.from(
      new Set(
        rawCategoryProducts
          .map((p) => p.orientation)
          .filter(Boolean),
      ),
    );
    return ["All", ...orients];
  }, [rawCategoryProducts]);

  const distinctTypes = useMemo(() => {
    const defined = catInfo?.subcategories || [];
    const fromProducts = rawCategoryProducts
      .map((p) => p.sub_category || p.type)
      .filter(Boolean);

    const combined = Array.from(new Set([...defined, ...fromProducts]));
    return ["All", ...combined];
  }, [catInfo, rawCategoryProducts]);

  const priceOptions = ["All", "Under £500", "£500 - £800", "Over £800"];

  // Sync state from URL search params (e.g. ?type=Vertical or ?orientation=Horizontal)
  useEffect(() => {
    const orient = searchParams?.get("orientation");
    if (orient) {
      const match = distinctOrientations.find(
        (o) => o.toLowerCase() === orient.toLowerCase(),
      );
      setSelectedOrientation(match || orient);
    } else {
      setSelectedOrientation("All");
    }

    const typ = searchParams?.get("type") || searchParams?.get("sub_category");
    if (typ) {
      const cleanTyp = typ.toLowerCase().replace(/[-_]/g, " ");
      const match = distinctTypes.find(
        (t) =>
          t.toLowerCase() === typ.toLowerCase() ||
          t.toLowerCase() === cleanTyp ||
          t.toLowerCase().replace(/[-_\s]/g, "") === typ.toLowerCase().replace(/[-_\s]/g, ""),
      );
      setSelectedType(match || typ);
    } else {
      setSelectedType("All");
    }

    const price = searchParams?.get("price");
    if (price) {
      const match = priceOptions.find(
        (p) => p.toLowerCase() === price.toLowerCase(),
      );
      setSelectedPrice(match || "All");
    } else {
      setSelectedPrice("All");
    }
  }, [searchParams, distinctOrientations, distinctTypes]);

  // Sync state changes to URL query parameters
  const updateUrlParams = useCallback((newOrientation, newType, newPrice) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (newOrientation && newOrientation !== "All") {
      url.searchParams.set("orientation", newOrientation);
    } else {
      url.searchParams.delete("orientation");
    }
    if (newType && newType !== "All") {
      url.searchParams.set("type", newType);
    } else {
      url.searchParams.delete("type");
      url.searchParams.delete("sub_category");
    }
    if (newPrice && newPrice !== "All") {
      url.searchParams.set("price", newPrice);
    } else {
      url.searchParams.delete("price");
    }
    window.history.replaceState(null, "", url.toString());
  }, []);

  // ── REAL FILTERING LOGIC ──
  const filteredProducts = useMemo(() => {
    const baseList = rawCategoryProducts;

    return baseList.filter((prod) => {
      // Orientation filter
      if (
        selectedOrientation !== "All" &&
        prod.orientation?.toLowerCase() !== selectedOrientation.toLowerCase()
      ) {
        return false;
      }

      // Type / Sub-category filter
      if (selectedType !== "All") {
        const cleanSelected = selectedType.toLowerCase();
        const matchesType =
          prod.type?.toLowerCase() === cleanSelected ||
          prod.sub_category?.toLowerCase() === cleanSelected ||
          prod.name?.toLowerCase().includes(cleanSelected) ||
          prod.title?.toLowerCase().includes(cleanSelected);
        if (!matchesType) return false;
      }

      // Price filter
      if (selectedPrice !== "All") {
        const priceNum =
          prod.numericPrice ||
          Number(String(prod.price || "").replace(/[^0-9.]/g, "")) ||
          0;
        if (selectedPrice === "Under £500" && priceNum >= 500) return false;
        if (
          selectedPrice === "£500 - £800" &&
          (priceNum < 500 || priceNum > 800)
        )
          return false;
        if (selectedPrice === "Over £800" && priceNum <= 800) return false;
      }

      return true;
    });
  }, [
    rawCategoryProducts,
    selectedOrientation,
    selectedType,
    selectedPrice,
  ]);

  const { isMenuVisible, subMenu } = useContext(MenuContext);
  const [isSticky, setIsSticky] = useState(false);
  const [filterSwiper, setFilterSwiper] = useState(null);
  const [isFilterEnd, setIsFilterEnd] = useState(false);
  const sentinelRef = useRef(null);
  const filterContainerRef = useRef(null);

  // Close filter dropdown if desktop submenu opens
  useEffect(() => {
    if (subMenu) {
      setActiveDropdown(null);
    }
  }, [subMenu]);

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

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
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
        rootMargin: "-100px 0px 0px 0px",
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const hasActiveFilters =
    selectedOrientation !== "All" ||
    selectedType !== "All" ||
    selectedPrice !== "All";

  const productGridRef = useRef(null);

  // Smoothly scroll to the top of the product grid below sticky header and filter bar
  const scrollToProducts = () => {
    if (typeof window === "undefined") return;

    requestAnimationFrame(() => {
      if (!productGridRef.current) return;
      const headerEl = document.querySelector("header");
      const headerHeight = headerEl ? headerEl.offsetHeight : 92;
      const filterHeight = filterContainerRef.current
        ? filterContainerRef.current.offsetHeight
        : 58;
      const totalStickyOffset = headerHeight + filterHeight;

      const rect = productGridRef.current.getBoundingClientRect();
      const targetScrollY =
        window.pageYOffset + rect.top - totalStickyOffset - 16;

      window.scrollTo({
        top: Math.max(0, targetScrollY),
        behavior: "smooth",
      });
    });
  };

  const handleSelectType = (opt) => {
    setSelectedType(opt);
    updateUrlParams(selectedOrientation, opt, selectedPrice);
    setActiveDropdown(null);
    scrollToProducts();
  };

  const handleSelectOrientation = (opt) => {
    setSelectedOrientation(opt);
    updateUrlParams(opt, selectedType, selectedPrice);
    setActiveDropdown(null);
    scrollToProducts();
  };

  const handleSelectPrice = (opt) => {
    setSelectedPrice(opt);
    updateUrlParams(selectedOrientation, selectedType, opt);
    setActiveDropdown(null);
    scrollToProducts();
  };

  const clearAllFilters = () => {
    setSelectedOrientation("All");
    setSelectedType("All");
    setSelectedPrice("All");
    updateUrlParams("All", "All", "All");
    setActiveDropdown(null);
    scrollToProducts();
  };

  if (!mounted) {
    return (
      <div className="bg-wbk-white min-h-screen pt-16 flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-wbk-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-wbk-white min-h-screen pt-12 pb-20">
      <Container size="xl">
        {/* Category Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <nav className="flex items-center gap-1.5 text-[11px] font-poppins text-wbk-brown/80 mb-2">
              <Link
                href={localizedHref("/products")}
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
            {filteredProducts.length === 1 ? "item" : "items"}
          </div>
        </div>

        {/* Sentinel for sticky detection */}
        <div
          ref={sentinelRef}
          className="h-px w-full pointer-events-none mb-0"
        />

        {/* ── Original Swiper Filter Bar with Unclipped Floating Dropdowns ── */}
        <div
          ref={filterContainerRef}
          style={{
            top: "calc(var(--header-height, 92px) - 1px)",
            transition: "top 0.25s ease-in-out, box-shadow 0.2s ease-in-out",
            overflowX: "clip",
            overflowY: "visible",
          }}
          className={`sticky z-20 bg-wbk-white flex flex-col justify-center -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-3 relative ${
            isSticky ? "shadow-xs border-b border-wbk-lightgrey/60" : ""
          }`}
        >
          <div className="w-full h-14 sm:h-[58px] flex items-center relative !overflow-visible shrink-0">
            <Swiper
              modules={[FreeMode, Mousewheel]}
              slidesPerView="auto"
              spaceBetween={10}
              freeMode={{
                enabled: true,
                momentumRatio: 0.75,
              }}
              mousewheel={{
                forceToAxis: true,
              }}
              grabCursor={true}
              onSwiper={(swiper) => {
                setFilterSwiper(swiper);
                setIsFilterEnd(swiper.isEnd);
              }}
              onSlideChange={(swiper) => setIsFilterEnd(swiper.isEnd)}
              onReachEnd={() => setIsFilterEnd(true)}
              onFromEdge={() => setIsFilterEnd(false)}
              className="filter-swiper !overflow-visible w-full h-full flex items-center"
            >
              {/* Stable Filters label badge - circular icon-only on mobile */}
              <SwiperSlide className="!w-auto !h-full flex items-center !overflow-visible">
                <div
                  className="flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-wbk-black w-9 sm:w-auto h-9 px-0 sm:px-3.5 rounded-full bg-[#F4F2F0] border border-wbk-lightgrey/80 shrink-0 select-none"
                  title="Filters"
                >
                  <IconFilter size={15} className="text-wbk-gold" />
                  <span className="hidden sm:inline">Filters</span>
                </div>
              </SwiperSlide>

              {/* Type / Model Filter */}
              {distinctTypes.length > 2 && (
                <SwiperSlide className="!w-auto !h-full flex items-center !overflow-visible">
                  <div
                    className="relative flex items-center !overflow-visible"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setActiveDropdown(
                          activeDropdown === "type" ? null : "type",
                        )
                      }
                      className={`flex items-center justify-between gap-2.5 sm:gap-3 px-4 sm:px-5 h-9 border text-xs font-poppins transition-all rounded-full cursor-pointer whitespace-nowrap select-none ${
                        selectedType !== "All"
                          ? "border-wbk-black bg-[#FBF9F8] font-semibold text-wbk-black shadow-2xs"
                          : "border-wbk-lightgrey bg-white text-wbk-black hover:border-wbk-black shadow-2xs"
                      }`}
                    >
                      <span>
                        Type:{" "}
                        <strong className="font-semibold">
                          {selectedType}
                        </strong>
                      </span>
                      <IconChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${
                          activeDropdown === "type"
                            ? "rotate-180 text-wbk-gold"
                            : "text-wbk-brown"
                        }`}
                      />
                    </button>

                    {activeDropdown === "type" && (
                      <div className="absolute top-full left-0 mt-1.5 z-50 bg-wbk-white border border-wbk-lightgrey/80 shadow-2xl p-2 min-w-[170px] rounded-none">
                        {distinctTypes.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleSelectType(opt)}
                            className={`w-full text-left px-4 py-2 text-xs font-poppins rounded-none transition-colors whitespace-nowrap cursor-pointer ${
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
                </SwiperSlide>
              )}

              {/* Orientation Filter */}
              {distinctOrientations.length > 2 && (
                <SwiperSlide className="!w-auto !h-full flex items-center !overflow-visible">
                  <div
                    className="relative flex items-center !overflow-visible"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setActiveDropdown(
                          activeDropdown === "orientation"
                            ? null
                            : "orientation",
                        )
                      }
                      className={`flex items-center justify-between gap-2.5 sm:gap-3 px-4 sm:px-5 h-9 border text-xs font-poppins transition-all rounded-full cursor-pointer whitespace-nowrap select-none ${
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
                          activeDropdown === "orientation"
                            ? "rotate-180 text-wbk-gold"
                            : "text-wbk-brown"
                        }`}
                      />
                    </button>

                    {activeDropdown === "orientation" && (
                      <div className="absolute top-full left-0 mt-1.5 z-50 bg-wbk-white border border-wbk-lightgrey/80 shadow-2xl p-2 min-w-[170px] rounded-none">
                        {distinctOrientations.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleSelectOrientation(opt)}
                            className={`w-full text-left px-4 py-2 text-xs font-poppins rounded-none transition-colors whitespace-nowrap cursor-pointer ${
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
                </SwiperSlide>
              )}

              {/* Price Filter */}
              <SwiperSlide className="!w-auto !h-full flex items-center !overflow-visible">
                <div
                  className="relative flex items-center !overflow-visible"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setActiveDropdown(
                        activeDropdown === "price" ? null : "price",
                      )
                    }
                    className={`flex items-center justify-between gap-2.5 sm:gap-3 px-4 sm:px-5 h-9 border text-xs font-poppins transition-all rounded-full cursor-pointer whitespace-nowrap select-none ${
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
                        activeDropdown === "price"
                          ? "rotate-180 text-wbk-gold"
                          : "text-wbk-brown"
                      }`}
                    />
                  </button>

                  {activeDropdown === "price" && (
                    <div className="absolute top-full right-0 sm:left-0 mt-1.5 z-50 bg-wbk-white border border-wbk-lightgrey/80 shadow-2xl p-2 min-w-[170px] rounded-none">
                      {priceOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleSelectPrice(opt)}
                          className={`w-full text-left px-4 py-2 text-xs font-poppins rounded-none transition-colors whitespace-nowrap cursor-pointer ${
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
              </SwiperSlide>

              {/* Reset Filters button */}
              {hasActiveFilters && (
                <SwiperSlide className="!w-auto !h-full flex items-center !overflow-visible">
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="px-4 h-9 border border-transparent text-xs font-poppins text-wbk-brown hover:text-wbk-black underline cursor-pointer whitespace-nowrap rounded-full hover:bg-[#F4F2F0] transition-colors select-none flex items-center justify-center"
                  >
                    Reset filters
                  </button>
                </SwiperSlide>
              )}
            </Swiper>

            {/* Subtle right gradient to fade filter chips behind arrow - extends to screen edge */}
            {!isFilterEnd && (
              <div
                style={{
                  background:
                    "linear-gradient(to left, #FFFFFF 0%, #FFFFFF 35%, rgba(255, 255, 255, 0.85) 65%, rgba(255, 255, 255, 0) 100%)",
                }}
                className="absolute -right-4 sm:-right-6 lg:-right-8 top-0 bottom-0 w-24 sm:w-28 pointer-events-none z-20"
              />
            )}

            {/* Right scroll indicator green button */}
            <div
              className={`absolute right-0 sm:right-1 top-1/2 -translate-y-1/2 z-30 transition-all duration-200 ${
                isFilterEnd ? "opacity-0 pointer-events-none scale-90" : "opacity-100 scale-100"
              }`}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  filterSwiper?.slideNext();
                }}
                aria-label="Scroll filters right"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-wbk-green text-wbk-black shadow-md hover:bg-wbk-black hover:text-wbk-white transition-all duration-200 cursor-pointer"
              >
                <IconChevronRight size={15} stroke={2.5} />
              </button>
            </div>
          </div>

          {/* ── Low-Profile Black Active Filter Chips Bar (Sticky with Filter Bar) ── */}
          {hasActiveFilters && (
            <div className="w-full py-1.5 border-t border-wbk-lightgrey/50 flex items-center gap-1.5 flex-wrap">
              {selectedType !== "All" && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedType("All");
                    updateUrlParams(selectedOrientation, "All", selectedPrice);
                    scrollToProducts();
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-wbk-black text-white text-[11px] font-poppins rounded-full hover:bg-neutral-800 transition-all cursor-pointer shadow-xs select-none"
                  title="Remove Type filter"
                >
                  <span className="font-medium text-white">{selectedType}</span>
                  <IconX
                    size={11}
                    className="text-white/80 hover:text-white ml-0.5"
                    stroke={2.5}
                  />
                </button>
              )}

              {selectedOrientation !== "All" && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOrientation("All");
                    updateUrlParams("All", selectedType, selectedPrice);
                    scrollToProducts();
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-wbk-black text-white text-[11px] font-poppins rounded-full hover:bg-neutral-800 transition-all cursor-pointer shadow-xs select-none"
                  title="Remove Orientation filter"
                >
                  <span className="font-medium text-white">{selectedOrientation}</span>
                  <IconX
                    size={11}
                    className="text-white/80 hover:text-white ml-0.5"
                    stroke={2.5}
                  />
                </button>
              )}

              {selectedPrice !== "All" && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPrice("All");
                    updateUrlParams(selectedOrientation, selectedType, "All");
                    scrollToProducts();
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-wbk-black text-white text-[11px] font-poppins rounded-full hover:bg-neutral-800 transition-all cursor-pointer shadow-xs select-none"
                  title="Remove Price filter"
                >
                  <span className="font-medium text-white">{selectedPrice}</span>
                  <IconX
                    size={11}
                    className="text-white/80 hover:text-white ml-0.5"
                    stroke={2.5}
                  />
                </button>
              )}

              <button
                type="button"
                onClick={clearAllFilters}
                className="text-[10px] font-poppins text-wbk-brown hover:text-wbk-black underline ml-1 cursor-pointer py-0.5"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div
            ref={productGridRef}
            className="py-20 text-center space-y-4 bg-[#F4F2F0]/40 rounded-none border border-wbk-lightgrey/60"
          >
            <p className="font-new-york text-2xl text-wbk-black">
              No products found
            </p>
            <p className="text-xs font-poppins text-wbk-brown">
              Try adjusting your filters to see more results.
            </p>
            <button
              type="button"
              onClick={clearAllFilters}
              className="px-6 py-2.5 bg-wbk-black text-white text-xs font-poppins font-medium rounded-full cursor-pointer hover:bg-wbk-green hover:text-wbk-black transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div
            ref={productGridRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-24"
          >
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
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F4F2F0] flex items-center justify-center p-6 transition-all duration-300 group-hover:bg-[#E4E0DE]/60 border border-wbk-lightgrey/40 rounded-none">
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
