"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

export function ProductSlider() {
  const [offset, setOffset] = useState(32);
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  // Dynamically calculate left offset to align Swiper with standard Container padding
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1548) {
        setOffset((width - 1548) / 2 + 32); // Max-width 7xl (1280px) + padding-lg (32px)
      } else if (width >= 1280) {
        setOffset(32); // lg
      } else if (width >= 1024) {
        setOffset(24); // sm
      } else {
        setOffset(16); // default px-4
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const products = [
    {
      title: "MORPHY™ Bed with Sofa",
      orientation: "Vertical",
      size: "180x200",
      colors: ["#A5988E", "#D2AA7C", "#E4E0DE", "#090A0A"],
      price: "£799",
      link: "/products/sofas/bed-with-sofa",
    },
    {
      title: "Integrated MORPHY™ Bed",
      orientation: "Vertical",
      size: "180x200",
      colors: ["#A5988E", "#D2AA7C", "#E4E0DE", "#090A0A"],
      price: "£799",
      link: "/products/beds/integrated-bed",
    },
    {
      title: "Bed with sofa",
      orientation: "Vertical",
      size: "180x200",
      colors: ["#A5988E", "#D2AA7C", "#E4E0DE", "#090A0A"],
      price: "£799",
      link: "/products/sofas/bed-with-sofa",
    },
    {
      title: "Studio Sofa Wallbed",
      orientation: "Vertical",
      size: "180x200",
      colors: ["#E4E0DE", "#D2AA7C", "#A5988E"],
      price: "£849",
      link: "/products/sofas/studio-sofa-wallbed",
    },
    {
      title: "Classic Wall Bed",
      orientation: "Horizontal",
      size: "150x200",
      colors: ["#A5988E", "#E4E0DE", "#090A0A"],
      price: "£699",
      link: "/products/beds/classic-wall-bed",
    },
    {
      title: "Studio Murphy Bed",
      orientation: "Vertical",
      size: "140x200",
      colors: ["#A5988E", "#D2AA7C", "#E4E0DE"],
      price: "£599",
      link: "/products/beds/studio-bed",
    },
    {
      title: "Premium Wall Bed",
      orientation: "Vertical",
      size: "160x200",
      colors: ["#A5988E", "#D2AA7C", "#E4E0DE", "#090A0A"],
      price: "£699",
      link: "/products/beds/premium-bed",
    },
    {
      title: "Luxury Murphy Bed",
      orientation: "Vertical",
      size: "160x200",
      colors: ["#A5988E", "#090A0A"],
      price: "£899",
      link: "/products/beds/luxury-murphy-bed",
    },
    {
      title: "Modular Sofa Bed",
      orientation: "Vertical",
      size: "180x200",
      colors: ["#A5988E", "#D2AA7C", "#E4E0DE", "#090A0A"],
      price: "£899",
      link: "/products/sofas/modular-sofa-bed",
    },
    {
      title: "Classic Wall Bed",
      orientation: "Horizontal",
      size: "150x200",
      colors: ["#A5988E", "#E4E0DE", "#090A0A"],
      price: "£699",
      link: "/products/classic-wall-bed",
    },
  ];

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
              <Link href={prod.link} className="group block space-y-4">
                {/* Image Box - Light grey background container */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#E4E0DE]/45 flex items-center justify-center p-8 transition-colors duration-300 group-hover:bg-[#E4E0DE]/60">
                  {/* Primary Product Image */}
                  <img
                    src="/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp"
                    alt={prod.title}
                    className="h-full w-full object-contain transition-opacity duration-500 group-hover:opacity-0"
                  />
                  {/* Hover Product Image with Mattress */}
                  <img
                    src="/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp"
                    alt={`${prod.title} details`}
                    className="absolute inset-0 h-full w-full object-contain p-8 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />
                </div>

                {/* Product Text Details */}
                <div className="space-y-2 px-1">
                  <h3 className="font-poppins font-medium text-lg text-wbk-black transition-colors duration-200 group-hover:text-wbk-gold">
                    {prod.title}
                  </h3>

                  {/* Specs */}
                  <div className="text-xs text-wbk-black space-y-0.5">
                    <div>Orientation: {prod.orientation}</div>
                    <div>Size: {prod.size}</div>
                    <div className="flex items-center gap-1.5 pt-1">
                      <span>Colors:</span>
                      <div className="flex items-center">
                        {prod.colors.map((color, cIdx) => (
                          <span
                            key={cIdx}
                            className="inline-block h-3.5 w-3.5 rounded-full border border-wbk-lightgrey/80 -mr-1"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="pt-1 text-sm text-wbk-black">
                    from{" "}
                    <span className="font-semibold text-base">
                      {prod.price}
                    </span>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
