"use client";

import { useRef, useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { ALL_PRODUCTS, CATEGORIES_INFO } from "@/data/products";

import "swiper/css";
import "swiper/css/navigation";

import { ProductCard } from "@/components/ui/ProductCard";

export default function ProductsPage() {
  const [offset, setOffset] = useState(32);

  // Dynamically calculate left/right offset to align Swiper with viewport boundaries
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1548) {
        setOffset((width - 1548) / 2 + 32);
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

  const [bedsPrevEl, setBedsPrevEl] = useState(null);
  const [bedsNextEl, setBedsNextEl] = useState(null);
  const [sofasPrevEl, setSofasPrevEl] = useState(null);
  const [sofasNextEl, setSofasNextEl] = useState(null);
  const [mattressesPrevEl, setMattressesPrevEl] = useState(null);
  const [mattressesNextEl, setMattressesNextEl] = useState(null);
  const [cabinetsPrevEl, setCabinetsPrevEl] = useState(null);
  const [cabinetsNextEl, setCabinetsNextEl] = useState(null);

  // Distinct representative items per category
  const bedItems = (ALL_PRODUCTS.beds || []).filter((_, idx) => idx % 4 === 0).slice(0, 8);
  const sofaItems = (ALL_PRODUCTS.sofas || []).filter((_, idx) => idx % 2 === 0).slice(0, 8);
  const mattressItems = ALL_PRODUCTS.mattresses || [];
  const cabinetItems = (ALL_PRODUCTS.cabinets || []).filter((_, idx) => idx % 2 === 0).slice(0, 8);

  return (
    <div className="bg-wbk-white">
      {/* ── HERO BANNER SECTION ── */}
      <section
        className="relative h-[65vh] min-h-[500px] w-full flex items-center bg-cover bg-center"
        style={{
          backgroundImage: "url('/category-images/integrated-beds.webp')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-wbk-white/70 via-wbk-white/30 to-transparent" />

        <Container size="xl" className="relative z-10 pt-[60px]">
          <div className="max-w-2xl px-2">
            <h1 className="font-new-york text-5xl sm:text-6xl md:text-7xl text-wbk-black leading-tight tracking-tight">
              Our Products
            </h1>
            <p className="mt-4 font-poppins text-base sm:text-lg text-wbk-black/80 max-w-xl leading-relaxed">
              Murphy beds, modular sofas, comfort mattresses and coordinated cabinetry in all shapes and sizes.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                as="link"
                href="/products/beds"
                variant="white"
                size="lg"
                className="shadow-md hover:shadow-lg"
              >
                Explore Murphy Beds
              </Button>
              <Button
                as="link"
                href="/products/beds/integrated-bed"
                variant="secondary"
                size="lg"
                className="border-wbk-black/20 text-wbk-black hover:bg-wbk-black hover:text-white bg-white/60 backdrop-blur-sm shadow-md"
              >
                3D Configurator
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* ── PRODUCT CATEGORIES CAROUSEL SECTION ── */}
      <section className="py-20 overflow-hidden">
        <Container size="xl">
          <h2 className="font-new-york text-4xl sm:text-5xl text-wbk-black mb-16">
            Explore by Category
          </h2>

          <div className="space-y-24">
            {/* ── 1. MURPHY BEDS ── */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 pt-16 border-t border-wbk-lightgrey/40 first:border-t-0 first:pt-0">
              <div className="lg:col-span-1 flex flex-col justify-between items-start">
                <div>
                  <h3 className="font-poppins font-semibold text-2xl text-wbk-black">
                    Murphy Beds
                  </h3>
                  <p className="mt-4 text-sm text-wbk-brown font-poppins leading-relaxed max-w-xs opacity-90">
                    Precision-engineered fold-away bed mechanisms with SizeFlex™ and TypeFlex™ modularity. Available in Classic, Studio, and Integrated models.
                  </p>
                </div>
                <Link
                  href="/products/beds"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-wbk-black rounded-full text-xs font-semibold uppercase tracking-wider text-wbk-black hover:bg-wbk-black hover:text-wbk-white transition-all duration-300 mt-8 group"
                >
                  All Murphy Beds
                  <IconChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>

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
                  {bedItems.map((product) => (
                    <SwiperSlide
                      key={product.slug || product.id}
                      className="!w-[300px] sm:!w-[340px] select-none"
                    >
                      <ProductCard product={product} />
                    </SwiperSlide>
                  ))}
                </Swiper>

                <button
                  ref={setBedsPrevEl}
                  className="absolute left-4 md:-left-5 top-[180px] -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-wbk-green text-wbk-black shadow-md hover:bg-wbk-black hover:text-wbk-white transition-all duration-300 cursor-pointer disabled:opacity-0 disabled:pointer-events-none"
                >
                  <IconChevronLeft size={18} />
                </button>
                <button
                  ref={setBedsNextEl}
                  className="absolute right-4 md:right-8 top-[180px] -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-wbk-green text-wbk-black shadow-md hover:bg-wbk-black hover:text-wbk-white transition-all duration-300 cursor-pointer disabled:opacity-0 disabled:pointer-events-none"
                >
                  <IconChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* ── 2. SOFAS ── */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 pt-16 border-t border-wbk-lightgrey/40">
              <div className="lg:col-span-1 flex flex-col justify-between items-start">
                <div>
                  <h3 className="font-poppins font-semibold text-2xl text-wbk-black">
                    Sofas
                  </h3>
                  <p className="mt-4 text-sm text-wbk-brown font-poppins leading-relaxed max-w-xs opacity-90">
                    Adaptable modular sofas designed for front bed attachment or freestanding living configurations with removable upholstery.
                  </p>
                </div>
                <Link
                  href="/products/sofas"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-wbk-black rounded-full text-xs font-semibold uppercase tracking-wider text-wbk-black hover:bg-wbk-black hover:text-wbk-white transition-all duration-300 mt-8 group"
                >
                  All Sofas
                  <IconChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>

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
                  {sofaItems.map((product) => (
                    <SwiperSlide
                      key={product.slug || product.id}
                      className="!w-[300px] sm:!w-[340px] select-none"
                    >
                      <ProductCard product={product} />
                    </SwiperSlide>
                  ))}
                </Swiper>

                <button
                  ref={setSofasPrevEl}
                  className="absolute left-4 md:-left-5 top-[180px] -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-wbk-green text-wbk-black shadow-md hover:bg-wbk-black hover:text-wbk-white transition-all duration-300 cursor-pointer disabled:opacity-0 disabled:pointer-events-none"
                >
                  <IconChevronLeft size={18} />
                </button>
                <button
                  ref={setSofasNextEl}
                  className="absolute right-4 md:right-8 top-[180px] -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-wbk-green text-wbk-black shadow-md hover:bg-wbk-black hover:text-wbk-white transition-all duration-300 cursor-pointer disabled:opacity-0 disabled:pointer-events-none"
                >
                  <IconChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* ── 3. MATTRESSES ── */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 pt-16 border-t border-wbk-lightgrey/40">
              <div className="lg:col-span-1 flex flex-col justify-between items-start">
                <div>
                  <h3 className="font-poppins font-semibold text-2xl text-wbk-black">
                    Mattresses
                  </h3>
                  <p className="mt-4 text-sm text-wbk-brown font-poppins leading-relaxed max-w-xs opacity-90">
                    Comfort, Luxury, and Supreme comfort grades with optimal thickness specifically rated for wall bed integration.
                  </p>
                </div>
                <Link
                  href="/products/mattresses"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-wbk-black rounded-full text-xs font-semibold uppercase tracking-wider text-wbk-black hover:bg-wbk-black hover:text-wbk-white transition-all duration-300 mt-8 group"
                >
                  All Mattresses
                  <IconChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>

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
                    prevEl: mattressesPrevEl,
                    nextEl: mattressesNextEl,
                  }}
                  slidesPerView="auto"
                  spaceBetween={4}
                  className="w-full overflow-visible"
                >
                  {mattressItems.map((product) => (
                    <SwiperSlide
                      key={product.slug || product.id}
                      className="!w-[300px] sm:!w-[340px] select-none"
                    >
                      <ProductCard product={product} />
                    </SwiperSlide>
                  ))}
                </Swiper>

                <button
                  ref={setMattressesPrevEl}
                  className="absolute left-4 md:-left-5 top-[180px] -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-wbk-green text-wbk-black shadow-md hover:bg-wbk-black hover:text-wbk-white transition-all duration-300 cursor-pointer disabled:opacity-0 disabled:pointer-events-none"
                >
                  <IconChevronLeft size={18} />
                </button>
                <button
                  ref={setMattressesNextEl}
                  className="absolute right-4 md:right-8 top-[180px] -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-wbk-green text-wbk-black shadow-md hover:bg-wbk-black hover:text-wbk-white transition-all duration-300 cursor-pointer disabled:opacity-0 disabled:pointer-events-none"
                >
                  <IconChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* ── 4. CABINETS ── */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 pt-16 border-t border-wbk-lightgrey/40">
              <div className="lg:col-span-1 flex flex-col justify-between items-start">
                <div>
                  <h3 className="font-poppins font-semibold text-2xl text-wbk-black">
                    Cabinets & Storage
                  </h3>
                  <p className="mt-4 text-sm text-wbk-brown font-poppins leading-relaxed max-w-xs opacity-90">
                    Vertical & Horizontal front enclosures, extensions, and matching side storage units available in Pine, Beech, Oak, and White finishes.
                  </p>
                </div>
                <Link
                  href="/products/cabinets"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-wbk-black rounded-full text-xs font-semibold uppercase tracking-wider text-wbk-black hover:bg-wbk-black hover:text-wbk-white transition-all duration-300 mt-8 group"
                >
                  All Cabinets
                  <IconChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>

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
                    prevEl: cabinetsPrevEl,
                    nextEl: cabinetsNextEl,
                  }}
                  slidesPerView="auto"
                  spaceBetween={4}
                  className="w-full overflow-visible"
                >
                  {cabinetItems.map((product) => (
                    <SwiperSlide
                      key={product.slug || product.id}
                      className="!w-[300px] sm:!w-[340px] select-none"
                    >
                      <ProductCard product={product} />
                    </SwiperSlide>
                  ))}
                </Swiper>

                <button
                  ref={setCabinetsPrevEl}
                  className="absolute left-4 md:-left-5 top-[180px] -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-wbk-green text-wbk-black shadow-md hover:bg-wbk-black hover:text-wbk-white transition-all duration-300 cursor-pointer disabled:opacity-0 disabled:pointer-events-none"
                >
                  <IconChevronLeft size={18} />
                </button>
                <button
                  ref={setCabinetsNextEl}
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
