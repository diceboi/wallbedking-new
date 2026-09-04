"use client";

import { useEffect, useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

export function ReviewsSlider() {
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

  const reviews = [
    {
      text: "The bed we bought is fantastic, we have a small room and it fits away perfectly. You can use your own mattress. We are really pleased with this product and would definitely recommend Wall Bed King.",
      author: "Roz M",
      platform: "Google",
    },
    {
      text: "I bought a bed from Wall Bed King, I have to say they have been one of the best companies I have dealt with in a long time.",
      author: "Christopher Pettite",
      platform: "Google",
    },
    {
      text: "I paid a great price for a small double bed, which made my space much better and useful and I could not be happier and more pleased with my purchase!",
      author: "Catherine O'Connor",
      platform: "Google",
    },
    {
      text: "Outstanding quality wall bed and excellent customer service. Straightforward installation instructions. Highly recommended if you want to save space.",
      author: "Iain Donald",
      platform: "Google",
    },
    {
      text: "Excellent service from start to finish. The bed mechanism is incredibly smooth and easy to lift. It completely transformed our box room into a functional office/guest room.",
      author: "Sarah Jenkins",
      platform: "Google",
    },
    {
      text: "Very impressed with the build quality. Heavy duty steel frame, robust springs, and sits absolutely secure. Customer support answered all my questions pre-sale.",
      author: "David Vance",
      platform: "Google",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white overflow-hidden border-b border-wbk-lightgrey/60">
      {/* Header Container */}
      <Container className="mb-8 md:mb-12">
        <div className="flex flex-col gap-2">
          <h2 className="font-new-york text-3xl sm:text-4xl md:text-5xl text-wbk-black leading-tight">
            Reviews
          </h2>
          <div className="flex justify-end w-full">
            <Button
              as="link"
              href="/reviews"
              variant="secondary"
              size="md"
              className="whitespace-nowrap"
            >
              All reviews
            </Button>
          </div>
        </div>
      </Container>

      {/* Slider Wrapper */}
      <div className="relative w-full">
        {/* Custom Navigation Button - Right */}
        <button
          ref={nextRef}
          aria-label="Next reviews"
          className="absolute right-2 sm:right-4 md:right-8 top-[90px] sm:top-[110px] md:top-[120px] -translate-y-1/2 z-30 flex h-9 w-9 sm:h-11 sm:w-11 md:h-14 md:w-14 items-center justify-center rounded-full bg-wbk-green text-wbk-black shadow-md hover:bg-wbk-black hover:text-wbk-white hover:border-wbk-black transition-all duration-300 cursor-pointer disabled:opacity-0 disabled:pointer-events-none"
        >
          <IconChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
        </button>

        {/* Custom Navigation Button - Left */}
        <button
          ref={prevRef}
          aria-label="Previous reviews"
          className="absolute left-2 sm:left-4 md:left-8 top-[90px] sm:top-[110px] md:top-[120px] -translate-y-1/2 z-30 flex h-9 w-9 sm:h-11 sm:w-11 md:h-14 md:w-14 items-center justify-center rounded-full bg-wbk-green text-wbk-black shadow-md hover:bg-wbk-black hover:text-wbk-white hover:border-wbk-black transition-all duration-300 cursor-pointer disabled:opacity-0 disabled:pointer-events-none"
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
              slidesPerView: 1.35,
              spaceBetween: 16,
            },
            640: {
              slidesPerView: 2.1,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 2.8,
              spaceBetween: 24,
            },
            1280: {
              slidesPerView: 3.5,
              spaceBetween: 24,
            },
          }}
          className="reviews-swiper overflow-visible"
        >
          {reviews.map((rev, idx) => (
            <SwiperSlide
              key={idx}
              className="select-none group h-auto"
            >
              <div className="flex flex-col h-full">
                {/* Review Text Card Block */}
                <div className="relative w-full h-[200px] sm:h-[220px] md:h-[240px] bg-[#F4F2F0]/60 p-6 sm:p-8 md:p-10 flex items-center justify-center text-center transition-all duration-300 group-hover:bg-[#F4F2F0]/80 border border-wbk-lightgrey/30 rounded-none">
                  <p className="font-poppins font-normal text-xs sm:text-sm md:text-base text-wbk-black leading-relaxed line-clamp-6">
                    "{rev.text}"
                  </p>
                </div>

                {/* Author and Platform Details */}
                <div className="mt-4 sm:mt-5 px-1">
                  <span className="font-poppins font-medium text-xs sm:text-sm md:text-base text-wbk-black">
                    {rev.author}
                  </span>
                  <span className="font-poppins font-normal text-xs sm:text-sm md:text-base text-wbk-brown">
                    , {rev.platform}
                  </span>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
