"use client";

import { useContext, useRef, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MenuContext } from "@/context/MenuContext";
import { SUBMENU_DATA } from "@/data/navigation";
import { SubmenuItem } from "./SubmenuItem";

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
          onMouseLeave={() => scheduleCloseSubmenu(500)}
          className="absolute left-0 right-0 top-full z-40 bg-wbk-white border-b border-wbk-lightgrey shadow-xl overflow-hidden before:absolute before:-top-4 before:left-0 before:right-0 before:h-4 before:content-['']"
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
                  <div className="flex items-stretch justify-start gap-5 w-full overflow-x-auto custom-scrollbar pb-1">
                    {/* Parent category card */}
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

                    {/* Child items / products */}
                    {activeData.items?.map((item, idx) => (
                      <div
                        key={`${subMenu}-item-${idx}`}
                        className="w-[230px] xl:w-[245px] shrink-0 flex flex-col"
                      >
                        <SubmenuItem
                          title={item.title}
                          image={item.image}
                          href={item.href}
                          badge={item.badge}
                          onClick={() => setSubMenu(null)}
                        />
                      </div>
                    ))}
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
