"use client";

import React, { useState, Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  IconSofa,
  IconBed,
  IconArchive,
  IconArrowUpRight,
  Icon3dCubeSphere,
  IconSparkles,
} from "@tabler/icons-react";

// Dynamically import SofaConfigurator with SSR disabled for Three.js / WebGL compatibility
const SofaConfigurator = dynamic(
  () =>
    import("@/components/configurator/sofa/SofaConfigurator").then(
      (mod) => mod.SofaConfigurator
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-[#F7F6F5]">
        <div className="w-10 h-10 rounded-full border-3 border-wbk-lightgrey border-t-wbk-black animate-spin" />
        <p className="text-sm font-medium text-wbk-brown">
          Loading 3D Configurator Studio...
        </p>
      </div>
    ),
  }
);

export function ConfiguratorHub() {
  const [activeCategory, setActiveCategory] = useState("sofas");

  const categories = [
    {
      id: "sofas",
      name: "Modular Sofas",
      badge: "3D",
      icon: IconSofa,
      available: true,
    },
    {
      id: "beds",
      name: "Murphy Beds",
      badge: "Soon",
      icon: IconBed,
      available: false,
    },
    {
      id: "cabinets",
      name: "Cabinets",
      badge: "Soon",
      icon: IconArchive,
      available: false,
    },
  ];

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#F7F6F5]">
      {/* Floating Top Category Switcher */}
      <header className="absolute top-3 left-3 sm:left-6 z-25 flex items-center gap-2 pointer-events-none">
        {/* Category Selector Container */}
        <div className="flex items-center gap-1 p-1 bg-white/90 backdrop-blur-md rounded-none border border-wbk-lightgrey/80 shadow-md pointer-events-auto overflow-x-auto scrollbar-none">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 border-r border-wbk-lightgrey/70 text-xs font-semibold uppercase tracking-wider text-wbk-black">
            <Icon3dCubeSphere size={16} className="text-wbk-gold" />
            <span>3D Studio</span>
          </div>

          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-wbk-black text-white shadow-xs"
                    : "text-wbk-brown hover:text-wbk-black hover:bg-wbk-lightgrey/30"
                }`}
              >
                <Icon size={15} />
                <span>{cat.name}</span>
                {cat.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                      isActive
                        ? "bg-wbk-green text-white"
                        : "bg-wbk-lightgrey text-wbk-brown"
                    }`}
                  >
                    {cat.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Studio View */}
      {activeCategory === "sofas" && (
        <Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center bg-[#F7F6F5]">
              <div className="w-10 h-10 rounded-full border-3 border-wbk-lightgrey border-t-wbk-black animate-spin" />
            </div>
          }
        >
          <SofaConfigurator />
        </Suspense>
      )}

      {activeCategory === "beds" && (
        <div className="w-full h-full flex items-center justify-center p-4 sm:p-8 bg-[radial-gradient(circle_at_center,#ffffff_0%,#E4E0DE_100%)]">
          <div className="w-full max-w-lg bg-white/95 backdrop-blur-md rounded-none border border-wbk-lightgrey p-8 sm:p-10 text-center shadow-2xl flex flex-col items-center">
            <div className="w-16 h-16 rounded-none bg-[#FBF9F8] border border-wbk-lightgrey flex items-center justify-center mb-4 text-wbk-gold shadow-sm">
              <IconBed size={32} />
            </div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-wbk-brown mb-1">
              Coming Soon
            </span>
            <h2 className="text-2xl sm:text-3xl font-new-york text-wbk-black mb-2">
              Murphy Bed 3D Studio
            </h2>
            <p className="text-xs sm:text-sm text-wbk-brown max-w-md mb-6 leading-relaxed">
              We are currently engineering the interactive 3D murphy bed customization experience with fold mechanisms, custom finishes, and modular cabinetry.
            </p>
            <Link
              href="/products/beds"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-wbk-black hover:bg-wbk-green text-white text-xs font-semibold uppercase tracking-[0.14em] transition-colors rounded-full shadow-sm"
            >
              <span>Explore Current Bed Collection</span>
              <IconArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      )}

      {activeCategory === "cabinets" && (
        <div className="w-full h-full flex items-center justify-center p-4 sm:p-8 bg-[radial-gradient(circle_at_center,#ffffff_0%,#E4E0DE_100%)]">
          <div className="w-full max-w-lg bg-white/95 backdrop-blur-md rounded-none border border-wbk-lightgrey p-8 sm:p-10 text-center shadow-2xl flex flex-col items-center">
            <div className="w-16 h-16 rounded-none bg-[#FBF9F8] border border-wbk-lightgrey flex items-center justify-center mb-4 text-wbk-brown shadow-sm">
              <IconSparkles size={32} className="text-wbk-gold" />
            </div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-wbk-brown mb-1">
              Coming Soon
            </span>
            <h2 className="text-2xl sm:text-3xl font-new-york text-wbk-black mb-2">
              Modular Cabinets & Storage
            </h2>
            <p className="text-xs sm:text-sm text-wbk-brown max-w-md mb-6 leading-relaxed">
              We are modeling side storage towers, overhead bookshelves, and coordinated wardrobes for the 3D studio.
            </p>
            <Link
              href="/products/cabinets"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-wbk-black hover:bg-wbk-green text-white text-xs font-semibold uppercase tracking-[0.14em] transition-colors rounded-full shadow-sm"
            >
              <span>Explore Current Cabinet Collection</span>
              <IconArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
