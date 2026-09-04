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
    <section className="py-16 md:py-24 bg-white overflow-hidden">
      {/* Header Container */}
      <Container className="mb-8 md:mb-12">
        <div className="flex flex-col gap-2">
          <h2 className="font-new-york text-3xl sm:text-4xl md:text-5xl text-wbk-black leading-tight">
            Popular products
          </h2>
          <div className="flex justify-end w-full">
            <Button
              as="link"
              href="/products"
              variant="secondary"
              size="md"
              className="whitespace-nowrap"
            >
              All products
            </Button>
          </div>
        </div>
      </Container>

      {/* Slider Wrapper */}
      <div className="relative w-full">
        {/* Custom Navigation Button - Right */}
        <button
          ref={nextRef}
          aria-label="Next slide"
          className="absolute right-2 sm:right-4 md:right-8 top-[38%] -translate-y-1/2 z-30 flex h-9 w-9 sm:h-11 sm:w-11 md:h-14 md:w-14 items-center justify-center rounded-full bg-wbk-green text-wbk-black shadow-md hover:bg-wbk-black hover:text-wbk-white hover:border-wbk-black transition-all duration-300 cursor-pointer disabled:opacity-0 disabled:pointer-events-none"
        >
          <IconChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
        </button>

        {/* Custom Navigation Button - Left */}
        <button
          ref={prevRef}
          aria-label="Previous slide"
          className="absolute left-2 sm:left-4 md:left-8 top-[38%] -translate-y-1/2 z-30 flex h-9 w-9 sm:h-11 sm:w-11 md:h-14 md:w-14 items-center justify-center rounded-full bg-wbk-green text-wbk-black shadow-md hover:bg-wbk-black hover:text-wbk-white hover:border-wbk-black transition-all duration-300 cursor-pointer disabled:opacity-0 disabled:pointer-events-none"
        >
          <IconChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
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
          slidesPerView={1.25}
          spaceBetween={16}
          breakpoints={{
            480: {
              slidesPerView: 1.4,
              spaceBetween: 16,
            },
            640: {
              slidesPerView: 2.2,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 3.2,
              spaceBetween: 24,
            },
            1280: {
              slidesPerView: 4,
              spaceBetween: 24,
            },
          }}
          className="popular-products-swiper overflow-visible"
        >
          {products.map((prod, idx) => (
            <SwiperSlide
              key={idx}
              className="select-none h-auto"
            >
              <ProductCard product={prod} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
