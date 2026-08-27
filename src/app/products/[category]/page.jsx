"use client";

import { useParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/ui/ProductCard";
import { IconChevronDown, IconFilter, Icon3dCubeSphere } from "@tabler/icons-react";
import {
  ALL_PRODUCTS,
  CATEGORIES_INFO,
  OTHER_CATEGORIES_LIST,
} from "@/data/products";

export default function CategoryArchivePage() {
  const params = useParams();
  const currentCategory = params?.category || "beds";

  const catInfo = CATEGORIES_INFO[currentCategory] || {
    label: currentCategory.replace("-", " "),
    title: currentCategory.replace("-", " "),
    description: "Explore our collection.",
    subcategories: []
  };

  const rawCategoryProducts = ALL_PRODUCTS[currentCategory] || [];
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ── FILTER STATES ──
  const [selectedSize, setSelectedSize] = useState("All");
  const [selectedOrientation, setSelectedOrientation] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedPrice, setSelectedPrice] = useState("All");
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Derive dynamic filter choices from actual data
  const distinctSizes = ["All", ...Array.from(new Set(rawCategoryProducts.map(p => p.size).filter(Boolean)))];
  const distinctOrientations = ["All", ...Array.from(new Set(rawCategoryProducts.map(p => p.orientation).filter(Boolean)))];
  const distinctTypes = ["All", ...Array.from(new Set(rawCategoryProducts.map(p => p.type || p.sub_category).filter(Boolean)))];
  const priceOptions = ["All", "Under £500", "£500 - £800", "Over £800"];

  // Filter products
  const filteredProducts = rawCategoryProducts.filter((prod) => {
    if (selectedSize !== "All" && prod.size !== selectedSize) return false;
    if (selectedOrientation !== "All" && prod.orientation !== selectedOrientation) return false;
    if (selectedType !== "All" && prod.type !== selectedType && prod.sub_category !== selectedType) return false;
    if (selectedPrice !== "All") {
      const p = prod.numericPrice;
      if (selectedPrice === "Under £500" && p >= 500) return false;
      if (selectedPrice === "£500 - £800" && (p < 500 || p > 800)) return false;
      if (selectedPrice === "Over £800" && p <= 800) return false;
    }
    return true;
  });

  // Drag scroll for horizontal filter bar
  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  if (!mounted) {
    return (
      <div className="bg-wbk-white min-h-screen pt-28 flex items-center justify-center">
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
              <Link href="/products" className="hover:text-wbk-black transition-colors">
                Products
              </Link>
              <span>/</span>
              <span className="capitalize text-wbk-black font-medium">{catInfo.label}</span>
            </nav>
            <h1 className="font-new-york text-5xl md:text-6xl text-wbk-black capitalize leading-none tracking-tight">
              {catInfo.label}
            </h1>
            <p className="mt-3 text-sm text-wbk-brown font-poppins max-w-xl leading-relaxed">
              {catInfo.description}
            </p>
          </div>
          <div className="text-xs text-wbk-brown font-poppins">
            Showing <span className="font-semibold text-wbk-black">{filteredProducts.length}</span> of {rawCategoryProducts.length} items
          </div>
        </div>

        {/* Separator line */}
        <hr className="border-wbk-lightgrey/60 mb-6" />

        {/* Filters bar - Draggable container */}
        <div className="relative mb-10 z-10">
          <div
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className="flex items-center gap-3 overflow-x-auto scrollbar-none select-none touch-pan-x cursor-grab active:cursor-grabbing pb-2"
          >
            {/* Type / Model Filter */}
            {distinctTypes.length > 2 && (
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() =>
                    setActiveDropdown(activeDropdown === "type" ? null : "type")
                  }
                  className="flex items-center justify-between gap-3 px-5 py-2.5 border border-wbk-lightgrey rounded-full text-xs font-poppins text-wbk-black hover:border-wbk-black transition-all bg-white whitespace-nowrap shadow-2xs"
                >
                  <span>Type: <strong className="font-semibold">{selectedType}</strong></span>
                  <IconChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      activeDropdown === "type" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {activeDropdown === "type" && (
                  <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-wbk-lightgrey/80 rounded-2xl shadow-lg p-2 min-w-[160px]">
                    {distinctTypes.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setSelectedType(opt);
                          setActiveDropdown(null);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs font-poppins rounded-xl transition-colors hover:bg-wbk-lightgrey/40 ${
                          selectedType === opt ? "bg-wbk-lightgrey/60 font-semibold text-wbk-black" : "text-wbk-black/80"
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
                  onClick={() =>
                    setActiveDropdown(activeDropdown === "size" ? null : "size")
                  }
                  className="flex items-center justify-between gap-3 px-5 py-2.5 border border-wbk-lightgrey rounded-full text-xs font-poppins text-wbk-black hover:border-wbk-black transition-all bg-white whitespace-nowrap shadow-2xs"
                >
                  <span>Size: <strong className="font-semibold">{selectedSize}</strong></span>
                  <IconChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      activeDropdown === "size" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {activeDropdown === "size" && (
                  <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-wbk-lightgrey/80 rounded-2xl shadow-lg p-2 min-w-[160px]">
                    {distinctSizes.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setSelectedSize(opt);
                          setActiveDropdown(null);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs font-poppins rounded-xl transition-colors hover:bg-wbk-lightgrey/40 ${
                          selectedSize === opt ? "bg-wbk-lightgrey/60 font-semibold text-wbk-black" : "text-wbk-black/80"
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
                  onClick={() =>
                    setActiveDropdown(
                      activeDropdown === "orientation" ? null : "orientation"
                    )
                  }
                  className="flex items-center justify-between gap-3 px-5 py-2.5 border border-wbk-lightgrey rounded-full text-xs font-poppins text-wbk-black hover:border-wbk-black transition-all bg-white whitespace-nowrap shadow-2xs"
                >
                  <span>Orientation: <strong className="font-semibold">{selectedOrientation}</strong></span>
                  <IconChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      activeDropdown === "orientation" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {activeDropdown === "orientation" && (
                  <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-wbk-lightgrey/80 rounded-2xl shadow-lg p-2 min-w-[160px]">
                    {distinctOrientations.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setSelectedOrientation(opt);
                          setActiveDropdown(null);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs font-poppins rounded-xl transition-colors hover:bg-wbk-lightgrey/40 ${
                          selectedOrientation === opt
                            ? "bg-wbk-lightgrey/60 font-semibold text-wbk-black"
                            : "text-wbk-black/80"
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
                onClick={() =>
                  setActiveDropdown(activeDropdown === "price" ? null : "price")
                }
                className="flex items-center justify-between gap-3 px-5 py-2.5 border border-wbk-lightgrey rounded-full text-xs font-poppins text-wbk-black hover:border-wbk-black transition-all bg-white whitespace-nowrap shadow-2xs"
              >
                <span>Price: <strong className="font-semibold">{selectedPrice}</strong></span>
                <IconChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    activeDropdown === "price" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {activeDropdown === "price" && (
                <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-wbk-lightgrey/80 rounded-2xl shadow-lg p-2 min-w-[160px]">
                  {priceOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setSelectedPrice(opt);
                        setActiveDropdown(null);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-poppins rounded-xl transition-colors hover:bg-wbk-lightgrey/40 ${
                        selectedPrice === opt ? "bg-wbk-lightgrey/60 font-semibold text-wbk-black" : "text-wbk-black/80"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reset Filters button */}
            {(selectedSize !== "All" || selectedOrientation !== "All" || selectedType !== "All" || selectedPrice !== "All") && (
              <button
                onClick={() => {
                  setSelectedSize("All");
                  setSelectedOrientation("All");
                  setSelectedType("All");
                  setSelectedPrice("All");
                }}
                className="px-4 py-2 text-xs font-poppins text-wbk-brown hover:text-wbk-black underline cursor-pointer whitespace-nowrap"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-[#F4F2F0]/40 rounded-2xl border border-wbk-lightgrey/60">
            <p className="font-new-york text-2xl text-wbk-black">No products found</p>
            <p className="text-xs font-poppins text-wbk-brown">Try adjusting your filters to see more results.</p>
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
              <ProductCard
                key={prod.id || prod.slug}
                product={prod}
              />
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
              (cat) => cat.slug !== currentCategory
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
