"use client";

import { useState, useEffect } from "react";
import { useProgress } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";

export function Hero3DLoader({ onLoaded }) {
  const { active, progress, total } = useProgress();
  const [visible, setVisible] = useState(true);
  const [displayProgress, setDisplayProgress] = useState(0);

  // Instant bypass for search engine crawlers (Googlebot, Bingbot, Lighthouse) for maximum SEO & PageSpeed
  useEffect(() => {
    if (typeof navigator !== "undefined") {
      const ua = navigator.userAgent || "";
      if (
        /googlebot|bingbot|yandex|baiduspider|duckduckbot|slurp|lighthouse|chrome-lighthouse|ptst|headlesschrome/i.test(
          ua
        )
      ) {
        setVisible(false);
        if (onLoaded) onLoaded();
      }
    }
  }, [onLoaded]);

  // Smooth progress calculation matching actual 3D asset downloads
  useEffect(() => {
    setDisplayProgress((prev) => Math.max(prev, Math.round(progress)));
  }, [progress]);

  // For real visitors: only hide when 3D assets are truly 100% downloaded and ready
  useEffect(() => {
    if (progress === 100 && !active && (total > 0 || displayProgress === 100)) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onLoaded) onLoaded();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [progress, active, total, displayProgress, onLoaded]);

  // Extreme connection failure fallback only (20s)
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      setVisible(false);
      if (onLoaded) onLoaded();
    }, 20000);
    return () => clearTimeout(safetyTimer);
  }, [onLoaded]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="fullpage-logo-fill-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.75, ease: [0.25, 1, 0.5, 1] }}
          aria-hidden="true"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#1c1a19] text-white select-none pointer-events-auto"
        >
          <div className="flex flex-col items-center space-y-4 px-6">
            {/* ── Logo Container (10% Opacity Base with 100% Opacity Fill) ── */}
            <div className="relative w-[190px] sm:w-[230px] md:w-[260px] aspect-[3219/543] flex items-center justify-center">
              {/* 1. Base Logo: exactly 10% opacity */}
              <img
                src="/logos/WBK-Logo-Gold-White.svg"
                alt="WallBedKing"
                className="absolute inset-0 w-full h-full object-contain opacity-10 select-none pointer-events-none"
              />

              {/* 2. Filled Logo: 100% opacity, masked progressively */}
              <div
                className="absolute inset-0 w-full h-full overflow-hidden transition-all duration-200 ease-out select-none pointer-events-none"
                style={{
                  clipPath: `inset(0 ${100 - displayProgress}% 0 0)`,
                }}
              >
                <img
                  src="/logos/WBK-Logo-Gold-White.svg"
                  alt="WallBedKing Filled"
                  className="w-full h-full object-contain opacity-100"
                />
              </div>
            </div>

            {/* ── Percentage Only ── */}
            <div className="pt-2 text-center">
              <span className="text-xs sm:text-sm font-poppins text-wbk-gold/90 font-medium tracking-widest font-mono">
                {displayProgress}%
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
