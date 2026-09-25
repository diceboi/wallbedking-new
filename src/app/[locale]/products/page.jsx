"use client";

import { Suspense, useState, useRef, useEffect, useContext, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/ui/ProductCard";
import {
  IconSearch,
  IconChevronDown,
  IconFilter,
  IconChevronRight,
  IconX,
  IconCheck,
} from "@tabler/icons-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";

import {
  ALL_FLAGSHIP_PRODUCTS,
  RAW_CATALOG,
  CATEGORIES_INFO,
  OTHER_CATEGORIES_LIST,
} from "@/data/products";
import { useLocale } from "@/context/LocaleContext";
import { getProductPrice } from "@/lib/i18n";

// Multi-language string normalization for Hungarian and English search
const normalizeStr = (s) =>
  s ? String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";

function ProductsSearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, localizedHref, formatPrice, locale } = useLocale();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // ── SEARCH & FILTER STATES ──
  const [searchInput, setSearchInput] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedOrientation, setSelectedOrientation] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedPrice, setSelectedPrice] = useState("All");
  const [selectedStock, setSelectedStock] = useState("All");
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Sentinel & Sticky filter bar state
  const sentinelRef = useRef(null);
  const filterContainerRef = useRef(null);
  const productGridRef = useRef(null);
  const [isSticky, setIsSticky] = useState(false);
  const [filterSwiper, setFilterSwiper] = useState(null);
  const [isFilterEnd, setIsFilterEnd] = useState(false);

  // Sync state from URL parameters on load or navigation
  useEffect(() => {
    const q = searchParams?.get("search") || searchParams?.get("q") || "";
    setActiveQuery(q);
    setSearchInput(q);

    const cat = searchParams?.get("category");
    if (cat) {
      setSelectedCategory(cat.toLowerCase());
    } else {
      setSelectedCategory("All");
    }

    const orient = searchParams?.get("orientation");
    if (orient) {
      setSelectedOrientation(orient);
    } else {
      setSelectedOrientation("All");
    }

    const typ = searchParams?.get("type") || searchParams?.get("sub_category");
    if (typ) {
      setSelectedType(typ);
    } else {
      setSelectedType("All");
    }

    const price = searchParams?.get("price");
    if (price) {
      setSelectedPrice(price);
    } else {
      setSelectedPrice("All");
    }

    const stock = searchParams?.get("stock");
    if (stock) {
      setSelectedStock(stock);
    } else {
      setSelectedStock("All");
    }
  }, [searchParams]);

  // Sync state updates to URL parameters without reloading
  const updateUrlParams = useCallback(
    (newQ, newCat, newOrient, newType, newPrice, newStock) => {
      if (typeof window === "undefined") return;
      const url = new URL(window.location.href);

      if (newQ && newQ.trim()) {
        url.searchParams.set("search", newQ.trim());
      } else {
        url.searchParams.delete("search");
        url.searchParams.delete("q");
      }

      if (newCat && newCat !== "All") {
        url.searchParams.set("category", newCat);
      } else {
        url.searchParams.delete("category");
      }

      if (newOrient && newOrient !== "All") {
        url.searchParams.set("orientation", newOrient);
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

      if (newStock && newStock !== "All") {
        url.searchParams.set("stock", newStock);
      } else {
        url.searchParams.delete("stock");
      }

      window.history.replaceState(null, "", url.toString());
    },
    []
  );

  // Track sticky state for the filter bar
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-100px 0px 0px 0px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

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
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Handle in-page search submission
  const handlePerformSearch = (e) => {
    e?.preventDefault();
    const clean = searchInput.trim();
    setActiveQuery(clean);
    updateUrlParams(
      clean,
      selectedCategory,
      selectedOrientation,
      selectedType,
      selectedPrice,
      selectedStock
    );
    scrollToProducts();
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setActiveQuery("");
    updateUrlParams(
      "",
      selectedCategory,
      selectedOrientation,
      selectedType,
      selectedPrice,
      selectedStock
    );
  };

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
        window.pageYOffset + rect.top - totalStickyOffset - 24;

      window.scrollTo({
        top: Math.max(0, targetScrollY),
        behavior: "smooth",
      });
    });
  };

  // Build searchable index map for each flagship product
  const searchableProducts = useMemo(() => {
    return ALL_FLAGSHIP_PRODUCTS.map((prod) => {
      // Find all associated size variants from RAW_CATALOG
      const variants = RAW_CATALOG.filter((item) => {
        if (prod.parent_category === "beds") {
          return (
            item.parent_category === "beds" &&
            (item.type || "").toLowerCase() === (prod.type || "").toLowerCase() &&
            (item.orientation || "Vertical").toLowerCase() ===
              (prod.orientation || "Vertical").toLowerCase()
          );
        }
        return (
          item.parent_category === prod.parent_category ||
          item.slug === prod.slug ||
          item.sub_category === prod.sub_category
        );
      });

      const variantKeywords = variants
        .map((v) => {
          const w = v.width ? Math.round(v.width / 10) : "";
          const l = v.length ? Math.round(v.length / 10) : "";
          const dims = w && l ? [`${w}x${l}`, `${l}x${w}`, `${w}`, `${l}`] : [];
          return [v.name, v.sizeLabel, v.size, v.sku, v.ean, ...dims].filter(Boolean).join(" ");
        })
        .join(" ");

      const catSynonyms =
        {
          beds: "agy agyak murphy bed lenyithato falagy wall bed foldaway",
          sofas: "kanape kanapek sofa couches seating",
          tables: "asztal asztalok table tables desk extending",
          mattresses: "matrac matracok mattress mattresses hybrid pocket spring",
          cabinets: "szekreny szekrenyek cabinet cabinets wardrobe storage",
          extras: "tartozek kiegészítő alkatresz gazteleszkop gas strut led",
        }[prod.parent_category] || "";

      const searchableText = normalizeStr(
        [
          prod.name,
          prod.title,
          prod.slug,
          prod.parent_category,
          prod.type,
          prod.sub_category,
          prod.orientation,
          prod.description,
          prod.tagline,
          prod.badge,
          catSynonyms,
          variantKeywords,
        ]
          .filter(Boolean)
          .join(" ")
      );

      return {
        ...prod,
        searchableText,
      };
    });
  }, []);

  // Filter products by search query, category, orientation, type, price, and stock
  const filteredProducts = useMemo(() => {
    let list = searchableProducts;

    // 1. Search Query Multi-token Match
    if (activeQuery && activeQuery.trim().length > 0) {
      const cleanQ = normalizeStr(activeQuery).trim().replace(/\s*[*x×]\s*/g, "x");
      const tokens = cleanQ
        .split(/[\s,]+/)
        .map((t) => t.replace(/-(as|es|os|us)$/i, ""))
        .filter(Boolean);

      list = list.filter((item) =>
        tokens.every((token) => item.searchableText.includes(token))
      );
    }

    // 2. Category Filter
    if (selectedCategory !== "All") {
      list = list.filter(
        (item) => item.parent_category === selectedCategory.toLowerCase()
      );
    }

    // 3. Orientation Filter
    if (selectedOrientation !== "All") {
      list = list.filter(
        (item) =>
          item.orientation &&
          item.orientation.toLowerCase() === selectedOrientation.toLowerCase()
      );
    }

    // 4. Type / Sub-category Filter
    if (selectedType !== "All") {
      const cleanTyp = selectedType.toLowerCase();
      list = list.filter(
        (item) =>
          (item.type && item.type.toLowerCase() === cleanTyp) ||
          (item.sub_category && item.sub_category.toLowerCase() === cleanTyp) ||
          (item.title && item.title.toLowerCase().includes(cleanTyp))
      );
    }

    // 5. Price Filter
    if (selectedPrice !== "All") {
      list = list.filter((item) => {
        const pricing = getProductPrice(item, locale);
        const priceNum =
          Number(pricing.raw ?? pricing.numeric ?? pricing.regularRaw) ||
          Number(item.sale_price_gbp || item.price_gbp || item.numericPrice) ||
          0;

        if (selectedPrice === "Under £500") return priceNum < 500;
        if (selectedPrice === "£500 - £800")
          return priceNum >= 500 && priceNum <= 800;
        if (selectedPrice === "Over £800") return priceNum > 800;
        return true;
      });
    }

    // 6. Stock Filter
    if (selectedStock === "in_stock") {
      list = list.filter((item) => {
        const isOutOfStock =
          (item.stock !== undefined &&
            item.stock !== null &&
            Number(item.stock) <= 0) ||
          item.in_stock === false;
        return !isOutOfStock;
      });
    }

    return list;
  }, [
    searchableProducts,
    activeQuery,
    selectedCategory,
    selectedOrientation,
    selectedType,
    selectedPrice,
    selectedStock,
    locale,
  ]);

  // Dynamic filter options
  const categoryOptions = [
    { key: "All", label: t("search.allCategories", "All Categories") },
    { key: "beds", label: t("categories.beds", "Murphy Beds") },
    { key: "sofas", label: t("categories.sofas", "Sofas") },
    { key: "tables", label: t("categories.tables", "Smart Tables") },
    { key: "mattresses", label: t("categories.mattresses", "Mattresses") },
    { key: "cabinets", label: t("categories.cabinets", "Cabinets") },
    { key: "extras", label: t("categories.extras", "Accessories") },
  ];

  const orientationOptions = [
    { key: "All", label: t("categories.all", "All") },
    { key: "Vertical", label: t("product.vertical", "Vertical") },
    { key: "Horizontal", label: t("product.horizontal", "Horizontal") },
  ];

  const priceOptions = ["All", "Under £500", "£500 - £800", "Over £800"];

  const formatPriceOption = useCallback(
    (opt) => {
      if (opt === "All") return t("categories.all", "All");
      if (opt === "Under £500") return `< ${formatPrice(500)}`;
      if (opt === "£500 - £800") return `${formatPrice(500)} - ${formatPrice(800)}`;
      if (opt === "Over £800") return `> ${formatPrice(800)}`;
      return opt;
    },
    [t, formatPrice]
  );

  const distinctTypes = useMemo(() => {
    let sourceProducts = searchableProducts;
    if (selectedCategory !== "All") {
      sourceProducts = sourceProducts.filter(
        (p) => p.parent_category === selectedCategory.toLowerCase()
      );
    }
    const types = Array.from(
      new Set(
        sourceProducts
          .map((p) => p.sub_category || p.type)
          .filter(Boolean)
      )
    );
    return ["All", ...types];
  }, [searchableProducts, selectedCategory]);

  const hasActiveFilters =
    Boolean(activeQuery) ||
    selectedCategory !== "All" ||
    selectedOrientation !== "All" ||
    selectedType !== "All" ||
    selectedPrice !== "All" ||
    selectedStock !== "All";

  const clearAllFilters = () => {
    setActiveQuery("");
    setSearchInput("");
    setSelectedCategory("All");
    setSelectedOrientation("All");
    setSelectedType("All");
    setSelectedPrice("All");
    setSelectedStock("All");
    updateUrlParams("", "All", "All", "All", "All", "All");
  };

  const popularSuggestions = [
    "Classic Vertical",
    "Studio Bed",
    "Integrated Murphy Bed",
    "160x200",
    "Single",
    "Modular Sofa",
    "Luxury Mattress",
    "Vertical Cabinet",
  ];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-wbk-white flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-wbk-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-wbk-white min-h-screen pt-10 pb-20 font-poppins">
      <Container size="xl">
        {/* ── BREADCRUMBS & MAIN SEARCH HEADER ── */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex-1">
            <nav className="flex items-center gap-1.5 text-[11px] text-wbk-brown/80 mb-2">
              <Link href={localizedHref("/")} className="hover:text-wbk-black transition-colors">
                {t("nav.home", "Home")}
              </Link>
              <span>/</span>
              <span className="capitalize text-wbk-black font-medium">
                {activeQuery ? t("search.searchResults", "Search Results") : t("nav.products", "Products")}
              </span>
              {activeQuery && (
                <>
                  <span>/</span>
                  <span className="text-wbk-brown truncate max-w-xs">&ldquo;{activeQuery}&rdquo;</span>
                </>
              )}
            </nav>

            <h1 className="font-new-york text-4xl sm:text-5xl md:text-6xl text-wbk-black capitalize leading-none tracking-tight">
              {activeQuery
                ? `${t("search.searchResultsFor", "Results for")} "${activeQuery}"`
                : t("search.allProducts", "All Products")}
            </h1>

            <p className="mt-3 text-sm text-wbk-brown max-w-xl leading-relaxed">
              {activeQuery
                ? t(
                    "search.searchResultsDesc",
                    "Browse all matching WallBedKing modular beds, sofas, mattresses, and storage cabinetry."
                  )
                : t(
                    "search.allProductsDesc",
                    "Explore our complete collection of modular space-saving Murphy beds, sofas, mattresses, and cabinetry."
                  )}
            </p>
          </div>

          <div className="text-xs text-wbk-brown shrink-0 pb-1">
            {t("categories.showing", "Showing")}{" "}
            <span className="font-semibold text-wbk-black">
              {filteredProducts.length}
            </span>{" "}
            {filteredProducts.length === 1
              ? t("categories.item", "item")
              : t("categories.items", "items")}
          </div>
        </div>

        {/* ── IN-PAGE LIVE SEARCH BAR (Hidden on mobile as header search bar is always present) ── */}
        <div className="hidden md:block mb-8">
          <form
            onSubmit={handlePerformSearch}
            className="flex items-center max-w-2xl bg-white border border-wbk-lightgrey focus-within:border-wbk-black shadow-xs transition-colors rounded-full overflow-hidden p-1.5"
          >
            <div className="pl-3.5 pr-2 text-wbk-brown">
              <IconSearch size={18} strokeWidth={1.8} />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t(
                "search.placeholder",
                "Search beds, sofas, mattresses, sizes (e.g. 160x200, Classic)..."
              )}
              className="w-full h-10 text-xs sm:text-sm bg-transparent text-wbk-black placeholder:text-wbk-brown/70 focus:outline-none"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="p-1 text-wbk-brown hover:text-wbk-black mr-2 cursor-pointer transition-colors"
                aria-label="Clear search input"
              >
                <IconX size={16} />
              </button>
            )}
            <button
              type="submit"
              className="px-5 sm:px-7 h-10 bg-wbk-black hover:bg-wbk-green hover:text-wbk-black text-white text-xs font-semibold uppercase tracking-wider rounded-full transition-colors cursor-pointer shrink-0"
            >
              {t("search.title", "Search")}
            </button>
          </form>

          {/* Quick search suggestions */}
          <div className="mt-3 flex items-center gap-2 flex-wrap text-xs text-wbk-brown">
            <span className="text-[11px] font-medium text-wbk-black/80">
              {t("search.popularSearches", "Popular:")}
            </span>
            {popularSuggestions.map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => {
                  setSearchInput(sug);
                  setActiveQuery(sug);
                  updateUrlParams(
                    sug,
                    selectedCategory,
                    selectedOrientation,
                    selectedType,
                    selectedPrice,
                    selectedStock
                  );
                  scrollToProducts();
                }}
                className={`text-[11px] px-2.5 py-0.5 rounded-full border border-wbk-lightgrey/80 transition-all cursor-pointer ${
                  activeQuery.toLowerCase() === sug.toLowerCase()
                    ? "bg-wbk-black text-white border-wbk-black"
                    : "bg-[#FBF9F8] text-wbk-brown hover:border-wbk-black hover:text-wbk-black"
                }`}
              >
                {sug}
              </button>
            ))}
          </div>
        </div>

        {/* Sentinel for sticky detection */}
        <div ref={sentinelRef} className="h-px w-full pointer-events-none mb-0" />

        {/* ── STICKY SWIPER FILTER BAR ── */}
        <div
          ref={filterContainerRef}
          style={{
            top: "calc(var(--header-height, 92px) - 1px)",
            transition: "top 0.25s ease-in-out, box-shadow 0.2s ease-in-out",
            overflowX: "clip",
            overflowY: "visible",
          }}
          className={`sticky z-20 bg-wbk-white flex flex-col justify-center -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-4 relative ${
            isSticky ? "shadow-xs border-b border-wbk-lightgrey/60" : ""
          }`}
        >
          <div className="w-full h-14 sm:h-[58px] flex items-center relative !overflow-visible shrink-0">
            <Swiper
              modules={[FreeMode, Mousewheel]}
              slidesPerView="auto"
              spaceBetween={10}
              freeMode={{ enabled: true, momentumRatio: 0.75 }}
              mousewheel={{ forceToAxis: true }}
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
              {/* Filter Label Badge */}
              <SwiperSlide className="!w-auto !h-full flex items-center !overflow-visible">
                <div
                  className="flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-wbk-black w-9 sm:w-auto h-9 px-0 sm:px-3.5 rounded-full bg-[#F4F2F0] border border-wbk-lightgrey/80 shrink-0 select-none"
                  title="Filters"
                >
                  <IconFilter size={15} className="text-wbk-gold" />
                  <span className="hidden sm:inline">{t("common.filters", "Filters")}</span>
                </div>
              </SwiperSlide>

              {/* 1. Category Filter */}
              <SwiperSlide className="!w-auto !h-full flex items-center !overflow-visible">
                <div className="relative flex items-center !overflow-visible" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(activeDropdown === "category" ? null : "category")}
                    className={`flex items-center justify-between gap-2.5 sm:gap-3 px-4 sm:px-5 h-9 border text-xs transition-all rounded-full cursor-pointer whitespace-nowrap select-none ${
                      selectedCategory !== "All"
                        ? "border-wbk-black bg-[#FBF9F8] font-semibold text-wbk-black shadow-2xs"
                        : "border-wbk-lightgrey bg-white text-wbk-black hover:border-wbk-black shadow-2xs"
                    }`}
                  >
                    <span>
                      {t("search.category", "Category")}:{" "}
                      <strong className="font-semibold">
                        {categoryOptions.find((c) => c.key === selectedCategory)?.label || selectedCategory}
                      </strong>
                    </span>
                    <IconChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${
                        activeDropdown === "category" ? "rotate-180 text-wbk-gold" : "text-wbk-brown"
                      }`}
                    />
                  </button>

                  {activeDropdown === "category" && (
                    <div className="absolute top-full left-0 mt-1.5 z-50 bg-wbk-white border border-wbk-lightgrey/80 shadow-2xl p-2 min-w-[200px] rounded-none">
                      {categoryOptions.map((opt) => (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(opt.key);
                            setSelectedType("All");
                            updateUrlParams(
                              activeQuery,
                              opt.key,
                              selectedOrientation,
                              "All",
                              selectedPrice,
                              selectedStock
                            );
                            setActiveDropdown(null);
                            scrollToProducts();
                          }}
                          className={`w-full text-left px-4 py-2 text-xs rounded-none transition-colors whitespace-nowrap cursor-pointer ${
                            selectedCategory === opt.key
                              ? "bg-[#F4F2F0] font-semibold text-wbk-black"
                              : "text-wbk-black hover:bg-[#FBF9F8] hover:text-wbk-green"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </SwiperSlide>

              {/* 2. Type / Model Filter */}
              {distinctTypes.length > 2 && (
                <SwiperSlide className="!w-auto !h-full flex items-center !overflow-visible">
                  <div className="relative flex items-center !overflow-visible" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setActiveDropdown(activeDropdown === "type" ? null : "type")}
                      className={`flex items-center justify-between gap-2.5 sm:gap-3 px-4 sm:px-5 h-9 border text-xs transition-all rounded-full cursor-pointer whitespace-nowrap select-none ${
                        selectedType !== "All"
                          ? "border-wbk-black bg-[#FBF9F8] font-semibold text-wbk-black shadow-2xs"
                          : "border-wbk-lightgrey bg-white text-wbk-black hover:border-wbk-black shadow-2xs"
                      }`}
                    >
                      <span>
                        {t("common.style", "Type")}:{" "}
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
                      <div className="absolute top-full left-0 mt-1.5 z-50 bg-wbk-white border border-wbk-lightgrey/80 shadow-2xl p-2 min-w-[170px] rounded-none">
                        {distinctTypes.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              setSelectedType(opt);
                              updateUrlParams(
                                activeQuery,
                                selectedCategory,
                                selectedOrientation,
                                opt,
                                selectedPrice,
                                selectedStock
                              );
                              setActiveDropdown(null);
                              scrollToProducts();
                            }}
                            className={`w-full text-left px-4 py-2 text-xs rounded-none transition-colors whitespace-nowrap cursor-pointer ${
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

              {/* 3. Orientation Filter */}
              <SwiperSlide className="!w-auto !h-full flex items-center !overflow-visible">
                <div className="relative flex items-center !overflow-visible" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(activeDropdown === "orientation" ? null : "orientation")}
                    className={`flex items-center justify-between gap-2.5 sm:gap-3 px-4 sm:px-5 h-9 border text-xs transition-all rounded-full cursor-pointer whitespace-nowrap select-none ${
                      selectedOrientation !== "All"
                        ? "border-wbk-black bg-[#FBF9F8] font-semibold text-wbk-black shadow-2xs"
                        : "border-wbk-lightgrey bg-white text-wbk-black hover:border-wbk-black shadow-2xs"
                    }`}
                  >
                    <span>
                      {t("product.orientation", "Orientation")}:{" "}
                      <strong className="font-semibold">{selectedOrientation}</strong>
                    </span>
                    <IconChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${
                        activeDropdown === "orientation" ? "rotate-180 text-wbk-gold" : "text-wbk-brown"
                      }`}
                    />
                  </button>

                  {activeDropdown === "orientation" && (
                    <div className="absolute top-full left-0 mt-1.5 z-50 bg-wbk-white border border-wbk-lightgrey/80 shadow-2xl p-2 min-w-[170px] rounded-none">
                      {orientationOptions.map((opt) => (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => {
                            setSelectedOrientation(opt.key);
                            updateUrlParams(
                              activeQuery,
                              selectedCategory,
                              opt.key,
                              selectedType,
                              selectedPrice,
                              selectedStock
                            );
                            setActiveDropdown(null);
                            scrollToProducts();
                          }}
                          className={`w-full text-left px-4 py-2 text-xs rounded-none transition-colors whitespace-nowrap cursor-pointer ${
                            selectedOrientation === opt.key
                              ? "bg-[#F4F2F0] font-semibold text-wbk-black"
                              : "text-wbk-black hover:bg-[#FBF9F8] hover:text-wbk-green"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </SwiperSlide>

              {/* 4. Price Filter */}
              <SwiperSlide className="!w-auto !h-full flex items-center !overflow-visible">
                <div className="relative flex items-center !overflow-visible" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(activeDropdown === "price" ? null : "price")}
                    className={`flex items-center justify-between gap-2.5 sm:gap-3 px-4 sm:px-5 h-9 border text-xs transition-all rounded-full cursor-pointer whitespace-nowrap select-none ${
                      selectedPrice !== "All"
                        ? "border-wbk-black bg-[#FBF9F8] font-semibold text-wbk-black shadow-2xs"
                        : "border-wbk-lightgrey bg-white text-wbk-black hover:border-wbk-black shadow-2xs"
                    }`}
                  >
                    <span>
                      {t("categories.filterPrice", "Price")}:{" "}
                      <strong className="font-semibold">{formatPriceOption(selectedPrice)}</strong>
                    </span>
                    <IconChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${
                        activeDropdown === "price" ? "rotate-180 text-wbk-gold" : "text-wbk-brown"
                      }`}
                    />
                  </button>

                  {activeDropdown === "price" && (
                    <div className="absolute top-full left-0 mt-1.5 z-50 bg-wbk-white border border-wbk-lightgrey/80 shadow-2xl p-2 min-w-[170px] rounded-none">
                      {priceOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setSelectedPrice(opt);
                            updateUrlParams(
                              activeQuery,
                              selectedCategory,
                              selectedOrientation,
                              selectedType,
                              opt,
                              selectedStock
                            );
                            setActiveDropdown(null);
                            scrollToProducts();
                          }}
                          className={`w-full text-left px-4 py-2 text-xs rounded-none transition-colors whitespace-nowrap cursor-pointer ${
                            selectedPrice === opt
                              ? "bg-[#F4F2F0] font-semibold text-wbk-black"
                              : "text-wbk-black hover:bg-[#FBF9F8] hover:text-wbk-green"
                          }`}
                        >
                          {formatPriceOption(opt)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </SwiperSlide>

              {/* 5. Stock Status Filter */}
              <SwiperSlide className="!w-auto !h-full flex items-center !overflow-visible">
                <div className="relative flex items-center !overflow-visible" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(activeDropdown === "stock" ? null : "stock")}
                    className={`flex items-center justify-between gap-2.5 sm:gap-3 px-4 sm:px-5 h-9 border text-xs transition-all rounded-full cursor-pointer whitespace-nowrap select-none ${
                      selectedStock !== "All"
                        ? "border-wbk-black bg-[#FBF9F8] font-semibold text-wbk-black shadow-2xs"
                        : "border-wbk-lightgrey bg-white text-wbk-black hover:border-wbk-black shadow-2xs"
                    }`}
                  >
                    <span>
                      {t("search.stock", "Stock")}:{" "}
                      <strong className="font-semibold">
                        {selectedStock === "in_stock"
                          ? t("search.inStockOnly", "In Stock Only")
                          : t("search.allStock", "All")}
                      </strong>
                    </span>
                    <IconChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${
                        activeDropdown === "stock" ? "rotate-180 text-wbk-gold" : "text-wbk-brown"
                      }`}
                    />
                  </button>

                  {activeDropdown === "stock" && (
                    <div className="absolute top-full right-0 sm:left-0 mt-1.5 z-50 bg-wbk-white border border-wbk-lightgrey/80 shadow-2xl p-2 min-w-[170px] rounded-none">
                      {[
                        { key: "All", label: t("search.allStock", "All Stock") },
                        { key: "in_stock", label: t("search.inStockOnly", "In Stock Only") },
                      ].map((opt) => (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => {
                            setSelectedStock(opt.key);
                            updateUrlParams(
                              activeQuery,
                              selectedCategory,
                              selectedOrientation,
                              selectedType,
                              selectedPrice,
                              opt.key
                            );
                            setActiveDropdown(null);
                            scrollToProducts();
                          }}
                          className={`w-full text-left px-4 py-2 text-xs rounded-none transition-colors whitespace-nowrap cursor-pointer ${
                            selectedStock === opt.key
                              ? "bg-[#F4F2F0] font-semibold text-wbk-black"
                              : "text-wbk-black hover:bg-[#FBF9F8] hover:text-wbk-green"
                          }`}
                        >
                          {opt.label}
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
                    className="px-4 h-9 border border-transparent text-xs text-wbk-brown hover:text-wbk-black underline cursor-pointer whitespace-nowrap rounded-full hover:bg-[#F4F2F0] transition-colors select-none flex items-center justify-center"
                  >
                    {t("categories.resetFilters", "Reset filters")}
                  </button>
                </SwiperSlide>
              )}
            </Swiper>

            {/* Right gradient to fade filter chips behind arrow */}
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

          {/* ── ACTIVE FILTER CHIPS BAR ── */}
          {hasActiveFilters && (
            <div className="w-full py-2 border-t border-wbk-lightgrey/50 flex items-center gap-1.5 flex-wrap">
              {activeQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-wbk-black text-white text-[11px] rounded-full hover:bg-neutral-800 transition-all cursor-pointer shadow-xs select-none"
                  title="Remove search query"
                >
                  <span className="font-medium text-white">
                    {t("search.query", "Keyword")}: &ldquo;{activeQuery}&rdquo;
                  </span>
                  <IconX size={11} className="text-white/80 hover:text-white ml-0.5" stroke={2.5} />
                </button>
              )}

              {selectedCategory !== "All" && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("All");
                    updateUrlParams(activeQuery, "All", selectedOrientation, selectedType, selectedPrice, selectedStock);
                    scrollToProducts();
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-wbk-black text-white text-[11px] rounded-full hover:bg-neutral-800 transition-all cursor-pointer shadow-xs select-none"
                  title="Remove category filter"
                >
                  <span className="font-medium text-white">
                    {categoryOptions.find((c) => c.key === selectedCategory)?.label || selectedCategory}
                  </span>
                  <IconX size={11} className="text-white/80 hover:text-white ml-0.5" stroke={2.5} />
                </button>
              )}

              {selectedOrientation !== "All" && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOrientation("All");
                    updateUrlParams(activeQuery, selectedCategory, "All", selectedType, selectedPrice, selectedStock);
                    scrollToProducts();
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-wbk-black text-white text-[11px] rounded-full hover:bg-neutral-800 transition-all cursor-pointer shadow-xs select-none"
                  title="Remove orientation filter"
                >
                  <span className="font-medium text-white">{selectedOrientation}</span>
                  <IconX size={11} className="text-white/80 hover:text-white ml-0.5" stroke={2.5} />
                </button>
              )}

              {selectedType !== "All" && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedType("All");
                    updateUrlParams(activeQuery, selectedCategory, selectedOrientation, "All", selectedPrice, selectedStock);
                    scrollToProducts();
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-wbk-black text-white text-[11px] rounded-full hover:bg-neutral-800 transition-all cursor-pointer shadow-xs select-none"
                  title="Remove type filter"
                >
                  <span className="font-medium text-white">{selectedType}</span>
                  <IconX size={11} className="text-white/80 hover:text-white ml-0.5" stroke={2.5} />
                </button>
              )}

              {selectedPrice !== "All" && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPrice("All");
                    updateUrlParams(activeQuery, selectedCategory, selectedOrientation, selectedType, "All", selectedStock);
                    scrollToProducts();
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-wbk-black text-white text-[11px] rounded-full hover:bg-neutral-800 transition-all cursor-pointer shadow-xs select-none"
                  title="Remove price filter"
                >
                  <span className="font-medium text-white">{formatPriceOption(selectedPrice)}</span>
                  <IconX size={11} className="text-white/80 hover:text-white ml-0.5" stroke={2.5} />
                </button>
              )}

              {selectedStock !== "All" && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStock("All");
                    updateUrlParams(activeQuery, selectedCategory, selectedOrientation, selectedType, selectedPrice, "All");
                    scrollToProducts();
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-wbk-black text-white text-[11px] rounded-full hover:bg-neutral-800 transition-all cursor-pointer shadow-xs select-none"
                  title="Remove stock filter"
                >
                  <span className="font-medium text-white">{t("search.inStockOnly", "In Stock Only")}</span>
                  <IconX size={11} className="text-white/80 hover:text-white ml-0.5" stroke={2.5} />
                </button>
              )}

              <button
                type="button"
                onClick={clearAllFilters}
                className="text-[10px] text-wbk-brown hover:text-wbk-black underline ml-1 cursor-pointer py-0.5"
              >
                {t("categories.clearAll", "Clear all")}
              </button>
            </div>
          )}
        </div>

        {/* ── PRODUCT GRID OR EMPTY STATE ── */}
        {filteredProducts.length === 0 ? (
          <div
            ref={productGridRef}
            className="py-16 sm:py-24 text-center px-4 bg-[#FBF9F8] border border-wbk-lightgrey/80 rounded-2xl max-w-2xl mx-auto space-y-5 shadow-xs"
          >
            <div className="w-16 h-16 rounded-full bg-wbk-gold/15 text-wbk-gold flex items-center justify-center mx-auto border border-wbk-gold/30">
              <IconSearch size={28} />
            </div>
            <div>
              <p className="font-new-york text-2xl sm:text-3xl text-wbk-black">
                {activeQuery
                  ? `${t("search.noResults", "No products found for")} "${activeQuery}"`
                  : t("categories.noProductsFound", "No products found")}
              </p>
              <p className="mt-2 text-xs sm:text-sm text-wbk-brown max-w-md mx-auto leading-relaxed">
                {t(
                  "search.tryAdjusting",
                  "Try checking your spelling or adjusting your filters. You can also explore popular suggestions below."
                )}
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
              {popularSuggestions.slice(0, 4).map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => {
                    setSearchInput(sug);
                    setActiveQuery(sug);
                    updateUrlParams(
                      sug,
                      "All",
                      "All",
                      "All",
                      "All",
                      "All"
                    );
                    scrollToProducts();
                  }}
                  className="px-3.5 py-1.5 bg-white border border-wbk-lightgrey hover:border-wbk-black text-xs font-medium text-wbk-black rounded-full transition-colors cursor-pointer shadow-2xs"
                >
                  {sug}
                </button>
              ))}
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={clearAllFilters}
                className="px-6 py-2.5 bg-wbk-black hover:bg-wbk-green hover:text-wbk-black text-white text-xs font-semibold uppercase tracking-wider rounded-full transition-colors cursor-pointer shadow-sm"
              >
                {t("search.clearFilters", "Clear all filters")}
              </button>
            </div>
          </div>
        ) : (
          <div
            ref={productGridRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 mb-24"
          >
            {filteredProducts.map((prod) => (
              <ProductCard key={prod.id || prod.slug} product={prod} />
            ))}
          </div>
        )}

        {/* ── CATEGORIES SHOWCASE FOOTER ── */}
        <div className="mt-20 border-t border-wbk-lightgrey/80 pt-16">
          <h2 className="font-new-york text-3xl md:text-4xl text-wbk-black mb-8">
            {t("categories.otherCategories", "Explore Categories")}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {OTHER_CATEGORIES_LIST.map((cat) => (
              <Link
                key={cat.slug}
                href={localizedHref(`/products/${cat.slug}`)}
                className="group flex flex-col items-center text-center p-3 rounded-xl border border-wbk-lightgrey/50 hover:border-wbk-black bg-white hover:shadow-sm transition-all"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-[#F8F7F5] flex items-center justify-center p-3 rounded-lg mb-2">
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <span className="text-xs font-medium uppercase tracking-wider text-wbk-black group-hover:text-wbk-green transition-colors">
                  {t(`categories.${cat.slug}`, cat.label)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-wbk-white flex items-center justify-center">
          <div className="h-10 w-10 border-4 border-wbk-green border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ProductsSearchContent />
    </Suspense>
  );
}
