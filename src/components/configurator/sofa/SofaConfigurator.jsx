"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SofaScene } from "./SofaScene";
import { ModuleSelector } from "./ModuleSelector";
import { FabricSelector } from "./FabricSelector";
import { ConfigSummary } from "./ConfigSummary";
import { QuickStartGuideModal } from "./QuickStartGuideModal";
import { useSofaConfiguratorStore } from "./store/useSofaConfiguratorStore";
import { useLocale } from "@/context/LocaleContext";
import {
  TbLayoutSidebarRightCollapse,
  TbLayoutSidebarRightExpand,
  TbPlus,
  TbMaximize,
  TbMinimize,
  TbHelp,
} from "react-icons/tb";

export function SofaConfigurator() {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const loadConfiguration = useSofaConfiguratorStore((state) => state.loadConfiguration);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  useEffect(() => {
    const configParam = searchParams?.get("config");
    if (configParam) {
      loadConfiguration(configParam);
    }
    setIsLoaded(true);

    // Auto-open Quick Start Guide on first visit
    if (typeof window !== "undefined") {
      try {
        const seen = localStorage.getItem("wbk_3d_guide_seen");
        if (!seen) {
          const tTimeout = setTimeout(() => setIsGuideOpen(true), 450);
          return () => clearTimeout(tTimeout);
        }
      } catch (e) {
        // Ignore localStorage access restrictions
      }
    }
  }, [searchParams, loadConfiguration]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="w-full h-full absolute inset-0 overflow-hidden select-none bg-[radial-gradient(circle_at_center,#ffffff_0%,#E4E0DE_100%)]">
      {/* 3D Scene Viewport filling 100% of the screen */}
      <div className="w-full h-full absolute inset-0">
        <SofaScene />
      </div>

      {/* Floating Top Right Utility Buttons (Quick Guide & Fullscreen) */}
      <div className="absolute top-3 right-3 sm:right-6 z-25 flex items-center gap-2 pointer-events-auto">
        <button
          type="button"
          onClick={() => setIsGuideOpen(true)}
          className="h-10 px-3.5 flex items-center gap-1.5 bg-white/90 hover:bg-white text-wbk-black border border-wbk-lightgrey/80 backdrop-blur-md rounded-full shadow-md text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer group"
          title={t("configurator.openGuide", "Open Quick Start Guide")}
        >
          <TbHelp size={17} className="text-wbk-gold group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">{t("configurator.guide", "Guide")}</span>
        </button>

        <button
          type="button"
          onClick={toggleFullscreen}
          className="h-10 px-3.5 flex items-center gap-1.5 bg-white/90 hover:bg-white text-wbk-black border border-wbk-lightgrey/80 backdrop-blur-md rounded-full shadow-md text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
          title={isFullscreen ? t("configurator.exitFullscreen", "Exit Fullscreen") : t("configurator.fullscreen", "Fullscreen")}
        >
          {isFullscreen ? <TbMinimize size={16} /> : <TbMaximize size={16} />}
          <span className="hidden sm:inline">
            {isFullscreen ? t("configurator.exitFullscreen", "Exit Fullscreen") : t("configurator.fullscreen", "Fullscreen")}
          </span>
        </button>
      </div>

      {/* Quick Start Guide Modal with dimmed blurred backdrop */}
      <QuickStartGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Floating Right Palette (Modules & Fabrics) */}
      {isPaletteOpen ? (
        <aside className="absolute right-3 sm:right-6 top-16 bottom-24 sm:bottom-20 w-[300px] sm:w-[350px] max-w-[calc(100vw-24px)] z-20 bg-white/92 backdrop-blur-md border border-wbk-lightgrey/80 shadow-2xl rounded-none flex flex-col overflow-hidden pointer-events-auto transition-all duration-300">
          {/* Header with minimize button */}
          <div className="px-3.5 py-2.5 bg-[#FBF9F8] border-b border-wbk-lightgrey/70 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-wbk-green" />
              <span className="text-xs font-bold uppercase tracking-wider text-wbk-black">
                {t("configurator.customizeSofa", "Customize Sofa")}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsPaletteOpen(false)}
              className="flex items-center gap-1 text-[11px] font-semibold text-wbk-brown hover:text-wbk-black px-2.5 py-1 rounded-full hover:bg-wbk-lightgrey/40 transition-colors cursor-pointer"
              title={t("configurator.minimizePanel", "Minimize panel for full view")}
            >
              <TbLayoutSidebarRightCollapse size={16} />
              <span className="hidden sm:inline">{t("configurator.hide", "Hide")}</span>
            </button>
          </div>

          {/* Module Selector (Scrollable) */}
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            <ModuleSelector />
          </div>

          {/* Fabric Selector */}
          <div className="shrink-0 border-t border-wbk-lightgrey/70 bg-white/95">
            <FabricSelector />
          </div>
        </aside>
      ) : (
        /* Minimized Floating Palette Toggle Button */
        <div className="absolute right-3 sm:right-6 top-16 z-20 pointer-events-auto">
          <button
            type="button"
            onClick={() => setIsPaletteOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-wbk-black hover:bg-wbk-green text-white text-xs font-semibold uppercase tracking-wider rounded-full shadow-xl transition-all cursor-pointer group"
          >
            <TbPlus size={16} className="text-wbk-gold group-hover:scale-110 transition-transform" />
            <span>{t("configurator.modulesAndFabrics", "Modules & Fabrics")}</span>
            <TbLayoutSidebarRightExpand size={15} />
          </button>
        </div>
      )}

      {/* Floating Bottom Summary, Dimensions & Cart Actions */}
      <ConfigSummary />
    </div>
  );
}
