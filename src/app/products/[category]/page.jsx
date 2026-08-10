"use client";

import { useParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { IconChevronRight, IconChevronDown } from "@tabler/icons-react";

// Mock Product Database
const ALL_PRODUCTS = {
  beds: [
    {
      id: "wallbed-1",
      title: "Integrated MORPHY™ Bed",
      orientation: "Vertical",
      size: "King",
      colors: ["#A5988E", "#D2AA7C", "#E4E0DE", "#090A0A"],
      price: "£799",
      numericPrice: 799,
      image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
      hoverImage: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
      link: "/products/integrated-bed",
      sale: "Sale",
    },
    {
      id: "wallbed-2",
      title: "Bed with sofa",
      orientation: "Vertical",
      size: "King",
      colors: ["#A5988E", "#D2AA7C", "#E4E0DE", "#090A0A"],
      price: "£799",
      numericPrice: 799,
      image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
      hoverImage: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
      link: "/products/bed-with-sofa",
    },
    {
      id: "wallbed-3",
      title: "Classic Wall Bed",
      orientation: "Horizontal",
      size: "Double",
      colors: ["#A5988E", "#E4E0DE", "#090A0A"],
      price: "£699",
      numericPrice: 699,
      image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
      hoverImage: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
      link: "/products/classic-wall-bed",
    },
    {
      id: "wallbed-4",
      title: "Studio Murphy Bed",
      orientation: "Vertical",
      size: "Single",
      colors: ["#A5988E", "#D2AA7C", "#E4E0DE"],
      price: "£599",
      numericPrice: 599,
      image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
      hoverImage: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
      link: "/products/studio-bed",
    },
    {
      id: "wallbed-5",
      title: "Premium Wall Bed",
      orientation: "Vertical",
      size: "Double",
      colors: ["#A5988E", "#D2AA7C", "#E4E0DE", "#090A0A"],
      price: "£699",
      numericPrice: 699,
      image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
      hoverImage: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
      link: "/products/premium-bed",
    },
    {
      id: "wallbed-6",
      title: "Luxury Murphy Bed",
      orientation: "Vertical",
      size: "Super King",
      colors: ["#A5988E", "#090A0A"],
      price: "£899",
      numericPrice: 899,
      image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
      hoverImage: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
      link: "/products/premium-bed",
    },
  ],
  sofas: [
    {
      id: "sofa-1",
      title: "MORPHY™ Bed with Sofa",
      orientation: "Vertical",
      size: "King",
      colors: ["#A5988E", "#D2AA7C", "#E4E0DE", "#090A0A"],
      price: "£799",
      numericPrice: 799,
      image: "/sofa1.webp",
      hoverImage: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
      link: "/products/bed-with-sofa-studio",
    },
    {
      id: "sofa-2",
      title: "Studio Sofa Wallbed",
      orientation: "Vertical",
      size: "Double",
      colors: ["#A5988E", "#D2AA7C", "#E4E0DE", "#090A0A"],
      price: "£849",
      numericPrice: 849,
      image: "/sofa2.webp",
      hoverImage: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
      link: "/products/sofa-wallbed-studio",
    },
    {
      id: "sofa-3",
      title: "Classic Sofa Bed",
      orientation: "Horizontal",
      size: "Double",
      colors: ["#A5988E", "#E4E0DE", "#090A0A"],
      price: "£749",
      numericPrice: 749,
      image: "/sofa3.webp",
      hoverImage: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
      link: "/products/classic-sofa-bed",
    },
    {
      id: "sofa-4",
      title: "Modular Sofa Bed",
      orientation: "Vertical",
      size: "Super King",
      colors: ["#A5988E", "#D2AA7C", "#E4E0DE", "#090A0A"],
      price: "£899",
      numericPrice: 899,
      image: "/sofa1.webp",
      hoverImage: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
      link: "/products/modular-sofa-bed",
    },
    {
      id: "sofa-5",
      title: "Deluxe Sofa Wallbed",
      orientation: "Vertical",
      size: "King",
      colors: ["#A5988E", "#D2AA7C", "#E4E0DE", "#090A0A"],
      price: "£949",
      numericPrice: 949,
      image: "/sofa2.webp",
      hoverImage: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
      link: "/products/deluxe-sofa-wallbed",
    },
  ],
  mattresses: [
    {
      id: "mattress-1",
      title: "Orthopedic Spring Mattress",
      orientation: "Vertical",
      size: "King",
      colors: ["#E4E0DE"],
      price: "£299",
      numericPrice: 299,
      image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
      hoverImage: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
      link: "/products/orthopedic-mattress",
    },
    {
      id: "mattress-2",
      title: "Memory Foam Mattress",
      orientation: "Vertical",
      size: "Double",
      colors: ["#E4E0DE"],
      price: "£349",
      numericPrice: 349,
      image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
      hoverImage: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
      link: "/products/memory-foam-mattress",
    },
  ],
  cabinets: [
    {
      id: "cabinet-1",
      title: "Side Storage Cabinet",
      orientation: "Vertical",
      size: "Single",
      colors: ["#A5988E", "#E4E0DE", "#090A0A"],
      price: "£199",
      numericPrice: 199,
      image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
      hoverImage: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
      link: "/products/side-cabinet",
    },
  ],
  extras: [
    {
      id: "extras-1",
      title: "LED Lighting Kit",
      orientation: "Universal",
      size: "One Size",
      colors: ["#090A0A"],
      price: "£89",
      numericPrice: 89,
      image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
      hoverImage: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
      link: "/products/led-lighting",
    },
  ],
};

const CATEGORIES_INFO = {
  beds: { label: "Beds", title: "Murphy Beds" },
  sofas: { label: "Sofas", title: "Sofas" },
  mattresses: { label: "Mattresses", title: "Mattresses" },
  cabinets: { label: "Cabinets", title: "Cabinets" },
  extras: { label: "Extras", title: "Extras" },
};

const OTHER_CATEGORIES_LIST = [
  { slug: "beds", label: "Murphy Beds", image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp" },
  { slug: "sofas", label: "Sofas", image: "/sofa1.webp" },
  { slug: "mattresses", label: "Mattresses", image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp" },
  { slug: "cabinets", label: "Cabinets", image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp" },
  { slug: "extras", label: "Extras", image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp" },
];

export default function CategoryArchivePage() {
  const { category } = useParams();
  const currentCategory = category || "beds";
  const catInfo = CATEGORIES_INFO[currentCategory] || { label: currentCategory, title: currentCategory };
  const products = ALL_PRODUCTS[currentCategory] || [];

  // Filter States
  const [selectedSize, setSelectedSize] = useState("All");
  const [selectedOrientation, setSelectedOrientation] = useState("All");
  const [selectedPrice, setSelectedPrice] = useState("All");

  const [activeDropdown, setActiveDropdown] = useState(null);

  // Dropdown options
  const sizeOptions = ["All", "Single", "Double", "King", "Super King"];
  const orientationOptions = ["All", "Vertical", "Horizontal"];
  const priceOptions = ["All", "Under £500", "£500 - £800", "Over £800"];

  // Filter Logic
  const filteredProducts = products.filter((prod) => {
    if (selectedSize !== "All" && prod.size !== selectedSize) return false;
    if (selectedOrientation !== "All" && prod.orientation !== selectedOrientation) return false;
    if (selectedPrice !== "All") {
      if (selectedPrice === "Under £500" && prod.numericPrice >= 500) return false;
      if (selectedPrice === "£500 - £800" && (prod.numericPrice < 500 || prod.numericPrice > 800)) return false;
      if (selectedPrice === "Over £800" && prod.numericPrice <= 800) return false;
    }
    return true;
  });

  // Swipeable Scroll Drag Logic
  const scrollRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = (e) => {
    isDown.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDown.current = false;
  };

  const handleMouseUp = () => {
    isDown.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isDown.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  // Close filter dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveDropdown(null);
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

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
                onClick={() => setActiveDropdown(activeDropdown === "size" ? null : "size")}
                className="flex items-center justify-between gap-4 px-6 py-2.5 border border-wbk-lightgrey rounded-full text-xs font-poppins text-wbk-black hover:border-wbk-black transition-all bg-white whitespace-nowrap"
              >
                <span>Size: {selectedSize}</span>
                <IconChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === "size" ? "rotate-180" : ""}`} />
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
                      className={`w-full text-left px-4 py-2 text-xs font-poppins rounded-xl transition-colors hover:bg-wbk-lightgrey/40 ${selectedSize === opt ? "bg-wbk-lightgrey/60 font-semibold" : ""}`}
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
                onClick={() => setActiveDropdown(activeDropdown === "orientation" ? null : "orientation")}
                className="flex items-center justify-between gap-4 px-6 py-2.5 border border-wbk-lightgrey rounded-full text-xs font-poppins text-wbk-black hover:border-wbk-black transition-all bg-white whitespace-nowrap"
              >
                <span>Orientation: {selectedOrientation}</span>
                <IconChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === "orientation" ? "rotate-180" : ""}`} />
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
                      className={`w-full text-left px-4 py-2 text-xs font-poppins rounded-xl transition-colors hover:bg-wbk-lightgrey/40 ${selectedOrientation === opt ? "bg-wbk-lightgrey/60 font-semibold" : ""}`}
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
                onClick={() => setActiveDropdown(activeDropdown === "price" ? null : "price")}
                className="flex items-center justify-between gap-4 px-6 py-2.5 border border-wbk-lightgrey rounded-full text-xs font-poppins text-wbk-black hover:border-wbk-black transition-all bg-white whitespace-nowrap"
              >
                <span>Price: {selectedPrice}</span>
                <IconChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === "price" ? "rotate-180" : ""}`} />
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
                      className={`w-full text-left px-4 py-2 text-xs font-poppins rounded-xl transition-colors hover:bg-wbk-lightgrey/40 ${selectedPrice === opt ? "bg-wbk-lightgrey/60 font-semibold" : ""}`}
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
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-wbk-brown font-poppins text-lg">No products found matching the filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-12">
            {filteredProducts.map((product) => (
              <Link key={product.id} href={product.link} className="group block space-y-4">
                {/* Image Box */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#E4E0DE]/45 flex items-center justify-center p-8 transition-colors duration-300 group-hover:bg-[#E4E0DE]/60 border border-wbk-lightgrey/30">
                  {/* Sale Tag */}
                  {product.sale && (
                    <span className="absolute top-0 left-0 bg-[#7B7B6B] text-white text-[10px] font-semibold font-poppins uppercase tracking-wider px-3.5 py-1 z-10">
                      {product.sale}
                    </span>
                  )}
                  {/* Primary Product Image */}
                  <img
                    src={product.image}
                    alt={product.title}
                    className="h-full w-full object-contain transition-opacity duration-500 group-hover:opacity-0"
                  />
                  {/* Hover Product Image */}
                  <img
                    src={product.hoverImage}
                    alt={`${product.title} details`}
                    className="absolute inset-0 h-full w-full object-contain p-8 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />
                </div>

                {/* Product Text Details */}
                <div className="space-y-2 px-1">
                  <h4 className="font-poppins font-medium text-base text-wbk-black transition-colors duration-200 group-hover:text-wbk-gold">
                    {product.title}
                  </h4>

                  {/* Specs */}
                  <div className="text-xs text-wbk-black space-y-0.5">
                    <div className="flex items-center gap-1">
                      {product.colors.map((color, idx) => (
                        <span
                          key={idx}
                          className="inline-block h-3.5 w-3.5 rounded-full border border-wbk-lightgrey/80 -mr-1"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="pt-1 text-xs text-wbk-brown font-poppins">
                    from{" "}
                    <span className="font-bold text-wbk-black text-sm">
                      {product.price}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination Section */}
        <div className="flex justify-center items-center gap-4 mt-20 font-poppins text-xs uppercase tracking-wider text-wbk-black">
          <span className="cursor-pointer hover:font-bold transition-all">1</span>
          <span className="cursor-pointer text-wbk-brown hover:font-bold hover:text-wbk-black transition-all">2</span>
          <span className="cursor-pointer text-wbk-brown hover:font-bold hover:text-wbk-black transition-all">3</span>
          <span className="text-wbk-brown">..</span>
          <span className="cursor-pointer text-wbk-brown hover:font-bold hover:text-wbk-black transition-all">15</span>
          <span className="cursor-pointer font-semibold flex items-center hover:text-wbk-gold transition-all">
            next <IconChevronRight size={12} className="ml-1" />
          </span>
        </div>

        {/* Other Categories Section */}
        <div className="mt-28 border-t border-wbk-lightgrey/60 pt-16">
          <h3 className="font-new-york text-3xl md:text-4xl text-wbk-black mb-8">
            Other categories
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {OTHER_CATEGORIES_LIST.map((otherCat) => (
              <Link
                key={otherCat.slug}
                href={`/products/${otherCat.slug}`}
                className="group flex flex-col items-center text-center"
              >
                {/* Image Box - Dropdown grid style */}
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
