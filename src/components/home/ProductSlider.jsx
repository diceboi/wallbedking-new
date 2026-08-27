"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/ui/ProductCard";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

import { POPULAR_PRODUCTS_OVERVIEW } from "@/data/products";

export function ProductSlider() {
  const [offset, setOffset] = useState(32);
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  // Dynamically calculate left offset to align Swiper with standard Container padding
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

  const products = POPULAR_PRODUCTS_OVERVIEW;

  return (
    <section className="py-24 bg-white overflow-hidden">
      {/* Header Container */}
      <Container className="mb-12 flex items-end justify-between">
        <div className="space-y-2">
          <h2 className="font-new-york text-4xl md:text-5xl text-wbk-black leading-tight">
            Popular products
          </h2>
        </div>
        <div>
          <Button as="link" href="/products" variant="secondary" size="md">
            All products
          </Button>
        </div>
      </Container>

      {/* Slider Wrapper */}
      <div className="relative w-full">
        {/* Custom Navigation Button - Right */}
        <button
          ref={nextRef}
          className="absolute right-8 top-2/5 -translate-y-1/2 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-wbk-green text-wbk-black shadow-md hover:bg-wbk-black hover:text-wbk-white hover:border-wbk-black transition-all duration-300 cursor-pointer disabled:opacity-0 disabled:pointer-events-none"
        >
          <IconChevronRight size={24} />
        </button>

        {/* Custom Navigation Button - Left */}
        <button
          ref={prevRef}
          className="absolute left-8 top-2/5 -translate-y-1/2 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-wbk-green text-wbk-black shadow-md hover:bg-wbk-black hover:text-wbk-white hover:border-wbk-black transition-all duration-300 cursor-pointer disabled:opacity-0 disabled:pointer-events-none"
        >
          <IconChevronLeft size={24} />
        </button>

        <Swiper
          modules={[Navigation]}
          onInit={(swiper) => {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
            swiper.navigation.init();
            swiper.navigation.update();
          }}
          slidesOffsetBefore={offset}
          slidesOffsetAfter={offset}
          slidesPerView="auto"
          spaceBetween={4}
          className="popular-products-swiper overflow-visible"
        >
          {products.map((prod, idx) => (
            <SwiperSlide
              key={idx}
              className="!w-[400px] !sm:w-[320px] !md:w-[380px] select-none"
            >
              <ProductCard product={prod} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
