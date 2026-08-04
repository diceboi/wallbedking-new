"use client";

import { useRef, useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

import "swiper/css";
import "swiper/css/navigation";

const WALLBEDS_PRODUCTS = [
  {
    id: "wallbed-1",
    title: "Integrated MORPHY™ Bed",
    orientation: "Vertical",
    size: "180x200",
    colors: ["#A5988E", "#D2AA7C", "#E4E0DE", "#090A0A"],
    price: "£799",
    image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
    hoverImage:
      "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    link: "/products/integrated-bed",
  },
  {
    id: "wallbed-2",
    title: "Bed with sofa",
    orientation: "Vertical",
    size: "180x200",
    colors: ["#A5988E", "#D2AA7C", "#E4E0DE", "#090A0A"],
    price: "£799",
    image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
    hoverImage:
      "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    link: "/products/bed-with-sofa",
  },
  {
    id: "wallbed-3",
    title: "Classic Wall Bed",
    orientation: "Horizontal",
    size: "150x200",
    colors: ["#A5988E", "#E4E0DE", "#090A0A"],
    price: "£699",
    image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
    hoverImage:
      "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    link: "/products/classic-wall-bed",
  },
  {
    id: "wallbed-4",
    title: "Studio Murphy Bed",
    orientation: "Vertical",
    size: "140x200",
    colors: ["#A5988E", "#D2AA7C", "#E4E0DE"],
    price: "£599",
    image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
    hoverImage:
      "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    link: "/products/studio-bed",
  },
  {
    id: "wallbed-5",
    title: "Premium Wall Bed",
    orientation: "Vertical",
    size: "160x200",
    colors: ["#A5988E", "#D2AA7C", "#E4E0DE", "#090A0A"],
    price: "£699",
    image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
    hoverImage:
      "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    link: "/products/premium-bed",
  },
  {
    id: "wallbed-6",
    title: "Premium Wall Bed",
    orientation: "Vertical",
    size: "160x200",
    colors: ["#A5988E", "#D2AA7C", "#E4E0DE", "#090A0A"],
    price: "£699",
    image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
    hoverImage:
      "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    link: "/products/premium-bed",
  },
];

const SOFAS_PRODUCTS = [
  {
    id: "sofa-1",
    title: "MORPHY™ Bed with Sofa",
    orientation: "Vertical",
    size: "180x200",
    colors: ["#A5988E", "#D2AA7C", "#E4E0DE", "#090A0A"],
    price: "£799",
    image: "/sofa1.webp",
    hoverImage:
      "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    link: "/products/bed-with-sofa-studio",
  },
  {
    id: "sofa-2",
    title: "Studio Sofa Wallbed",
    orientation: "Vertical",
    size: "160x200",
    colors: ["#A5988E", "#D2AA7C", "#E4E0DE", "#090A0A"],
    price: "£849",
    image: "/sofa2.webp",
    hoverImage:
      "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    link: "/products/sofa-wallbed-studio",
  },
  {
    id: "sofa-3",
    title: "Classic Sofa Bed",
    orientation: "Horizontal",
    size: "150x200",
    colors: ["#A5988E", "#E4E0DE", "#090A0A"],
    price: "£749",
    image: "/sofa3.webp",
    hoverImage:
      "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    link: "/products/classic-sofa-bed",
  },
  {
    id: "sofa-4",
    title: "Modular Sofa Bed",
    orientation: "Vertical",
    size: "180x200",
    colors: ["#A5988E", "#D2AA7C", "#E4E0DE", "#090A0A"],
    price: "£899",
    image: "/sofa1.webp",
    hoverImage:
      "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    link: "/products/modular-sofa-bed",
  },
  {
    id: "sofa-5",
    title: "Deluxe Sofa Wallbed",
    orientation: "Vertical",
    size: "180x200",
    colors: ["#A5988E", "#D2AA7C", "#E4E0DE", "#090A0A"],
    price: "£949",
    image: "/sofa2.webp",
    hoverImage:
      "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    link: "/products/deluxe-sofa-wallbed",
  },
  {
    id: "sofa-6",
    title: "Deluxe Sofa Wallbed",
    orientation: "Vertical",
    size: "180x200",
    colors: ["#A5988E", "#D2AA7C", "#E4E0DE", "#090A0A"],
    price: "£949",
    image: "/sofa2.webp",
    hoverImage:
      "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    link: "/products/deluxe-sofa-wallbed",
  },
];

export default function ProductsPage() {
  const [offset, setOffset] = useState(32);

  // Dynamically calculate left/right offset to align Swiper with viewport boundaries
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1548) {
        setOffset((width - 1548) / 2 + 32); // Max-width 2xl + padding
      } else if (width >= 1280) {
        setOffset(32);
      } else if (width >= 1024) {
        setOffset(24);
      } else {
        setOffset(16);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Callback Refs state for Swipers (to handle React hydration timing cleanly)
  const [bedsPrevEl, setBedsPrevEl] = useState(null);
  const [bedsNextEl, setBedsNextEl] = useState(null);
  const [sofasPrevEl, setSofasPrevEl] = useState(null);
  const [sofasNextEl, setSofasNextEl] = useState(null);

  return (
    <div className="bg-wbk-white">
      {/* ── HERO BANNER SECTION ── */}
      <section
        className="relative h-[65vh] min-h-[500px] w-full flex items-center bg-cover bg-center"
        style={{
          backgroundImage: "url('/category-images/integrated-beds.webp')",
        }}
      >
        {/* Soft, premium overlay for better contrast & luxury feel */}
        <div className="absolute inset-0 bg-gradient-to-r from-wbk-white/60 via-wbk-white/20 to-transparent" />

        <Container size="xl" className="relative z-10 pt-[60px]">
          <div className="max-w-2xl px-2">
            <h1 className="font-new-york text-5xl sm:text-6xl md:text-7xl text-wbk-black leading-tight tracking-tight">
              Our Products
            </h1>
            <p className="mt-4 font-poppins text-base sm:text-lg text-wbk-black/80 max-w-xl leading-relaxed">
              Murphy beds, sofas, cabinets and a lot more in all shapes and
              sizes
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                as="link"
                href="/shop"
                variant="white"
                size="lg"
                className="shadow-md hover:shadow-lg"
              >
                Start shopping
              </Button>
              <Button
                as="link"
                href="/about"
                variant="secondary"
                size="lg"
                className="border-wbk-white text-wbk-white hover:bg-wbk-white hover:text-wbk-black bg-black/5 backdrop-blur-sm shadow-md hover:shadow-lg"
              >
                About Us
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* ── POPULAR PRODUCTS SECTION ── */}
      <section className="py-20 overflow-hidden">
        <Container size="xl">
          <h2 className="font-new-york text-4xl sm:text-5xl text-wbk-black mb-16">
            Popular products
          </h2>

          <div className="space-y-24">
            {/* ── WALLBEDS CATEGORY ROW ── */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 pt-16 border-t border-wbk-lightgrey/40 first:border-t-0 first:pt-0">
              {/* Left Column: Category Description & CTA */}
              <div className="lg:col-span-1 flex flex-col justify-between items-start">
                <div>
                  <h3 className="font-poppins font-semibold text-2xl text-wbk-black">
                    Wallbeds
                  </h3>
                  <p className="mt-4 text-sm text-wbk-brown font-poppins leading-relaxed max-w-xs opacity-90">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </p>
                </div>
                <Link
                  href="/products/beds"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-wbk-black rounded-full text-xs font-semibold uppercase tracking-wider text-wbk-black hover:bg-wbk-black hover:text-wbk-white transition-all duration-300 mt-8 group"
                >
                  All beds
                  <IconChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>

              {/* Right Columns: Swiper Slider */}
              <div
                className="lg:col-span-3 relative overflow-visible"
                style={{
                  width: `calc(100% + ${offset}px)`,
                  marginRight: `-${offset}px`,
                }}
              >
                <Swiper
                  modules={[Navigation]}
                  navigation={{
                    prevEl: bedsPrevEl,
                    nextEl: bedsNextEl,
                  }}
                  slidesPerView="auto"
                  spaceBetween={4}
                  className="w-full overflow-visible"
                >
                  {WALLBEDS_PRODUCTS.map((product) => (
                    <SwiperSlide
                      key={product.id}
                      className="!w-[280px] sm:!w-[320px] select-none"
                    >
                      <Link
                        href={product.link}
                        className="group block space-y-4"
                      >
                        {/* Image Box - Default styled block from ProductSlider */}
                        <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#E4E0DE]/45 flex items-center justify-center p-8 transition-colors duration-300 group-hover:bg-[#E4E0DE]/60 border border-wbk-lightgrey/30">
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
                            <div>Orientation: {product.orientation}</div>
                            <div>Size: {product.size}</div>
                            <div className="flex items-center gap-1.5 pt-1">
                              <span>Colors:</span>
                              <div className="flex items-center">
                                {product.colors.map((color, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-block h-3.5 w-3.5 rounded-full border border-wbk-lightgrey/80 -mr-1"
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
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
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* Navigation Button - Left */}
                <button
                  ref={setBedsPrevEl}
                  className="absolute left-4 md:-left-5 top-[180px] -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-wbk-green text-wbk-black shadow-md hover:bg-wbk-black hover:text-wbk-white transition-all duration-300 cursor-pointer disabled:opacity-0 disabled:pointer-events-none"
                >
                  <IconChevronLeft size={18} />
                </button>

                {/* Navigation Button - Right */}
                <button
                  ref={setBedsNextEl}
                  className="absolute right-4 md:right-8 top-[180px] -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-wbk-green text-wbk-black shadow-md hover:bg-wbk-black hover:text-wbk-white transition-all duration-300 cursor-pointer disabled:opacity-0 disabled:pointer-events-none"
                >
                  <IconChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* ── SOFAS CATEGORY ROW ── */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 pt-16 border-t border-wbk-lightgrey/40">
              {/* Left Column: Category Description & CTA */}
              <div className="lg:col-span-1 flex flex-col justify-between items-start">
                <div>
                  <h3 className="font-poppins font-semibold text-2xl text-wbk-black">
                    Sofas
                  </h3>
                  <p className="mt-4 text-sm text-wbk-brown font-poppins leading-relaxed max-w-xs opacity-90">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </p>
                </div>
                <Link
                  href="/products/sofas"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-wbk-black rounded-full text-xs font-semibold uppercase tracking-wider text-wbk-black hover:bg-wbk-black hover:text-wbk-white transition-all duration-300 mt-8 group"
                >
                  All sofas
                  <IconChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>

              {/* Right Columns: Swiper Slider */}
              <div
                className="lg:col-span-3 relative overflow-visible"
                style={{
                  width: `calc(100% + ${offset}px)`,
                  marginRight: `-${offset}px`,
                }}
              >
                <Swiper
                  modules={[Navigation]}
                  navigation={{
                    prevEl: sofasPrevEl,
                    nextEl: sofasNextEl,
                  }}
                  slidesPerView="auto"
                  spaceBetween={4}
                  className="w-full overflow-visible"
                >
                  {SOFAS_PRODUCTS.map((product) => (
                    <SwiperSlide
                      key={product.id}
                      className="!w-[280px] sm:!w-[320px] select-none"
                    >
                      <Link
                        href={product.link}
                        className="group block space-y-4"
                      >
                        {/* Image Box - Default styled block from ProductSlider */}
                        <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#E4E0DE]/45 flex items-center justify-center p-8 transition-colors duration-300 group-hover:bg-[#E4E0DE]/60 border border-wbk-lightgrey/30">
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
                            <div>Orientation: {product.orientation}</div>
                            <div>Size: {product.size}</div>
                            <div className="flex items-center gap-1.5 pt-1">
                              <span>Colors:</span>
                              <div className="flex items-center">
                                {product.colors.map((color, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-block h-3.5 w-3.5 rounded-full border border-wbk-lightgrey/80 -mr-1"
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
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
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* Navigation Button - Left */}
                <button
                  ref={setSofasPrevEl}
                  className="absolute left-4 md:-left-5 top-[180px] -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-wbk-green text-wbk-black shadow-md hover:bg-wbk-black hover:text-wbk-white transition-all duration-300 cursor-pointer disabled:opacity-0 disabled:pointer-events-none"
                >
                  <IconChevronLeft size={18} />
                </button>

                {/* Navigation Button - Right */}
                <button
                  ref={setSofasNextEl}
                  className="absolute right-4 md:right-8 top-[180px] -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-wbk-green text-wbk-black shadow-md hover:bg-wbk-black hover:text-wbk-white transition-all duration-300 cursor-pointer disabled:opacity-0 disabled:pointer-events-none"
                >
                  <IconChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
