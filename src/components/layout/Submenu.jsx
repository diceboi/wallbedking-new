"use client";

import { useContext, useRef, useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { MenuContext } from "@/context/MenuContext";
import { SUBMENU_DATA, MAIN_NAV_ITEMS } from "@/data/navigation";
import { SubmenuItem } from "./SubmenuItem";

// Swiper styles
import "swiper/css";
import "swiper/css/navigation";

const NAV_ORDER = MAIN_NAV_ITEMS.map((item) => item.slug || item.id);

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

function SubmenuSectionRow({ section, onSelect }) {
  const [swiper, setSwiper] = useState(null);
  const [canGoPrev, setCanGoPrev] = useState(false);
  const [canGoNext, setCanGoNext] = useState(false);

  const handleUpdate = useCallback((s) => {
    if (!s || s.destroyed) return;
    const isLocked = Boolean(s.isLocked);
    const progress = s.progress ?? (s.isBeginning ? 0 : s.isEnd ? 1 : 0.5);
    setCanGoPrev(!isLocked && !s.isBeginning && progress > 0.01);
    setCanGoNext(!isLocked && !s.isEnd && progress < 0.99);
  }, []);

  const handlePrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (swiper && !swiper.destroyed) {
      swiper.slidePrev();
      setTimeout(() => handleUpdate(swiper), 60);
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (swiper && !swiper.destroyed) {
      swiper.slideNext();
      setTimeout(() => handleUpdate(swiper), 60);
    }
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2 mb-1.5 px-0.5">
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-wbk-black">
          {section.title}
        </span>
        {section.badge && (
          <span className="px-2 py-0.5 rounded-full bg-wbk-gold/15 text-wbk-black border border-wbk-gold/30 text-[9px] font-semibold tracking-wider uppercase">
            {section.badge}
          </span>
        )}
      </div>

      <div className="flex items-stretch gap-3.5 w-full">
        {/* Split parent overview card for this section */}
        {section.parent && (
          <div className="w-[195px] xl:w-[210px] shrink-0 flex flex-col">
            <SubmenuItem
              isParent
              compact
              title={section.parent.title}
              titleKey={section.parent.titleKey}
              image={section.parent.image}
              hoverImage={section.parent.hoverImage}
              href={section.parent.href}
              tagline={section.parent.tagline}
              taglineKey={section.parent.taglineKey}
              onClick={onSelect}
            />
          </div>
        )}

        <div className="relative flex-1 min-w-0">
          <Swiper
            modules={[Navigation]}
            slidesPerView="auto"
            spaceBetween={14}
            observer={true}
            observeParents={true}
            watchSlidesProgress={true}
            onSwiper={(s) => {
              setSwiper(s);
              handleUpdate(s);
              setTimeout(() => handleUpdate(s), 80);
            }}
            onSlideChange={handleUpdate}
            onProgress={handleUpdate}
            onResize={handleUpdate}
            onLock={() => {
              setCanGoPrev(false);
              setCanGoNext(false);
            }}
            onUnlock={handleUpdate}
            className="!overflow-hidden w-full h-full"
          >
            {section.items?.map((item, idx) => (
              <SwiperSlide
                key={`${section.id || "sec"}-item-${idx}`}
                className="!w-[195px] xl:!w-[210px] !h-auto flex flex-col"
              >
                <SubmenuItem
                  compact
                  title={item.title}
                  titleKey={item.titleKey}
                  image={item.image}
                  hoverImage={item.hoverImage}
                  href={item.href}
                  price={item.price}
                  onClick={onSelect}
                />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Small green left navigation arrow */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label={`Previous ${section.title} items`}
            className={`absolute -left-2.5 top-1/2 -translate-y-1/2 z-50 flex h-6 w-6 items-center justify-center rounded-full bg-wbk-green text-wbk-black shadow-md hover:bg-wbk-black hover:text-wbk-white transition-all duration-200 cursor-pointer ${
              canGoPrev
                ? "opacity-100 scale-100 pointer-events-auto"
                : "opacity-0 scale-75 pointer-events-none"
            }`}
          >
            <IconChevronLeft size={14} />
          </button>

          {/* Small green right navigation arrow */}
          <button
            type="button"
            onClick={handleNext}
            aria-label={`Next ${section.title} items`}
            className={`absolute -right-2 top-1/2 -translate-y-1/2 z-50 flex h-6 w-6 items-center justify-center rounded-full bg-wbk-green text-wbk-black shadow-md hover:bg-wbk-black hover:text-wbk-white transition-all duration-200 cursor-pointer ${
              canGoNext
                ? "opacity-100 scale-100 pointer-events-auto"
                : "opacity-0 scale-75 pointer-events-none"
            }`}
          >
            <IconChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function Submenu() {
  const { subMenu, setSubMenu, cancelCloseSubmenu, scheduleCloseSubmenu, navItems } =
    useContext(MenuContext);
  const items = navItems || MAIN_NAV_ITEMS;

  const activeData = subMenu
    ? (SUBMENU_DATA[subMenu] || SUBMENU_DATA[items.find((it) => it.slug === subMenu || it.id === subMenu)?.category_id])
    : null;
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
  const navOrder = items.map((item) => item.slug || item.category_id || item.id);
  const currentIndex = subMenu ? navOrder.indexOf(subMenu) : -1;
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

  const hasSections = Boolean(activeData?.sections && activeData.sections.length > 0);

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
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
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
                  <div className="w-full">
                    {/* Content: Multi-row sections OR single-row slider with parent */}
                    {hasSections ? (
                      <div className="w-full flex flex-col gap-4">
                        {activeData.sections.map((section) => (
                          <SubmenuSectionRow
                            key={section.id || section.title}
                            section={section}
                            onSelect={() => setSubMenu(null)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-stretch justify-start gap-5 w-full">
                        {/* Fixed Parent category card on the left */}
                        {activeData.parent && (
                          <div className="w-[230px] xl:w-[245px] shrink-0 flex flex-col">
                            <SubmenuItem
                              isParent
                              title={activeData.parent.title}
                              titleKey={activeData.parent.titleKey}
                              image={activeData.parent.image}
                              hoverImage={activeData.parent.hoverImage}
                              href={activeData.parent.href}
                              tagline={activeData.parent.tagline}
                              taglineKey={activeData.parent.taglineKey}
                              onClick={() => setSubMenu(null)}
                            />
                          </div>
                        )}

                        {/* Standard single-row Swiper slider for subcategories */}
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
                                  titleKey={item.titleKey}
                                  image={item.image}
                                  hoverImage={item.hoverImage}
                                  href={item.href}
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
                    )}
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
