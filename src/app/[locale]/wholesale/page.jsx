"use client";

import {
  Suspense,
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  IconSearch,
  IconChevronDown,
  IconFilter,
  IconChevronRight,
  IconX,
  IconCheck,
  IconLayoutGrid,
  IconList,
  IconLock,
  IconLogin,
} from "@tabler/icons-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";

import { Container } from "@/components/ui/Container";
import { TagIcon } from "@/components/ui/TagBadge";
import {
  WholesaleProductCard,
  getWholesaleCategorySlug,
} from "@/components/wholesale/WholesaleProductCard";
import { useLocale } from "@/context/LocaleContext";
import { useAuth } from "@/context/AuthContext";
import { useProductCatalog } from "@/context/ProductCatalogContext";
import { useWholesale } from "@/context/WholesaleContext";
import { getAllTags, getTagMeta, getLocalizedTagName } from "@/lib/tags";
import {
  getLocalizedProductName,
  getLocalizedProductDescription,
} from "@/lib/products";

const normalizeStr = (s) =>
  s
    ? String(s)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
    : "";

function WholesaleCatalogContent() {
  const searchParams = useSearchParams();
  const { t, localizedHref, locale } = useLocale();
  const { user, openUserDrawer } = useAuth();
  const { rawCatalog } = useProductCatalog();
  const {
    pricingLoading,
    authorized,
    partner,
    prices,
    hiddenProductIds,
    addWholesaleItem,
  } = useWholesale();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // ── SEARCH, FILTER & VIEW STATES (matching /products 1:1) ──
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
  const [searchInput, setSearchInput] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedOrientation, setSelectedOrientation] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedTag, setSelectedTag] = useState("All");
  const [selectedPricingFilter, setSelectedPricingFilter] = useState("All"); // "All" | "priced" | "container"
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Sticky filter bar refs
  const sentinelRef = useRef(null);
  const filterContainerRef = useRef(null);
  const productGridRef = useRef(null);
  const [isSticky, setIsSticky] = useState(false);
  const [filterSwiper, setFilterSwiper] = useState(null);
  const [isFilterEnd, setIsFilterEnd] = useState(false);

  // Sync URL params on mount / navigation
  useEffect(() => {
    const q = searchParams?.get("search") || searchParams?.get("q") || "";
    setActiveQuery(q);
    setSearchInput(q);
    setSelectedCategory(searchParams?.get("category")?.toLowerCase() || "All");
    setSelectedOrientation(searchParams?.get("orientation") || "All");
    setSelectedType(searchParams?.get("type") || searchParams?.get("sub_category") || "All");
    setSelectedTag(searchParams?.get("tag") || "All");
    setSelectedPricingFilter(searchParams?.get("pricing") || "All");
    const v = searchParams?.get("view");
    if (v === "list" || v === "grid") setViewMode(v);
  }, [searchParams]);

  const updateUrlParams = useCallback(
    (newQ, newCat, newOrient, newType, newTag, newPricing) => {
      if (typeof window === "undefined") return;
      const url = new URL(window.location.href);

      const setOrDel = (k, val, allVal = "All") => {
        if (val && val !== allVal && String(val).trim()) {
          url.searchParams.set(k, String(val).trim());
        } else {
          url.searchParams.delete(k);
        }
      };

      setOrDel("search", newQ, "");
      url.searchParams.delete("q");
      setOrDel("category", newCat);
      setOrDel("orientation", newOrient);
      setOrDel("type", newType);
      setOrDel("tag", newTag !== undefined ? newTag : selectedTag);
      setOrDel("pricing", newPricing !== undefined ? newPricing : selectedPricingFilter);

      window.history.replaceState(null, "", url.toString());
    },
    [selectedTag, selectedPricingFilter]
  );

  // Sticky sentinel observer
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsSticky(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-100px 0px 0px 0px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [mounted]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterContainerRef.current && !filterContainerRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const scrollToProducts = () => {
    if (typeof window === "undefined") return;
    requestAnimationFrame(() => {
      if (!productGridRef.current) return;
      const headerEl = document.querySelector("header");
      const headerHeight = headerEl ? headerEl.offsetHeight : 92;
      const filterHeight = filterContainerRef.current ? filterContainerRef.current.offsetHeight : 58;
      const rect = productGridRef.current.getBoundingClientRect();
      const targetScrollY = window.pageYOffset + rect.top - (headerHeight + filterHeight) - 24;
      window.scrollTo({ top: Math.max(0, targetScrollY), behavior: "smooth" });
    });
  };

  const handlePerformSearch = (e) => {
    e?.preventDefault();
    const clean = searchInput.trim();
    setActiveQuery(clean);
    updateUrlParams(clean, selectedCategory, selectedOrientation, selectedType, selectedTag, selectedPricingFilter);
    scrollToProducts();
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setActiveQuery("");
    updateUrlParams("", selectedCategory, selectedOrientation, selectedType, selectedTag, selectedPricingFilter);
  };

  const hiddenSet = useMemo(() => new Set((hiddenProductIds || []).map(String)), [hiddenProductIds]);

  // ALL non-hidden catalog products (ignores available_locales & stock === 0 for B2B!)
  const searchableProducts = useMemo(() => {
    const list = Array.isArray(rawCatalog) ? rawCatalog : [];
    return list
      .filter((p) => {
        if (!p || !p.id) return false;
        const vis = String(p.visibility || "").toLowerCase().trim();
        if (vis === "hidden" || p.visibility === false || p.is_visible === false) return false;
        if (hiddenSet.has(String(p.id))) return false;
        if (/test/i.test(p.name || "") || /test/i.test(p.slug || "")) return false;
        return true;
      })
      .map((prod) => {
        const catSlug = getWholesaleCategorySlug(prod);
        const catSynonyms =
          {
            beds: "agy agyak murphy bed lenyithato falagy wall bed foldaway",
            sofas: "kanape kanapek sofa couches seating",
            tables: "asztal asztalok table tables desk extending smart",
            mattresses: "matrac matracok mattress mattresses hybrid pocket spring",
            cabinets: "szekreny szekrenyek cabinet cabinets wardrobe storage",
            extras: "tartozek kiegeszito alkatresz gazteleszkop gas strut led",
          }[catSlug] || "";

        const tagKeywords = (prod.tags || [])
          .map((tagId) => {
            const meta = getTagMeta(tagId);
            return meta
              ? `${meta.name} ${meta.slug} ${getLocalizedTagName(tagId, locale)}`
              : tagId;
          })
          .join(" ");

        const w = prod.width ? Math.round(prod.width / 10) : "";
        const l = prod.length ? Math.round(prod.length / 10) : "";
        const dims = w && l ? `${w}x${l} ${l}x${w}` : "";

        const searchableText = normalizeStr(
          [
            prod.name,
            getLocalizedProductName(prod, locale),
            prod.title,
            prod.slug,
            prod.sku,
            prod.ean,
            prod.category,
            prod.parent_category,
            catSlug,
            prod.type,
            prod.sub_category,
            prod.orientation,
            prod.color,
            prod.description,
            getLocalizedProductDescription(prod, locale),
            dims,
            catSynonyms,
            tagKeywords,
          ]
            .filter(Boolean)
            .join(" ")
        );

        return {
          ...prod,
          _catSlug: catSlug,
          searchableText,
        };
      });
  }, [rawCatalog, hiddenSet, locale]);

  const filteredProducts = useMemo(() => {
    let list = searchableProducts;

    if (activeQuery && activeQuery.trim().length > 0) {
      const cleanQ = normalizeStr(activeQuery).trim().replace(/\s*[*x×]\s*/g, "x");
      const tokens = cleanQ.split(/[\s,]+/).filter(Boolean);
      list = list.filter((item) => tokens.every((tok) => item.searchableText.includes(tok)));
    }

    if (selectedCategory !== "All") {
      const targetCat = selectedCategory.toLowerCase();
      list = list.filter((item) => item._catSlug === targetCat || item.parent_category === targetCat);
    }

    if (selectedOrientation !== "All") {
      list = list.filter(
        (item) =>
          item.orientation &&
          item.orientation.toLowerCase() === selectedOrientation.toLowerCase()
      );
    }

    if (selectedType !== "All") {
      const cleanTyp = selectedType.toLowerCase();
      list = list.filter(
        (item) =>
          (item.type && item.type.toLowerCase() === cleanTyp) ||
          (item.sub_category && item.sub_category.toLowerCase() === cleanTyp) ||
          (item.category && item.category.toLowerCase() === cleanTyp)
      );
    }

    if (selectedTag !== "All") {
      list = list.filter((item) => Array.isArray(item.tags) && item.tags.includes(selectedTag));
    }

    if (authorized && selectedPricingFilter === "priced") {
      list = list.filter((item) => Boolean(prices[String(item.id)]?.hasPrice));
    } else if (authorized && selectedPricingFilter === "container") {
      list = list.filter(
        (item) => Boolean(prices[String(item.id)]?.hasPrice && prices[String(item.id)]?.containerQty > 0)
      );
    }

    return list;
  }, [
    searchableProducts,
    activeQuery,
    selectedCategory,
    selectedOrientation,
    selectedType,
    selectedTag,
    selectedPricingFilter,
    authorized,
    prices,
  ]);

  // All categories across the entire catalog (no locale exclusion for Wholesale!)
  const categoryOptions = useMemo(() => {
    const allOptions = [
      { key: "All", label: t("search.allCategories", "All Categories") },
      { key: "beds", label: t("categories.beds", "Murphy Beds") },
      { key: "tables", label: t("categories.tables", "Smart Tables") },
      { key: "sofas", label: t("categories.sofas", "Sofas") },
      { key: "mattresses", label: t("categories.mattresses", "Mattresses") },
      { key: "cabinets", label: t("categories.cabinets", "Cabinets") },
      { key: "extras", label: t("categories.extras", "Accessories") },
    ];
    const present = new Set(searchableProducts.map((p) => p._catSlug).filter(Boolean));
    return allOptions.filter((opt) => opt.key === "All" || present.has(opt.key));
  }, [t, searchableProducts]);

  const orientationOptions = [
    { key: "All", label: t("categories.all", "All") },
    { key: "Vertical", label: t("product.vertical", "Vertical") },
    { key: "Horizontal", label: t("product.horizontal", "Horizontal") },
  ];

  const distinctTypes = useMemo(() => {
    let src = searchableProducts;
    if (selectedCategory !== "All") {
      src = src.filter((p) => p._catSlug === selectedCategory.toLowerCase());
    }
    const types = Array.from(
      new Set(src.map((p) => p.sub_category || p.type).filter(Boolean))
    );
    return ["All", ...types];
  }, [searchableProducts, selectedCategory]);

  const availableTags = useMemo(() => getAllTags(), []);

  const hasActiveFilters =
    Boolean(activeQuery) ||
    selectedCategory !== "All" ||
    selectedOrientation !== "All" ||
    selectedType !== "All" ||
    selectedTag !== "All" ||
    selectedPricingFilter !== "All";

  const clearAllFilters = () => {
    setActiveQuery("");
    setSearchInput("");
    setSelectedCategory("All");
    setSelectedOrientation("All");
    setSelectedType("All");
    setSelectedTag("All");
    setSelectedPricingFilter("All");
    updateUrlParams("", "All", "All", "All", "All", "All");
  };

  const popularSuggestions = useMemo(
    () => [
      "Smart Table",
      "Classic Vertical",
      "Studio Bed",
      "Integrated",
      "160x200",
      "Walnut",
      "White",
      "Mattress",
    ],
    []
  );

  const handleQuickAdd = useCallback(
    (product, pricingInfo, orderUnit) => {
      addWholesaleItem(product, pricingInfo, { orderUnit, quantity: 1 });
    },
    [addWholesaleItem]
  );

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
        {/* ── BREADCRUMBS & MAIN HEADER (exact /products styling) ── */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex-1">
            <nav className="flex items-center gap-1.5 text-[11px] text-wbk-brown/80 mb-2">
              <Link href={localizedHref("/")} className="hover:text-wbk-black transition-colors">
                {t("nav.home", "Home")}
              </Link>
              <span>/</span>
              <span className="capitalize text-wbk-black font-medium">
                {activeQuery
                  ? t("search.searchResults", "Search Results")
                  : "Wholesale"}
              </span>
              {activeQuery && (
                <>
                  <span>/</span>
                  <span className="text-wbk-brown truncate max-w-xs">&ldquo;{activeQuery}&rdquo;</span>
                </>
              )}
            </nav>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-new-york text-4xl sm:text-5xl md:text-6xl text-wbk-black capitalize leading-none tracking-tight">
                {activeQuery
                  ? `${t("search.searchResultsFor", "Results for")} "${activeQuery}"`
                  : "Wholesale Catalog"}
              </h1>
              {authorized && partner && (
                <span className="px-3 py-1 rounded-full bg-wbk-black text-wbk-gold text-[11px] font-mono font-bold uppercase tracking-wider">
                  {partner.roleKey}
                  {partner.discountPercent > 0 ? ` • -${partner.discountPercent}%` : ""}
                </span>
              )}
            </div>

            <p className="mt-3 text-sm text-wbk-brown max-w-2xl leading-relaxed">
              Full B2B catalog across all WallBedKing collections. All wholesale prices are{" "}
              <strong className="text-wbk-black font-semibold">Net (Excl. VAT)</strong> — shipping &amp; container freight are arranged separately.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 shrink-0 pb-1 w-full md:w-auto">
            {!pricingLoading && !authorized && (
              <button
                type="button"
                onClick={() => openUserDrawer("login")}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-wbk-black hover:bg-wbk-green hover:text-wbk-black text-white text-xs font-semibold uppercase tracking-wider rounded-full transition-colors cursor-pointer"
              >
                <IconLogin size={15} />
                <span>{user ? "Switch Account" : "Log In for Prices"}</span>
              </button>
            )}
            <div className="text-xs text-wbk-brown">
              {t("categories.showing", "Showing")}{" "}
              <span className="font-semibold text-wbk-black">{filteredProducts.length}</span>{" "}
              {filteredProducts.length === 1
                ? t("categories.item", "item")
                : t("categories.items", "items")}
            </div>

            {/* Grid / List View Switcher — cleanly separated from the filter swiper */}
            <div className="inline-flex items-center h-9 p-0.5 rounded-full bg-[#F4F2F0] border border-wbk-lightgrey/80 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-wbk-black text-white shadow-2xs"
                    : "text-wbk-brown hover:text-wbk-black"
                }`}
                title="Grid View"
              >
                <IconLayoutGrid size={14} />
                <span>Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-wbk-black text-white shadow-2xs"
                    : "text-wbk-brown hover:text-wbk-black"
                }`}
                title="List View"
              >
                <IconList size={14} />
                <span>List</span>
              </button>
            </div>
          </div>
        </div>

        {/* Subtle B2B Price Lock Banner when not authorized */}
        {!pricingLoading && !authorized && (
          <div className="mb-6 px-4 py-3 bg-[#FBF9F8] border border-wbk-lightgrey flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-wbk-black">
            <div className="flex items-center gap-2">
              <IconLock size={15} className="text-wbk-gold shrink-0" />
              <span>
                {user
                  ? "Your account does not currently have wholesale partner permissions. Contact our trade team to activate B2B pricing."
                  : "Log in to your wholesale account to view net wholesale & full-container prices (Excl. VAT)."}
              </span>
            </div>
            {!user && (
              <button
                type="button"
                onClick={() => openUserDrawer("login")}
                className="text-xs font-semibold underline text-wbk-black hover:text-wbk-green shrink-0 cursor-pointer"
              >
                Log in to your account →
              </button>
            )}
          </div>
        )}

        {/* ── IN-PAGE LIVE SEARCH BAR (identical to /products) ── */}
        <div className="mb-8">
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
              placeholder="Search products, SKU, EAN, sizes (e.g. Smart Table, 160x200)..."
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
                    selectedTag,
                    selectedPricingFilter
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

        {/* ── STICKY SWIPER FILTER BAR (identical to /products + Grid/List switcher) ── */}
        <div
          ref={filterContainerRef}
          style={{
            top: "calc(var(--header-height, 92px) - 1px)",
            transition: "top 0.25s ease-in-out, box-shadow 0.2s ease-in-out",
            overflowX: "clip",
            overflowY: "visible",
          }}
          className={`sticky z-20 bg-wbk-white flex flex-col justify-center -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-6 relative ${
            isSticky ? "shadow-xs border-b border-wbk-lightgrey/60" : ""
          }`}
        >
          <div className="w-full h-14 sm:h-[58px] flex items-center gap-3 relative !overflow-visible shrink-0">
            <div className="flex-1 min-w-0 h-full relative !overflow-visible">
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
                              updateUrlParams(activeQuery, opt.key, selectedOrientation, "All", selectedTag, selectedPricingFilter);
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
                        <div className="absolute top-full left-0 mt-1.5 z-50 bg-wbk-white border border-wbk-lightgrey/80 shadow-2xl p-2 min-w-[170px] rounded-none max-h-64 overflow-y-auto">
                          {distinctTypes.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setSelectedType(opt);
                                updateUrlParams(activeQuery, selectedCategory, selectedOrientation, opt, selectedTag, selectedPricingFilter);
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
                        <strong className="font-semibold">
                          {selectedOrientation === "All"
                            ? t("categories.all", "All")
                            : orientationOptions.find((o) => o.key === selectedOrientation)?.label || selectedOrientation}
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
                      <div className="absolute top-full left-0 mt-1.5 z-50 bg-wbk-white border border-wbk-lightgrey/80 shadow-2xl p-2 min-w-[170px] rounded-none">
                        {orientationOptions.map((opt) => (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => {
                              setSelectedOrientation(opt.key);
                              updateUrlParams(activeQuery, selectedCategory, opt.key, selectedType, selectedTag, selectedPricingFilter);
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

                {/* 4. Tag Filter */}
                {availableTags.length > 0 && (
                  <SwiperSlide className="!w-auto !h-full flex items-center !overflow-visible">
                    <div className="relative flex items-center !overflow-visible" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setActiveDropdown(activeDropdown === "tag" ? null : "tag")}
                        className={`flex items-center justify-between gap-2.5 sm:gap-3 px-4 sm:px-5 h-9 border text-xs transition-all rounded-full cursor-pointer whitespace-nowrap select-none ${
                          selectedTag !== "All"
                            ? "border-wbk-black bg-[#FBF9F8] font-semibold text-wbk-black shadow-2xs"
                            : "border-wbk-lightgrey bg-white text-wbk-black hover:border-wbk-black shadow-2xs"
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <TagIcon
                            tagIdOrSlug={selectedTag !== "All" ? selectedTag : "tag"}
                            size={13}
                            className={selectedTag !== "All" ? "text-wbk-black" : "text-wbk-brown"}
                          />
                          <span>
                            {t("common.tags", "Tag")}:{" "}
                            <strong className="font-semibold">
                              {selectedTag === "All"
                                ? t("categories.all", "All")
                                : getLocalizedTagName(selectedTag, locale)}
                            </strong>
                          </span>
                        </span>
                        <IconChevronDown
                          size={14}
                          className={`transition-transform duration-200 ${
                            activeDropdown === "tag" ? "rotate-180 text-wbk-gold" : "text-wbk-brown"
                          }`}
                        />
                      </button>

                      {activeDropdown === "tag" && (
                        <div className="absolute top-full right-0 sm:left-0 mt-1.5 z-50 bg-wbk-white border border-wbk-lightgrey/80 shadow-2xl p-2 min-w-[200px] rounded-none">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTag("All");
                              updateUrlParams(activeQuery, selectedCategory, selectedOrientation, selectedType, "All", selectedPricingFilter);
                              setActiveDropdown(null);
                              scrollToProducts();
                            }}
                            className={`w-full text-left px-4 py-2 text-xs rounded-none transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                              selectedTag === "All"
                                ? "bg-[#F4F2F0] font-semibold text-wbk-black"
                                : "text-wbk-black hover:bg-[#FBF9F8] hover:text-wbk-green"
                            }`}
                          >
                            <TagIcon tagIdOrSlug="tag" size={13} className="text-wbk-brown shrink-0" />
                            <span>{t("categories.allTags", "All Tags")}</span>
                          </button>
                          {availableTags.map((tag) => (
                            <button
                              key={tag.id}
                              type="button"
                              onClick={() => {
                                setSelectedTag(tag.id);
                                updateUrlParams(activeQuery, selectedCategory, selectedOrientation, selectedType, tag.id, selectedPricingFilter);
                                setActiveDropdown(null);
                                scrollToProducts();
                              }}
                              className={`w-full text-left px-4 py-2 text-xs rounded-none transition-colors whitespace-nowrap cursor-pointer flex items-center justify-between gap-3 ${
                                selectedTag === tag.id
                                  ? "bg-[#F4F2F0] font-semibold text-wbk-black"
                                  : "text-wbk-black hover:bg-[#FBF9F8] hover:text-wbk-green"
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <TagIcon tagIdOrSlug={tag.id} size={13} className="text-wbk-black/75 shrink-0" />
                                <span>{getLocalizedTagName(tag.id, locale)}</span>
                              </span>
                              {selectedTag === tag.id && <IconCheck size={14} className="text-wbk-black" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </SwiperSlide>
                )}

                {/* 5. B2B Pricing Filter (only for authorized wholesale partners) */}
                {authorized && (
                  <SwiperSlide className="!w-auto !h-full flex items-center !overflow-visible">
                    <div className="relative flex items-center !overflow-visible" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setActiveDropdown(activeDropdown === "pricing" ? null : "pricing")}
                        className={`flex items-center justify-between gap-2.5 sm:gap-3 px-4 sm:px-5 h-9 border text-xs transition-all rounded-full cursor-pointer whitespace-nowrap select-none ${
                          selectedPricingFilter !== "All"
                            ? "border-wbk-black bg-[#FBF9F8] font-semibold text-wbk-black shadow-2xs"
                            : "border-wbk-lightgrey bg-white text-wbk-black hover:border-wbk-black shadow-2xs"
                        }`}
                      >
                        <span>
                          B2B Pricing:{" "}
                          <strong className="font-semibold">
                            {selectedPricingFilter === "priced"
                              ? "Priced Only"
                              : selectedPricingFilter === "container"
                                ? "With Container Qty"
                                : "All"}
                          </strong>
                        </span>
                        <IconChevronDown
                          size={14}
                          className={`transition-transform duration-200 ${
                            activeDropdown === "pricing" ? "rotate-180 text-wbk-gold" : "text-wbk-brown"
                          }`}
                        />
                      </button>

                      {activeDropdown === "pricing" && (
                        <div className="absolute top-full right-0 sm:left-0 mt-1.5 z-50 bg-wbk-white border border-wbk-lightgrey/80 shadow-2xl p-2 min-w-[190px] rounded-none">
                          {[
                            { key: "All", label: "All Products" },
                            { key: "priced", label: "Priced Only" },
                            { key: "container", label: "With Container Qty" },
                          ].map((opt) => (
                            <button
                              key={opt.key}
                              type="button"
                              onClick={() => {
                                setSelectedPricingFilter(opt.key);
                                updateUrlParams(activeQuery, selectedCategory, selectedOrientation, selectedType, selectedTag, opt.key);
                                setActiveDropdown(null);
                                scrollToProducts();
                              }}
                              className={`w-full text-left px-4 py-2 text-xs rounded-none transition-colors whitespace-nowrap cursor-pointer ${
                                selectedPricingFilter === opt.key
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
                )}

                {/* Reset Filters */}
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

              {/* Right gradient to fade filter chips behind arrow (matches /products) */}
              {!isFilterEnd && (
                <div
                  style={{
                    background:
                      "linear-gradient(to left, #FFFFFF 0%, #FFFFFF 35%, rgba(255, 255, 255, 0.85) 65%, rgba(255, 255, 255, 0) 100%)",
                  }}
                  className="absolute -right-4 sm:-right-6 lg:-right-8 top-0 bottom-0 w-24 sm:w-28 pointer-events-none z-20"
                />
              )}

              {/* Right scroll arrow */}
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
          </div>

          {/* ── ACTIVE FILTER CHIPS BAR (identical to /products) ── */}
          {hasActiveFilters && (
            <div className="w-full py-2 border-t border-wbk-lightgrey/50 flex items-center gap-1.5 flex-wrap">
              {activeQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-wbk-black text-white text-[11px] rounded-full hover:bg-neutral-800 transition-all cursor-pointer shadow-xs select-none"
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
                    updateUrlParams(activeQuery, "All", selectedOrientation, selectedType, selectedTag, selectedPricingFilter);
                    scrollToProducts();
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-wbk-black text-white text-[11px] rounded-full hover:bg-neutral-800 transition-all cursor-pointer shadow-xs select-none"
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
                    updateUrlParams(activeQuery, selectedCategory, "All", selectedType, selectedTag, selectedPricingFilter);
                    scrollToProducts();
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-wbk-black text-white text-[11px] rounded-full hover:bg-neutral-800 transition-all cursor-pointer shadow-xs select-none"
                >
                  <span className="font-medium text-white">
                    {orientationOptions.find((o) => o.key === selectedOrientation)?.label || selectedOrientation}
                  </span>
                  <IconX size={11} className="text-white/80 hover:text-white ml-0.5" stroke={2.5} />
                </button>
              )}

              {selectedType !== "All" && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedType("All");
                    updateUrlParams(activeQuery, selectedCategory, selectedOrientation, "All", selectedTag, selectedPricingFilter);
                    scrollToProducts();
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-wbk-black text-white text-[11px] rounded-full hover:bg-neutral-800 transition-all cursor-pointer shadow-xs select-none"
                >
                  <span className="font-medium text-white">{selectedType}</span>
                  <IconX size={11} className="text-white/80 hover:text-white ml-0.5" stroke={2.5} />
                </button>
              )}

              {selectedTag !== "All" && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTag("All");
                    updateUrlParams(activeQuery, selectedCategory, selectedOrientation, selectedType, "All", selectedPricingFilter);
                    scrollToProducts();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-wbk-black text-white text-[11px] rounded-full hover:bg-neutral-800 transition-all cursor-pointer shadow-xs select-none"
                >
                  <TagIcon tagIdOrSlug={selectedTag} size={12} className="text-white/80 shrink-0" />
                  <span className="font-medium text-white">{getLocalizedTagName(selectedTag, locale)}</span>
                  <IconX size={11} className="text-white/80 hover:text-white ml-0.5" stroke={2.5} />
                </button>
              )}

              {selectedPricingFilter !== "All" && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPricingFilter("All");
                    updateUrlParams(activeQuery, selectedCategory, selectedOrientation, selectedType, selectedTag, "All");
                    scrollToProducts();
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-wbk-black text-white text-[11px] rounded-full hover:bg-neutral-800 transition-all cursor-pointer shadow-xs select-none"
                >
                  <span className="font-medium text-white">
                    {selectedPricingFilter === "priced" ? "Priced Only" : "With Container Qty"}
                  </span>
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

        {/* ── PRODUCT GRID / LIST OR EMPTY STATE ── */}
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
                  "Try checking your spelling or adjusting your filters."
                )}
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={clearAllFilters}
                className="px-6 py-2.5 bg-wbk-black hover:bg-wbk-green hover:text-wbk-black text-white text-xs font-semibold uppercase tracking-wider rounded-full transition-colors cursor-pointer shadow-sm"
              >
                {t("search.clearFilters", "Clear all filters")}
              </button>
            </div>
          </div>
        ) : viewMode === "list" ? (
          <div ref={productGridRef} className="space-y-2.5 mb-20">
            {filteredProducts.map((prod) => (
              <WholesaleProductCard
                key={prod.id || prod.slug}
                product={prod}
                viewMode="list"
                authorized={authorized}
                partner={partner}
                pricingInfo={authorized ? prices[String(prod.id)] : null}
                onLoginClick={() => openUserDrawer("login")}
                onQuickAdd={handleQuickAdd}
              />
            ))}
          </div>
        ) : (
          <div
            ref={productGridRef}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8 sm:gap-x-5 lg:gap-x-6 mb-20"
          >
            {filteredProducts.map((prod) => (
              <WholesaleProductCard
                key={prod.id || prod.slug}
                product={prod}
                viewMode="grid"
                authorized={authorized}
                partner={partner}
                pricingInfo={authorized ? prices[String(prod.id)] : null}
                onLoginClick={() => openUserDrawer("login")}
                onQuickAdd={handleQuickAdd}
              />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}

export default function WholesaleCatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-wbk-white flex items-center justify-center">
          <div className="h-10 w-10 border-4 border-wbk-green border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <WholesaleCatalogContent />
    </Suspense>
  );
}
