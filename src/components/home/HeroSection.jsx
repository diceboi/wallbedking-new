"use client";

import { useRef, useState, useEffect } from "react";
import { useScroll, useTransform, useSpring, motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Hero3DCanvas } from "@/components/home/Hero3DCanvas";
import { Hero3DLoader } from "@/components/home/Hero3DLoader";
import { IconChevronDown } from "@tabler/icons-react";

export function HeroSection() {
  const containerRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Track scroll position through the 250vh container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Apply spring physics for smooth 3D animation
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 25,
    restDelta: 0.001,
  });

  // Keep state synced for R3F useFrame
  useEffect(() => {
    const unsubscribe = smoothProgress.on("change", (latest) => {
      setScrollProgress(latest);
    });
    return () => unsubscribe();
  }, [smoothProgress]);

  // Subtle dark overlay to maintain text readability throughout the scroll animation
  const overlayOpacity = useTransform(
    scrollYProgress,
    [0, 0.5, 1.0],
    [0.35, 0.25, 0.2],
  );

  return (
    <>
      {/* Full-screen Loading Overlay covering the entire page immediately from first paint */}
      <Hero3DLoader />

      {/*
       * Fixed hero — sits behind everything, pinned below the 60px header.
       * Doesn't move at all when scrolling.
       */}
      <div className="fixed top-[60px] left-0 right-0 bottom-0 z-0">
        {/* 3D Canvas */}
        <div className="absolute inset-0">
          {mounted && <Hero3DCanvas scrollProgress={scrollProgress} />}
        </div>

        {/* Subtle dark overlay layer for better text readability */}
        <motion.div
          style={{ opacity: overlayOpacity }}
          className="absolute inset-0 z-[5] bg-black pointer-events-none"
        />

        {/* Text — centered, fixed, always remains centered even when scrolling */}
        <div
          className="flex flex-col items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center pointer-events-none w-full max-w-2xl px-4"
        >
          <h1 className="font-new-york text-5xl sm:text-5xl md:text-6xl leading-[1.05] text-wbk-white drop-shadow-md">
            Modular Murphy Beds
          </h1>
          <p className="mt-2 text-sm sm:text-base text-wbk-white leading-relaxed drop-shadow-sm">
            Space-saving, handcrafted wall beds engineered for seamless everyday
            living.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 pointer-events-auto">
            <Button
              as="link"
              href="/products/beds"
              variant="primary"
              size="lg"
              className=""
            >
              Shop Collection
            </Button>
            <Button
              as="link"
              href="/about"
              variant="secondary"
              size="lg"
              className="bg-wbk-white/80 backdrop-blur-md border-0"
            >
              Explore Models
            </Button>
          </div>
        </div>

        {/* Scroll cue — bottom center */}
        {scrollProgress < 0.15 && (
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-wbk-brown pointer-events-none transition-opacity duration-500"
            style={{ opacity: Math.max(0, 1 - scrollProgress * 8) }}
          >
            <span className="text-[10px] uppercase tracking-widest font-medium text-wbk-white/80">
              Scroll to explore
            </span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{
                repeat: Infinity,
                duration: 1.8,
                ease: "easeInOut",
              }}
            >
              <IconChevronDown size={18} />
            </motion.div>
          </div>
        )}
      </div>

      {/*
       * Scroll spacer — creates the scroll distance for the 3D animation.
       * The next section (in page.jsx) slides up over the fixed hero.
       */}
      <div
        ref={containerRef}
        className="relative h-[280vh] pointer-events-none"
      />
    </>
  );
}
