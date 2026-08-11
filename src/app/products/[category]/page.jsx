"use client";

import { useParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { IconChevronDown } from "@tabler/icons-react";
import {
  ALL_PRODUCTS,
  CATEGORIES_INFO,
  OTHER_CATEGORIES_LIST,
} from "@/data/products";

export default function CategoryArchivePage() {
  const { category } = useParams();
  const currentCategory = category || "beds";

  const catInfo = CATEGORIES_INFO[currentCategory] || {
    label: currentCategory.replace("-", " "),
    title: currentCategory.replace("-", " "),
  };
  const products = ALL_PRODUCTS[currentCategory] || [];

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ── FILTER STATES ──
  const [selectedSize, setSelectedSize] = useState("All");
  const [selectedOrientation, setSelectedOrientation] = useState("All");
  const [selectedPrice, setSelectedPrice] = useState("All");
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Dropdown options
  const sizeOptions = ["All", "Single", "Double", "King", "Super King"];
  const orientationOptions = ["All", "Vertical", "Horizontal"];
  const priceOptions = ["All", "Under £500", "£500 - £800", "Over £800"];

  // Filter logic
  const filteredProducts = products.filter((prod) => {
    if (selectedSize !== "All" && prod.size !== selectedSize) return false;
    if (selectedOrientation !== "All" && prod.orientation !== selectedOrientation)
      return false;
    if (selectedPrice !== "All") {
      const p = prod.numericPrice;
      if (selectedPrice === "Under £500" && p >= 500) return false;
      if (selectedPrice === "£500 - £800" && (p < 500 || p > 800)) return false;
      if (selectedPrice === "Over £800" && p <= 800) return false;
    }
    return true;
  });

  // Swipeable Filter Bar Scroll Logic
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
        <div className="mb-8">
          <h1 className="font-new-york text-5xl md:text-6xl text-wbk-black capitalize leading-none tracking-tight">
            {catInfo.label}
          </h1>
        </div>

        {/* Separator line */}
        <hr className="border-wbk-lightgrey/60 mb-8" />

        {/* Filters bar - Draggable/Swipeable container */}
        <div className="relative mb-12 z-10">
          <div
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className="flex items-center gap-3 overflow-x-auto scrollbar-none select-none touch-pan-x cursor-grab active:cursor-grabbing pb-2"
          >
            {/* Size Filter */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() =>
                  setActiveDropdown(activeDropdown === "size" ? null : "size")
                }
                className="flex items-center justify-between gap-4 px-6 py-2.5 border border-wbk-lightgrey rounded-full text-xs font-poppins text-wbk-black hover:border-wbk-black transition-all bg-white whitespace-nowrap"
              >
                <span>Size: {selectedSize}</span>
                <IconChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    activeDropdown === "size" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {activeDropdown === "size" && (
                <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-wbk-lightgrey/80 rounded-2xl shadow-lg p-2 min-w-[150px]">
                  {sizeOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setSelectedSize(opt);
                        setActiveDropdown(null);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-poppins rounded-xl transition-colors hover:bg-wbk-lightgrey/40 ${
                        selectedSize === opt
                          ? "bg-wbk-lightgrey/60 font-semibold"
                          : ""
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Orientation Filter */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() =>
                  setActiveDropdown(
                    activeDropdown === "orientation" ? null : "orientation"
                  )
                }
                className="flex items-center justify-between gap-4 px-6 py-2.5 border border-wbk-lightgrey rounded-full text-xs font-poppins text-wbk-black hover:border-wbk-black transition-all bg-white whitespace-nowrap"
              >
                <span>Orientation: {selectedOrientation}</span>
                <IconChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    activeDropdown === "orientation" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {activeDropdown === "orientation" && (
                <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-wbk-lightgrey/80 rounded-2xl shadow-lg p-2 min-w-[150px]">
                  {orientationOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setSelectedOrientation(opt);
                        setActiveDropdown(null);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-poppins rounded-xl transition-colors hover:bg-wbk-lightgrey/40 ${
                        selectedOrientation === opt
                          ? "bg-wbk-lightgrey/60 font-semibold"
                          : ""
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price Filter */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() =>
                  setActiveDropdown(activeDropdown === "price" ? null : "price")
                }
                className="flex items-center justify-between gap-4 px-6 py-2.5 border border-wbk-lightgrey rounded-full text-xs font-poppins text-wbk-black hover:border-wbk-black transition-all bg-white whitespace-nowrap"
              >
                <span>Price: {selectedPrice}</span>
                <IconChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    activeDropdown === "price" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {activeDropdown === "price" && (
                <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-wbk-lightgrey/80 rounded-2xl shadow-lg p-2 min-w-[150px]">
                  {priceOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setSelectedPrice(opt);
                        setActiveDropdown(null);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-poppins rounded-xl transition-colors hover:bg-wbk-lightgrey/40 ${
                        selectedPrice === opt
                          ? "bg-wbk-lightgrey/60 font-semibold"
                          : ""
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-24">
          {filteredProducts.map((prod) => (
            <Link
              key={prod.id}
              href={`/products/${currentCategory}/${prod.slug || prod.id}`}
              className="group block"
            >
              {/* Product Card Image Container */}
              <div className="relative aspect-[4/3] bg-[#EFECE9] overflow-hidden flex items-center justify-center p-8 transition-colors duration-500 group-hover:bg-[#E4E0DE]">
                {/* Sale Tag */}
                {prod.sale && (
                  <span className="absolute top-4 right-4 bg-[#7A7B68] text-white text-[10px] uppercase font-poppins tracking-wider font-semibold px-2.5 py-1 z-10">
                    {prod.sale}
                  </span>
                )}

                {/* Primary Image */}
                <img
                  src={prod.image}
                  alt={prod.title}
                  className="w-full h-full object-contain filter brightness-95 group-hover:opacity-0 transition-opacity duration-300 z-0"
                />

                {/* Hover Image */}
                <img
                  src={prod.hoverImage}
                  alt={`${prod.title} Open`}
                  className="absolute inset-0 w-full h-full object-contain p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-1"
                />
              </div>

              {/* Product Metadata */}
              <div className="mt-4 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-new-york text-xl text-wbk-black group-hover:text-wbk-green transition-colors duration-200">
                    {prod.title}
                  </h3>
                  <span className="font-poppins font-medium text-sm text-wbk-black">
                    {prod.price}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-wbk-brown font-poppins">
                  <span>{prod.orientation}</span>
                  {prod.colors && (
                    <div className="flex items-center gap-1.5">
                      {prod.colors.map((col, idx) => (
                        <span
                          key={idx}
                          className="w-3 h-3 rounded-full border border-black/10 shadow-xs inline-block"
                          style={{ backgroundColor: col }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Other Categories Section */}
        <div className="mt-20 border-t border-wbk-lightgrey/80 pt-16">
          <h2 className="font-new-york text-3xl md:text-4xl text-wbk-black mb-8">
            Other categories
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {OTHER_CATEGORIES_LIST.filter(
              (cat) => cat.slug !== currentCategory
            ).map((otherCat) => (
              <Link
                key={otherCat.slug}
                href={`/products/${otherCat.slug}`}
                className="group flex flex-col items-center text-center"
              >
                {/* Image Box */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F4F2F0] flex items-center justify-center p-6 transition-all duration-300 group-hover:bg-[#E4E0DE]/60 border border-wbk-lightgrey/40">
                  <img
                    src={otherCat.image}
                    alt={otherCat.label}
                    className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                {/* Label */}
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
