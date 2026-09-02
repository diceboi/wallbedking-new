"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect, useContext, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/ui/ProductCard";
import { IconChevronDown, IconFilter } from "@tabler/icons-react";
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

export default function CategoryArchivePage() {
  const params = useParams();
  const currentCategory = params?.category || "beds";

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
  const [selectedSize, setSelectedSize] = useState("All");
  const [selectedOrientation, setSelectedOrientation] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedPrice, setSelectedPrice] = useState("All");
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const orient = searchParams?.get("orientation");
    if (orient) {
      const match = ["Vertical", "Horizontal"].find(
        (o) => o.toLowerCase() === orient.toLowerCase(),
      );
      if (match) setSelectedOrientation(match);
    }
    const typ = searchParams?.get("type");
    if (typ) {
      const match = ["Classic", "Studio", "Integrated"].find(
        (t) => t.toLowerCase() === typ.toLowerCase(),
      );
      if (match) setSelectedType(match);
    }
    const sz = searchParams?.get("size");
    if (sz) {
      setSelectedSize(sz);
    }
  }, [searchParams]);

  // Derive dynamic filter choices based on category
  const distinctSizes = useMemo(() => {
    if (currentCategory === "beds") {
      return [
        "All",
        "Small Single",
        "Single",
        "Small Double",
        "Double",
        "King",
        "Super King",
      ];
    }
    const sizes = Array.from(
      new Set(
        rawCategoryProducts
          .map((p) => p.size || p.size_category || p.size_label)
          .filter(Boolean),
      ),
    );
    return ["All", ...sizes];
  }, [currentCategory, rawCategoryProducts]);

  const distinctOrientations = useMemo(() => {
    const orients = Array.from(
      new Set(
        (currentCategory === "beds"
          ? RAW_CATALOG.filter((p) => p.parent_category === "beds")
          : rawCategoryProducts
        )
          .map((p) => p.orientation)
          .filter(Boolean),
      ),
    );
    return ["All", ...orients];
  }, [currentCategory, rawCategoryProducts]);

  const distinctTypes = useMemo(() => {
    const types = Array.from(
      new Set(
        (currentCategory === "beds"
          ? RAW_CATALOG.filter((p) => p.parent_category === "beds")
          : rawCategoryProducts
        )
          .map((p) => p.type || p.sub_category)
          .filter(Boolean),
      ),
    );
    return ["All", ...types];
  }, [currentCategory, rawCategoryProducts]);

  const priceOptions = ["All", "Under £500", "£500 - £800", "Over £800"];

  // ── REAL FILTERING LOGIC ──
  const filteredProducts = useMemo(() => {
    let baseList = [];

    if (currentCategory === "beds") {
      if (selectedSize !== "All") {
        // If a specific size is chosen, find all bed variants in catalog for this size
        const rawBeds = RAW_CATALOG.filter(
          (p) =>
            p.parent_category === "beds" &&
            (p.size_category === selectedSize ||
              p.size === selectedSize ||
              p.size_label?.toLowerCase().includes(selectedSize.toLowerCase())),
        );

        baseList = rawBeds.map((raw) => {
          const formatted = formatCatalogItem(raw);
          const flagship = getFlagshipBed(raw.type, raw.orientation);
          return {
            ...formatted,
            link: `/products/beds/${flagship.slug}?size=${formatted.sizeSlug}`,
          };
        });
      } else {
        // Show the 6 flagship models
        baseList = ALL_PRODUCTS.beds || [];
      }
    } else {
      baseList = rawCategoryProducts;
    }

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
        const matchesType =
          prod.type?.toLowerCase() === selectedType.toLowerCase() ||
          prod.sub_category?.toLowerCase() === selectedType.toLowerCase();
        if (!matchesType) return false;
      }

      // Size filter for non-beds categories
      if (currentCategory !== "beds" && selectedSize !== "All") {
        const prodSizeStr =
          `${prod.size || ""} ${prod.size_category || ""} ${prod.sizeLabel || ""}`.toLowerCase();
        if (!prodSizeStr.includes(selectedSize.toLowerCase())) {
          return false;
        }
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
    currentCategory,
    rawCategoryProducts,
    selectedSize,
    selectedOrientation,
    selectedType,
    selectedPrice,
  ]);

  const { isMenuVisible, subMenu } = useContext(MenuContext);
  const [isSticky, setIsSticky] = useState(false);
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
    selectedSize !== "All" ||
    selectedOrientation !== "All" ||
    selectedType !== "All" ||
    selectedPrice !== "All";

  const clearAllFilters = () => {
    setSelectedSize("All");
    setSelectedOrientation("All");
    setSelectedType("All");
    setSelectedPrice("All");
    setActiveDropdown(null);
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
          style={{ top: "calc(var(--header-height, 92px) - 1px)" }}
          className={`sticky z-20 bg-wbk-white border-y border-wbk-lightgrey h-14 sm:h-[58px] flex items-center -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-8 transition-shadow duration-200 !overflow-visible ${
            isSticky ? "shadow-xs" : ""
          }`}
        >
          <div className="w-full h-full flex items-center !overflow-visible">
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
              className="filter-swiper !overflow-visible w-full h-full flex items-center"
            >
              {/* Stable Filters label badge */}
              <SwiperSlide className="!w-auto !h-full flex items-center !overflow-visible">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-wbk-black px-3.5 h-9 rounded-full bg-[#F4F2F0] border border-wbk-lightgrey/80 shrink-0 select-none">
                  <IconFilter size={14} className="text-wbk-gold" />
                  <span>Filters</span>
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
                      <div className="absolute top-full left-0 mt-1.5 z-50 bg-wbk-white border border-wbk-lightgrey/80 shadow-2xl p-2 min-w-[170px] rounded-2xl">
                        {distinctTypes.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              setSelectedType(opt);
                              setActiveDropdown(null);
                            }}
                            className={`w-full text-left px-4 py-2 text-xs font-poppins rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
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

              {/* Size Filter */}
              {distinctSizes.length > 2 && (
                <SwiperSlide className="!w-auto !h-full flex items-center !overflow-visible">
                  <div
                    className="relative flex items-center !overflow-visible"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setActiveDropdown(
                          activeDropdown === "size" ? null : "size",
                        )
                      }
                      className={`flex items-center justify-between gap-2.5 sm:gap-3 px-4 sm:px-5 h-9 border text-xs font-poppins transition-all rounded-full cursor-pointer whitespace-nowrap select-none ${
                        selectedSize !== "All"
                          ? "border-wbk-black bg-[#FBF9F8] font-semibold text-wbk-black shadow-2xs"
                          : "border-wbk-lightgrey bg-white text-wbk-black hover:border-wbk-black shadow-2xs"
                      }`}
                    >
                      <span>
                        Size:{" "}
                        <strong className="font-semibold">
                          {selectedSize}
                        </strong>
                      </span>
                      <IconChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${
                          activeDropdown === "size"
                            ? "rotate-180 text-wbk-gold"
                            : "text-wbk-brown"
                        }`}
                      />
                    </button>

                    {activeDropdown === "size" && (
                      <div className="absolute top-full left-0 mt-1.5 z-50 bg-wbk-white border border-wbk-lightgrey/80 shadow-2xl p-2 min-w-[190px] rounded-2xl max-h-72 overflow-y-auto custom-scrollbar">
                        {distinctSizes.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              setSelectedSize(opt);
                              setActiveDropdown(null);
                            }}
                            className={`w-full text-left px-4 py-2 text-xs font-poppins rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
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
                      <div className="absolute top-full left-0 mt-1.5 z-50 bg-wbk-white border border-wbk-lightgrey/80 shadow-2xl p-2 min-w-[170px] rounded-2xl">
                        {distinctOrientations.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              setSelectedOrientation(opt);
                              setActiveDropdown(null);
                            }}
                            className={`w-full text-left px-4 py-2 text-xs font-poppins rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
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
                    <div className="absolute top-full right-0 sm:left-0 mt-1.5 z-50 bg-wbk-white border border-wbk-lightgrey/80 shadow-2xl p-2 min-w-[170px] rounded-2xl">
                      {priceOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setSelectedPrice(opt);
                            setActiveDropdown(null);
                          }}
                          className={`w-full text-left px-4 py-2 text-xs font-poppins rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
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
          </div>
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
              type="button"
              onClick={clearAllFilters}
              className="px-6 py-2.5 bg-wbk-black text-white text-xs font-poppins font-medium rounded-full cursor-pointer hover:bg-wbk-green hover:text-wbk-black transition-colors"
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
