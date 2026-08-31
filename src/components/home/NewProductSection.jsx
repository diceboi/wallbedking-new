"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { IconChevronDown } from "@tabler/icons-react";

export function NewProductSection() {
  const containerRef = useRef(null);
  const dotRef = useRef(null);
  const lineAttachRef = useRef(null);

  const [lineCoords, setLineCoords] = useState({ x1: 0, y1: 0, x2: 0, y2: 0 });
  const [selectedSize, setSelectedSize] = useState("80x100 cm");
  const [sizeOpen, setSizeOpen] = useState(false);

  // Dynamic calculation of connection line endpoints between floating dot and floating card
  useEffect(() => {
    let active = true;

    const updateLine = () => {
      if (!active) return;

      if (containerRef.current && dotRef.current && lineAttachRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const dotRect = dotRef.current.getBoundingClientRect();
        const attRect = lineAttachRef.current.getBoundingClientRect();

        setLineCoords({
          x1: dotRect.left + dotRect.width / 2 - containerRect.left,
          y1: dotRect.top + dotRect.height / 2 - containerRect.top,
          x2: attRect.left + attRect.width / 2 - containerRect.left,
          y2: attRect.top + attRect.height / 2 - containerRect.top,
        });
      }

      requestAnimationFrame(updateLine);
    };

    updateLine();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="relative w-full py-32 bg-white overflow-hidden flex flex-col items-center justify-between">
      {/* Warm radial spotlight background to match Blender cycles lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(210,170,124,0.18)_20%,transparent_80%)] pointer-events-none z-0" />

      {/* ── Background Infinite Loop Marquee (Text Layer) ── */}
      <div className="absolute inset-x-0 top-28 z-0 pointer-events-none overflow-hidden h-[200px] flex items-center">
        <div className="absolute w-[200%] flex whitespace-nowrap">
          <motion.div
            animate={{ x: ["-50%", "0%"] }}
            transition={{ ease: "linear", duration: 25, repeat: Infinity }}
            className="flex whitespace-nowrap text-[5vw] uppercase tracking-[0em] text-wbk-black select-none"
          >
            <span className="mx-16 font-poppins font-black">NEW PRODUCT</span>
            <span className="mx-16 font-new-york">Morphy™ Sofa</span>
            <span className="mx-16 font-poppins font-black">NEW PRODUCT</span>
            <span className="mx-16 font-new-york">Morphy™ Sofa</span>
          </motion.div>
          <motion.div
            animate={{ x: ["-50%", "0%"] }}
            transition={{ ease: "linear", duration: 25, repeat: Infinity }}
            className="flex whitespace-nowrap text-[5vw] uppercase tracking-[0em] text-[#E4E0DE]/35 select-none"
          >
            <span className="mx-16 font-poppins font-black">NEW PRODUCT</span>
            <span className="mx-16 font-new-york">Morphy™ Sofa</span>
            <span className="mx-16 font-poppins font-black">NEW PRODUCT</span>
            <span className="mx-16 font-new-york">Morphy™ Sofa</span>
          </motion.div>
        </div>
      </div>

      {/* ── Main Composition Container ── */}
      <div
        ref={containerRef}
        className="relative w-full max-w-7xl h-[550px] md:h-[620px] flex items-center justify-center px-4"
      >
        {/* Dynamic SVG Line Overlay with shadow filter */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-30">
          <defs>
            <filter
              id="line-shadow"
              x="-10%"
              y="-10%"
              width="120%"
              height="120%"
            >
              <feDropShadow
                dx="0"
                dy="1"
                stdDeviation="1.5"
                floodOpacity="0.3"
                floodColor="black"
              />
            </filter>
          </defs>
          {lineCoords.x1 !== 0 && (
            <line
              x1={lineCoords.x1}
              y1={lineCoords.y1}
              x2={lineCoords.x2}
              y2={lineCoords.y2}
              stroke="white"
              strokeWidth="2"
              strokeDasharray="4 3"
              filter=""
            />
          )}
        </svg>

        {/* 1. Left Sofa (Background, Blurred, Floating) */}
        <motion.div
          animate={{ y: [15, -15, 15] }}
          transition={{ duration: 7.5, ease: "easeInOut", repeat: Infinity }}
          className="absolute left-[-40%] md:left-[-40%] w-[400px] md:w-[500px] aspect-[4/3] pointer-events-none blur-[4px] opacity-60 z-10 rotate-12"
        >
          <img
            src="/sofa1.webp"
            alt="Morphy Sofa Back Left"
            className="w-full h-full object-contain"
          />
        </motion.div>

        {/* 2. Right Sofa (Background, Blurred, Floating) */}
        <motion.div
          animate={{ y: [-15, 15, -15] }}
          transition={{ duration: 6.5, ease: "easeInOut", repeat: Infinity }}
          className="absolute right-[-40%] md:right-[-40%] w-[400px] md:w-[500px] aspect-[4/3] pointer-events-none blur-[3px] opacity-60 z-10 rotate-12"
        >
          <img
            src="/sofa2.webp"
            alt="Morphy Sofa Back Right"
            className="w-full h-full object-contain"
          />
        </motion.div>

        {/* 3. Center Sofa (Foreground, Sharp, Floating) */}
        <div className="relative w-[340px] sm:w-[480px] md:w-[650px] aspect-[4/3] z-20">
          <motion.div
            animate={{ y: [8, -8, 8] }}
            transition={{ duration: 5.5, ease: "easeInOut", repeat: Infinity }}
            className="relative w-full h-full"
          >
            <img
              src="/sofa3.webp"
              alt="Morphy Sofa Main"
              className="w-full h-full object-contain drop-shadow-2xl"
            />

            {/* Hotspot anchor point (moves with the sofa) */}
            <div
              ref={dotRef}
              className="absolute right-[33%] bottom-[43%] h-5 w-5 rounded-full bg-white flex items-center justify-center cursor-pointer group"
            >
              <span className="absolute h-full w-full rounded-full bg-white opacity-75 animate-ping" />
            </div>
          </motion.div>

          {/* ── Left Interactive Configurator Panel ── */}
          <motion.div
            animate={{ y: [-6, 6, -6] }}
            transition={{ duration: 4.8, ease: "easeInOut", repeat: Infinity }}
            className="absolute left-[-20px] md:left-[-60px] bottom-[15%] z-30 w-[180px] md:w-[220px] bg-wbk-lightgrey/80 backdrop-blur-md p-2 border border-wbk-lightgrey/55 shadow-xl space-y-2 pointer-events-auto"
          >
            {/* Size Dropdown */}
            <div className="relative">
              <button
                onClick={() => setSizeOpen(!sizeOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs md:text-sm font-medium border border-wbk-lightgrey bg-wbk-white/45 text-wbk-black hover:bg-wbk-lightgrey/20 transition-all"
              >
                <span>{selectedSize}</span>
                <IconChevronDown size={14} />
              </button>

              {sizeOpen && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-wbk-lightgrey shadow-lg z-50 text-xs overflow-hidden">
                  {["80x100 cm", "80x120 cm", "80x140 cm"].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => {
                        setSelectedSize(sz);
                        setSizeOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-wbk-lightgrey/20 transition-colors"
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Color Select */}
            <button className="w-full flex items-center justify-between px-3 py-2 text-xs md:text-sm font-medium border border-wbk-lightgrey bg-wbk-white/45 text-wbk-black hover:bg-wbk-lightgrey/20 transition-all">
              <span>Select color</span>
              <IconChevronDown size={14} />
            </button>

            {/* Orientation Select */}
            <button className="w-full flex items-center justify-between px-3 py-2 text-xs md:text-sm font-medium border border-wbk-lightgrey bg-wbk-white/45 text-wbk-black hover:bg-wbk-lightgrey/20 transition-all">
              <span>Select orientation</span>
              <IconChevronDown size={14} />
            </button>
          </motion.div>

          {/* ── Right Interactive Material Info Card ── */}
          <motion.div
            animate={{ y: [6, -6, 6] }}
            transition={{ duration: 5.2, ease: "easeInOut", repeat: Infinity }}
            className="absolute right-[-40px] md:right-[-90px] bottom-[28%] z-30 w-[200px] md:w-[260px] bg-wbk-lightgrey/80 backdrop-blur-md p-4 md:p-5 border border-wbk-lightgrey/55 shadow-xl flex items-start gap-3 pointer-events-auto"
          >
            {/* Connecting line target node */}
            <div
              ref={lineAttachRef}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-transparent"
            />

            <div className="space-y-2">
              <h4 className="text-xs md:text-sm font-medium text-wbk-black">
                Cloth texture in{" "}
                <span className="font-semibold">multiple colors</span>
              </h4>
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className="text-[10px] text-wbk-black">Colors:</span>
                <div className="flex items-center">
                  {["#A5988E", "#D2AA7C", "#E4E0DE", "#090A0A"].map(
                    (color, idx) => (
                      <span
                        key={idx}
                        className="inline-block h-3.5 w-3.5 rounded-full border border-wbk-lightgrey/80 -mr-1"
                        style={{ backgroundColor: color }}
                      />
                    ),
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Action Buttons Container ── */}
      <div className="relative z-30 flex items-center gap-4 mt-8 md:mt-12">
        <Button
          as="link"
          href="/products/beds/integrated-vertical-wall-bed"
          variant="primary"
          size="lg"
          className="bg-wbk-green hover:bg-wbk-black border-wbk-green hover:border-wbk-black"
        >
          Start configurator
        </Button>
        <Button
          as="link"
          href="/products/beds"
          variant="secondary"
          size="lg"
          className="bg-white/80 backdrop-blur-sm border-wbk-brown/30"
        >
          Explore
        </Button>
      </div>
    </section>
  );
}
