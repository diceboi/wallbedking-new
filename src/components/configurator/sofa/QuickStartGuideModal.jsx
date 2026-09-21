"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  IconX,
  IconPointer,
  IconHandMove,
  Icon3dCubeSphere,
  IconRotateClockwise,
  IconPalette,
} from "@tabler/icons-react";
import { useLocale } from "@/context/LocaleContext";

export function QuickStartGuideModal({ isOpen, onClose }) {
  const { t } = useLocale();
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [activeTab, setActiveTab] = useState("click"); // 'click' | 'drag'
  const [autoPlay, setAutoPlay] = useState(true);

  // Auto cycle between Click and Drag animations every 4 seconds unless user interacts
  useEffect(() => {
    if (!isOpen || !autoPlay) return;
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev === "click" ? "drag" : "click"));
    }, 3800);
    return () => clearInterval(interval);
  }, [isOpen, autoPlay]);

  const handleClose = () => {
    if (dontShowAgain && typeof window !== "undefined") {
      try {
        localStorage.setItem("wbk_3d_guide_seen", "true");
      } catch (e) {
        // Ignore localStorage error
      }
    }
    onClose();
  };

  const handleTabSelect = (tab) => {
    setAutoPlay(false);
    setActiveTab(tab);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="quick-guide-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={handleClose}
          className="fixed inset-0 z-50 bg-wbk-black/45 backdrop-blur-[3px] flex items-center justify-center p-3 sm:p-6 select-none"
        >
          <motion.div
            key="quick-guide-modal"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white/95 backdrop-blur-md rounded-none border border-wbk-lightgrey/90 border-t-2 border-t-wbk-gold shadow-2xl max-w-lg w-full p-5 sm:p-6 relative font-poppins text-wbk-black overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-wbk-lightgrey/50">
              <div className="flex items-center gap-2">
                <span className="p-1 bg-[#FBF9F8] border border-wbk-lightgrey text-wbk-gold rounded-sm">
                  <Icon3dCubeSphere size={16} />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-widest text-wbk-gold">
                  {t("configurator.guideBadge", "3D Studio Quick Guide")}
                </span>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-7 h-7 rounded-full flex items-center justify-center text-wbk-brown hover:text-wbk-black hover:bg-wbk-lightgrey/40 transition-colors cursor-pointer"
                title={t("configurator.close", "Close")}
              >
                <IconX size={17} />
              </button>
            </div>

            {/* Title */}
            <div className="mt-3 mb-4 text-center sm:text-left">
              <h2 className="font-new-york text-2xl sm:text-[26px] font-medium text-wbk-black tracking-tight leading-tight">
                {t("configurator.guideTitle", "Add Modules in 3D")}
              </h2>
              <p className="text-xs text-wbk-brown mt-0.5">
                {t("configurator.guideSubtitle", "Click any module on the right or drag & drop it directly into the room.")}
              </p>
            </div>

            {/* Tab switchers: Click vs Drag */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <button
                type="button"
                onClick={() => handleTabSelect("click")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "click"
                    ? "bg-wbk-black text-white shadow-xs"
                    : "bg-[#F4F2F0] text-wbk-brown hover:text-wbk-black hover:bg-wbk-lightgrey/60"
                }`}
              >
                <IconPointer size={14} className={activeTab === "click" ? "text-wbk-gold" : ""} />
                <span>{t("configurator.guideTabClick", "1. Click to Add")}</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabSelect("drag")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "drag"
                    ? "bg-wbk-black text-white shadow-xs"
                    : "bg-[#F4F2F0] text-wbk-brown hover:text-wbk-black hover:bg-wbk-lightgrey/60"
                }`}
              >
                <IconHandMove size={14} className={activeTab === "drag" ? "text-wbk-gold" : ""} />
                <span>{t("configurator.guideTabDrag", "2. Drag & Drop")}</span>
              </button>
            </div>

            {/* Interactive Animated Graphic Simulation */}
            <div className="w-full h-44 sm:h-48 bg-[#F5F3F1] border border-wbk-lightgrey/80 relative overflow-hidden rounded-none shadow-inner flex mb-4">
              {/* Left Area: 3D Scene Viewport */}
              <div className="flex-1 h-full relative p-3 flex flex-col justify-between overflow-hidden">
                {/* 3D Grid lines */}
                <div
                  className="absolute inset-0 opacity-25"
                  style={{
                    backgroundImage:
                      "linear-gradient(#D5CECA 1px, transparent 1px), linear-gradient(90deg, #D5CECA 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                  }}
                />

                <span className="relative z-10 text-[10px] font-bold uppercase tracking-wider text-wbk-brown/70">
                  {t("configurator.guideSceneView", "3D Scene View")}
                </span>

                {/* 3D Center Area with Modules */}
                <div className="relative z-10 flex-1 flex items-center justify-center">
                  {/* Base Module (always present) */}
                  <div className="w-16 h-12 bg-white border border-wbk-lightgrey/90 shadow-md flex flex-col items-center justify-center relative rounded-xs">
                    <div className="w-14 h-9 bg-[#7D8A78] rounded-xs shadow-xs" />
                    <span className="text-[8px] font-semibold text-wbk-black mt-0.5">
                      {t("configurator.guideSeat1", "Seat 1")}
                    </span>
                  </div>

                  {/* Animated Incoming Module */}
                  <AnimatePresence mode="wait">
                    {activeTab === "click" ? (
                      <motion.div
                        key="click-module"
                        initial={{ opacity: 0, scale: 0.3, x: 25 }}
                        animate={{
                          opacity: [0, 0, 1, 1, 0],
                          scale: [0.3, 0.3, 1, 1, 0.8],
                          x: [25, 25, 0, 0, 0],
                        }}
                        transition={{
                          duration: 3.2,
                          repeat: Infinity,
                          times: [0, 0.38, 0.52, 0.85, 1],
                          ease: "easeOut",
                        }}
                        className="w-16 h-12 bg-white border-2 border-wbk-gold shadow-md flex flex-col items-center justify-center relative -ml-1 rounded-xs"
                      >
                        <div className="w-14 h-9 bg-[#7D8A78] rounded-xs shadow-xs" />
                        <span className="text-[8px] font-bold text-wbk-black mt-0.5">
                          {t("configurator.guideSeat2", "Seat 2")}
                        </span>
                        {/* Snap badge */}
                        <span className="absolute -top-3.5 px-1.5 py-0.2 text-[8px] font-bold bg-wbk-black text-wbk-gold rounded-full shadow-xs">
                          {t("configurator.guideSnapped", "Snapped!")}
                        </span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="drag-module"
                        initial={{ opacity: 0, x: 80, y: -20, scale: 0.85 }}
                        animate={{
                          opacity: [0, 0.9, 1, 1, 0],
                          x: [80, 80, 0, 0, 0],
                          y: [-20, -20, 0, 0, 0],
                          scale: [0.85, 0.95, 1, 1, 0.8],
                        }}
                        transition={{
                          duration: 3.2,
                          repeat: Infinity,
                          times: [0, 0.25, 0.65, 0.88, 1],
                          ease: "easeInOut",
                        }}
                        className="w-16 h-12 bg-white border-2 border-emerald-500 shadow-lg flex flex-col items-center justify-center relative -ml-1 rounded-xs"
                      >
                        <div className="w-14 h-9 bg-[#7D8A78] rounded-xs shadow-xs" />
                        <span className="text-[8px] font-bold text-wbk-black mt-0.5">
                          {t("configurator.guideDropped", "Dropped")}
                        </span>
                        {/* Drop badge */}
                        <span className="absolute -top-3.5 px-1.5 py-0.2 text-[8px] font-bold bg-emerald-600 text-white rounded-full shadow-xs">
                          {t("configurator.guidePlaced", "Placed")}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Subtitle tag below graphic */}
                <div className="relative z-10 text-[10px] text-wbk-black font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-wbk-gold animate-pulse" />
                  <span>
                    {activeTab === "click"
                      ? t("configurator.guideClickHint", "Click card → auto-snaps into sofa")
                      : t("configurator.guideDragHint", "Drag card → drops into 3D scene")}
                  </span>
                </div>
              </div>

              {/* Right Area: Mock Sidebar */}
              <div className="w-28 sm:w-32 h-full bg-white/95 border-l border-wbk-lightgrey/80 p-2 flex flex-col justify-between shrink-0 relative">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-wbk-brown block mb-1.5">
                    {t("configurator.guideRightSidebar", "Right Sidebar")}
                  </span>

                  <div className="space-y-1.5">
                    {/* Active Target Module Card */}
                    <div className="p-1.5 bg-[#FBF9F8] border border-wbk-lightgrey/90 relative group">
                      <div className="w-full h-7 bg-[#EFECE8] border border-wbk-lightgrey/40 flex items-center justify-center">
                        <div className="w-6 h-4 bg-[#7D8A78] rounded-xs" />
                      </div>
                      <span className="text-[9px] font-semibold text-wbk-black block mt-0.5 truncate">
                        {t("configurator.guideSeatBase", "Seat Base")}
                      </span>

                      {/* Click animation target indicator */}
                      {activeTab === "click" && (
                        <motion.div
                          animate={{
                            scale: [1, 1, 0.9, 1.05, 1],
                            borderColor: ["#E4E0DE", "#E4E0DE", "#C5A059", "#C5A059", "#E4E0DE"],
                          }}
                          transition={{
                            duration: 3.2,
                            repeat: Infinity,
                            times: [0, 0.35, 0.42, 0.55, 1],
                          }}
                          className="absolute inset-0 border-2 pointer-events-none rounded-none"
                        />
                      )}
                    </div>

                    {/* Secondary inactive card */}
                    <div className="p-1.5 bg-[#FBF9F8] border border-wbk-lightgrey/50 opacity-60">
                      <div className="w-full h-5 bg-[#EFECE8] border border-wbk-lightgrey/40" />
                      <span className="text-[8px] text-wbk-brown block mt-0.5 truncate">
                        {t("configurator.guideArmrest", "Armrest")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hand / Cursor Animation */}
                {activeTab === "click" ? (
                  <motion.div
                    animate={{
                      x: [10, 10, 0, 0, 10],
                      y: [20, 0, 0, 0, 20],
                      scale: [1, 1, 0.75, 1, 1],
                      opacity: [0, 1, 1, 1, 0],
                    }}
                    transition={{
                      duration: 3.2,
                      repeat: Infinity,
                      times: [0, 0.25, 0.4, 0.6, 1],
                      ease: "easeInOut",
                    }}
                    className="absolute top-12 left-3 z-30 pointer-events-none"
                  >
                    <div className="p-1 rounded-full bg-wbk-black text-white shadow-md">
                      <IconPointer size={15} className="text-wbk-gold" />
                    </div>
                    {/* Click wave ripple */}
                    <motion.div
                      animate={{
                        scale: [0.5, 2],
                        opacity: [1, 0],
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        repeatDelay: 2.6,
                      }}
                      className="absolute inset-0 border-2 border-wbk-gold rounded-full"
                    />
                  </motion.div>
                ) : (
                  /* Drag hand animation across to 3D scene */
                  <motion.div
                    animate={{
                      x: [0, 0, -110, -110, 0],
                      y: [0, 0, 10, 10, 0],
                      opacity: [0, 1, 1, 0, 0],
                      scale: [0.9, 0.9, 1, 1, 0.9],
                    }}
                    transition={{
                      duration: 3.2,
                      repeat: Infinity,
                      times: [0, 0.2, 0.65, 0.88, 1],
                      ease: "easeInOut",
                    }}
                    className="absolute top-10 left-3 z-30 pointer-events-none"
                  >
                    <div className="p-1.5 rounded-full bg-wbk-black text-white shadow-lg flex items-center gap-1 border border-wbk-gold">
                      <IconHandMove size={14} className="text-wbk-gold" />
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Quick Tips Strip (Rotate & Fabrics) */}
            <div className="p-3 bg-white border border-wbk-lightgrey/70 mb-4 text-[11px] text-wbk-brown space-y-1.5">
              <div className="flex items-center gap-2">
                <IconRotateClockwise size={14} className="text-wbk-black shrink-0" />
                <span>
                  <strong>{t("configurator.guideRotateTitle", "Rotate 3D View:")}</strong>{" "}
                  {t(
                    "configurator.guideRotateDesc",
                    "Left-click and drag anywhere on the scene background to view your sofa from 360°."
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <IconPalette size={14} className="text-wbk-black shrink-0" />
                <span>
                  <strong>{t("configurator.guideFabricsTitle", "Fabrics & Colors:")}</strong>{" "}
                  {t(
                    "configurator.guideFabricsDesc",
                    "Select from luxury fabrics in the bottom right panel anytime."
                  )}
                </span>
              </div>
            </div>

            {/* Footer: Checkbox & Start Designing Button (No star icon) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-wbk-lightgrey/40">
              <label className="flex items-center gap-2 text-xs text-wbk-brown cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="rounded-none border-wbk-lightgrey text-wbk-black focus:ring-wbk-gold cursor-pointer"
                />
                <span>{t("configurator.guideDontShow", "Don't show this guide automatically again")}</span>
              </label>

              <button
                type="button"
                onClick={handleClose}
                className="w-full sm:w-auto px-7 py-2.5 bg-wbk-black hover:bg-wbk-green text-white text-xs font-semibold uppercase tracking-[0.14em] transition-colors rounded-full shadow-md flex items-center justify-center cursor-pointer shrink-0"
              >
                <span>{t("configurator.guideStart", "Start Designing")}</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
