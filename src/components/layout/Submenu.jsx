"use client";

import { useContext, useRef, useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { MenuContext } from "@/context/MenuContext";
import { SUBMENU_DATA } from "@/data/navigation";
import { SubmenuItem } from "./SubmenuItem";

// Swiper styles
import "swiper/css";
import "swiper/css/navigation";

const NAV_ORDER = [
  "beds",
  "sofas",
  "mattresses",
  "cabinets",
  "extras",
  "support",
];

const slideVariants = {
  enter: (dir) => ({
    x: dir === 0 ? 0 : dir > 0 ? 35 : -35,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir) => ({
    x: dir === 0 ? 0 : dir > 0 ? -35 : 35,
    opacity: 0,
  }),
};

export function Submenu() {
  const { subMenu, setSubMenu, cancelCloseSubmenu, scheduleCloseSubmenu } =
    useContext(MenuContext);

  const activeData = subMenu ? SUBMENU_DATA[subMenu] : null;
  const shouldShow = Boolean(activeData);

  // Swiper instance & scroll states
  const [swiper, setSwiper] = useState(null);
  const [canGoPrev, setCanGoPrev] = useState(false);
  const [canGoNext, setCanGoNext] = useState(false);

  const handleSwiperUpdate = useCallback((s) => {
    if (!s || s.destroyed) return;
    const isLocked = Boolean(s.isLocked);
    const progress = s.progress ?? (s.isBeginning ? 0 : s.isEnd ? 1 : 0.5);
    const hasNext = !isLocked && !s.isEnd && progress < 0.99;
    const hasPrev = !isLocked && !s.isBeginning && progress > 0.01;

    setCanGoPrev(hasPrev);
    setCanGoNext(hasNext);
  }, []);

  const handlePrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (swiper && !swiper.destroyed) {
      swiper.slidePrev();
      setTimeout(() => handleSwiperUpdate(swiper), 60);
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (swiper && !swiper.destroyed) {
      swiper.slideNext();
      setTimeout(() => handleSwiperUpdate(swiper), 60);
    }
  };

  // Reset scroll states when submenu category changes
  useEffect(() => {
    setCanGoPrev(false);
    setCanGoNext(false);
  }, [subMenu]);

  // Track hover direction between submenu categories
  const currentIndex = subMenu ? NAV_ORDER.indexOf(subMenu) : -1;
  const prevIndexRef = useRef(currentIndex);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (currentIndex !== -1 && prevIndexRef.current !== -1) {
      if (currentIndex > prevIndexRef.current) {
        setDirection(1); // moved to the right
      } else if (currentIndex < prevIndexRef.current) {
        setDirection(-1); // moved to the left
      }
    } else {
      setDirection(0); // initial open
    }
    prevIndexRef.current = currentIndex;
  }, [currentIndex]);

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          key="submenu-container"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onMouseEnter={cancelCloseSubmenu}
          onMouseLeave={() => setSubMenu(null)}
          className="absolute left-0 right-0 top-full z-50 bg-wbk-white border-b border-wbk-lightgrey shadow-xl overflow-hidden before:absolute before:-top-4 before:left-0 before:right-0 before:h-4 before:content-['']"
        >
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <AnimatePresence mode="wait" custom={direction}>
              {activeData && (
                <motion.div
                  key={subMenu}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
                  className="w-full flex justify-start"
                >
                  <div className="flex items-stretch justify-start gap-5 w-full">
                    {/* Fixed Parent category card on the left */}
                    {activeData.parent && (
                      <div className="w-[230px] xl:w-[245px] shrink-0 flex flex-col">
                        <SubmenuItem
                          isParent
                          title={activeData.parent.title}
                          image={activeData.parent.image}
                          href={activeData.parent.href}
                          tagline={activeData.parent.tagline}
                          onClick={() => setSubMenu(null)}
                        />
                      </div>
                    )}

                    {/* Swiper slider for subcategories with small green arrows */}
                    <div className="relative flex-1 min-w-0">
                      <Swiper
                        key={subMenu}
                        modules={[Navigation]}
                        slidesPerView="auto"
                        spaceBetween={20}
                        observer={true}
                        observeParents={true}
                        watchSlidesProgress={true}
                        onSwiper={(s) => {
                          setSwiper(s);
                          handleSwiperUpdate(s);
                          setTimeout(() => handleSwiperUpdate(s), 80);
                        }}
                        onSlideChange={(s) => handleSwiperUpdate(s)}
                        onProgress={(s) => handleSwiperUpdate(s)}
                        onResize={(s) => handleSwiperUpdate(s)}
                        onLock={() => {
                          setCanGoPrev(false);
                          setCanGoNext(false);
                        }}
                        onUnlock={(s) => handleSwiperUpdate(s)}
                        className="!overflow-hidden w-full h-full"
                      >
                        {activeData.items?.map((item, idx) => (
                          <SwiperSlide
                            key={`${subMenu}-item-${idx}`}
                            className="!w-[230px] xl:!w-[245px] !h-auto flex flex-col"
                          >
                            <SubmenuItem
                              title={item.title}
                              image={item.image}
                              href={item.href}
                              orientation={item.orientation}
                              type={item.type}
                              sizeRange={item.sizeRange}
                              price={item.price}
                              onClick={() => setSubMenu(null)}
                            />
                          </SwiperSlide>
                        ))}
                      </Swiper>

                      {/* Small green left navigation arrow */}
                      <button
                        type="button"
                        onClick={handlePrev}
                        aria-label="Previous items"
                        className={`absolute -left-3 top-1/2 -translate-y-1/2 z-50 flex h-7 w-7 items-center justify-center rounded-full bg-wbk-green text-wbk-black shadow-md hover:bg-wbk-black hover:text-wbk-white transition-all duration-200 cursor-pointer ${
                          canGoPrev
                            ? "opacity-100 scale-100 pointer-events-auto"
                            : "opacity-0 scale-75 pointer-events-none"
                        }`}
                      >
                        <IconChevronLeft size={16} />
                      </button>

                      {/* Small green right navigation arrow */}
                      <button
                        type="button"
                        onClick={handleNext}
                        aria-label="Next items"
                        className={`absolute -right-2.5 top-1/2 -translate-y-1/2 z-50 flex h-7 w-7 items-center justify-center rounded-full bg-wbk-green text-wbk-black shadow-md hover:bg-wbk-black hover:text-wbk-white transition-all duration-200 cursor-pointer ${
                          canGoNext
                            ? "opacity-100 scale-100 pointer-events-auto"
                            : "opacity-0 scale-75 pointer-events-none"
                        }`}
                      >
                        <IconChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
