"use client";

import { useRef, useState, useEffect } from "react";
import { useScroll, useTransform, useSpring, motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Hero3DCanvas } from "@/components/home/Hero3DCanvas";
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

  // Apply spring physics to turn abrupt scroll wheel jumps into smooth 60fps physics
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

  // Text overlay opacity and position transforms
  const textOpacity = useTransform(scrollYProgress, [0, 0.4, 0.8], [1, 0.6, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.8], [0, -60]);
  const badgeOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return (
    <section ref={containerRef} className="relative h-[250vh] bg-[#F4F2F0]">
      {/* Sticky viewport pinned to screen while scrolling */}
      <div className="sticky top-0 h-[98vh] w-full overflow-hidden">
        {/* 3D Canvas Background */}
        <div className="absolute inset-0 z-0">
          {mounted && <Hero3DCanvas scrollProgress={scrollProgress} />}
        </div>

        {/* Text Overlay */}
        <div className="relative z-10 flex h-full flex-col justify-between py-12 pointer-events-none">
          {/* Top subtle badge */}
          <motion.div
            style={{ opacity: badgeOpacity }}
            className="flex justify-center pt-8"
          >
            <span className="inline-block rounded-full bg-wbk-white/80 backdrop-blur-md px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-wbk-brown shadow-sm border border-wbk-lightgrey/50">
              Modular Murphy Beds & Furniture
            </span>
          </motion.div>

          {/* Center Main Content */}
          <Container className="flex flex-col items-start text-start">
            <motion.div style={{ opacity: textOpacity, y: textY }} className="">
              <h1 className="font-new-york text-5xl sm:text-6xl md:text-7xl leading-[1.05] text-wbk-black drop-shadow-sm">
                Modular Murphy Beds
              </h1>
              <p className="text-sm sm:text-base text-wbk-brown leading-relaxed">
                Space-saving, handcrafted wall beds engineered for seamless
                everyday living. Scroll down to see the transformation.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4 pointer-events-auto">
                <Button
                  as="link"
                  href="/products/beds"
                  size="lg"
                  className="shadow-md"
                >
                  Shop Collection
                </Button>
                <Button
                  as="link"
                  href="/about"
                  variant="secondary"
                  size="lg"
                  className="bg-wbk-white/80 backdrop-blur-md"
                >
                  Explore Models
                </Button>
              </div>
            </motion.div>
          </Container>

          {/* Bottom scroll cue indicator */}
          <motion.div
            style={{ opacity: badgeOpacity }}
            className="flex flex-col items-center gap-2 pb-4 text-wbk-brown"
          >
            <span className="text-[10px] uppercase tracking-widest font-medium">
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
          </motion.div>
        </div>
      </div>
    </section>
  );
}
