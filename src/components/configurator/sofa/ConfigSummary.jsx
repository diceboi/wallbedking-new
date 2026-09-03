"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useSofaConfiguratorStore } from "./store/useSofaConfiguratorStore";
import { modulesData, getAssetUrl } from "./data/modules";
import { fabricsData } from "./data/fabrics";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  TbListNumbers,
  TbRulerMeasure,
  TbArrowBackUp,
  TbShoppingCartPlus,
  TbShare,
  TbCopy,
  TbCheck,
  TbChevronUp,
  TbChevronDown,
} from "react-icons/tb";

export function ConfigSummary() {
  const { addItem, openCart } = useCart();

  const selectedModules = useSofaConfiguratorStore(
    (state) => state.selectedModules,
  );
  const selectedFabricId = useSofaConfiguratorStore(
    (state) => state.selectedFabric,
  );
  const totalPrice = useSofaConfiguratorStore((state) => state.totalPrice);
  const exportConfiguration = useSofaConfiguratorStore(
    (state) => state.exportConfiguration,
  );
  const resetConfiguration = useSofaConfiguratorStore(
    (state) => state.resetConfiguration,
  );
  const showDimensions = useSofaConfiguratorStore((state) => state.showDimensions);
  const toggleDimensions = useSofaConfiguratorStore(
    (state) => state.toggleDimensions,
  );

  const [showPopup, setShowPopup] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);

  // Group modules for breakdown summary
  const groupedModules = selectedModules.reduce((acc, mod) => {
    const fabricId = mod.fabricId || selectedFabricId;
    const key = `${mod.moduleId}-${fabricId}`;

    if (!acc[key]) {
      const def = modulesData.find((m) => m.id === mod.moduleId);
      const modFabricDef = fabricsData.find((f) => f.id === fabricId);
      const fabricName = modFabricDef ? modFabricDef.name : "Beige";
      const unitPrice = def ? def.price + (modFabricDef?.priceModifier || 0) : 0;

      acc[key] = {
        key,
        moduleId: mod.moduleId,
        fabricId,
        count: 0,
        def,
        name: def ? def.name : mod.moduleId,
        fabricName,
        price: unitPrice,
        thumbnail: def ? def.thumbnail : null,
      };
    }
    acc[key].count += 1;
    return acc;
  }, {});

  const groupedList = Object.values(groupedModules);

  const handleSave = () => {
    const configData = exportConfiguration();
    if (typeof window !== "undefined") {
      const baseUrl = window.location.origin + window.location.pathname;
      const url = `${baseUrl}?config=${encodeURIComponent(configData)}`;
      setGeneratedUrl(url);
      setShowPopup(true);
      setCopySuccess(false);
    }
  };

  const copyToClipboard = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(generatedUrl).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      });
    }
  };

  const handleAddToCart = () => {
    if (selectedModules.length === 0) {
      alert("Please add at least one sofa module first.");
      return;
    }

    const configData = exportConfiguration();

    // Add each unique configured module group to the WBK cart
    groupedList.forEach((group, index) => {
      const isLast = index === groupedList.length - 1;
      const itemToAdd = {
        id: `sofa-${group.moduleId}-${group.fabricId}-${Date.now()}-${index}`,
        productId: `sofa-${group.moduleId}`,
        title: `${group.name} (${group.fabricName})`,
        image: getAssetUrl(group.thumbnail) || "/sofa-configurator/sofa-800-thumbnail.webp",
        price: group.price,
        options: {
          type: "Modular Sofa Component",
          color: group.fabricName,
          fabric: group.fabricName,
          size: group.def ? `${group.def.dimensions.width}×${group.def.dimensions.depth} cm` : "Modular",
        },
        href: `/configurator?config=${encodeURIComponent(configData)}`,
      };

      // Open drawer on the last item added
      addItem(itemToAdd, group.count, isLast);
    });

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2500);
  };

  return (
    <>
      <div
        ref={containerRef}
        className="absolute bottom-3 left-3 right-3 sm:right-auto sm:left-6 sm:bottom-6 z-20 flex items-end justify-between sm:justify-start gap-2.5 pointer-events-none"
      >
        {/* Dimensions Toggle Button */}
        <button
          type="button"
          className={`pointer-events-auto w-12 h-12 sm:w-13 sm:h-13 flex shrink-0 items-center justify-center rounded-full cursor-pointer transition-all border shadow-lg ${
            showDimensions
              ? "bg-wbk-green text-white border-wbk-green hover:bg-wbk-black hover:border-wbk-black"
              : "bg-white text-wbk-black border-wbk-lightgrey hover:bg-wbk-lightgrey/30"
          }`}
          onClick={toggleDimensions}
          title={showDimensions ? "Hide 3D Dimensions" : "Show 3D Dimensions"}
        >
          <TbRulerMeasure className="w-6 h-6" />
        </button>

        {/* Floating Configuration Card */}
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          className="pointer-events-auto w-full sm:w-[380px] bg-white/95 backdrop-blur-md border border-wbk-lightgrey rounded-none shadow-xl overflow-hidden flex flex-col"
        >
          {/* Collapsible Breakdown Panel */}
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="border-b border-wbk-lightgrey overflow-hidden bg-[#FBF9F8]"
              >
                <div className="p-3.5 max-h-[220px] overflow-y-auto custom-scrollbar flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-wbk-brown uppercase tracking-wider">
                    <span>Configured Modules ({selectedModules.length})</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("Are you sure you want to reset your configuration?")) {
                          resetConfiguration();
                          setIsExpanded(false);
                        }
                      }}
                      className="text-red-500 hover:text-red-700 cursor-pointer flex items-center gap-1"
                    >
                      <TbArrowBackUp size={13} />
                      <span>Reset all</span>
                    </button>
                  </div>

                  {groupedList.length === 0 ? (
                    <p className="text-xs text-wbk-brown py-4 text-center">
                      No modules placed in the scene yet.
                    </p>
                  ) : (
                    groupedList.map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between p-2 bg-white rounded-none border border-wbk-lightgrey/70 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 relative bg-[#F4F2F0] rounded-none shrink-0 overflow-hidden flex items-center justify-center p-0.5">
                            {item.thumbnail && (
                              <Image
                                src={getAssetUrl(item.thumbnail)}
                                alt={item.name}
                                width={36}
                                height={36}
                                className="object-contain"
                                unoptimized
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-wbk-black truncate leading-tight">
                              {item.name}
                            </p>
                            <span className="text-[10px] text-wbk-brown">
                              Fabric: {item.fabricName}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0 pl-2">
                          <span className="text-[11px] text-wbk-brown font-semibold mr-2">
                            ×{item.count}
                          </span>
                          <span className="font-semibold text-wbk-black">
                            £{item.price * item.count}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Bar: Total & Actions */}
          <div className="p-3 sm:p-3.5 flex items-center justify-between gap-2.5">
            {/* Price & Expand button */}
            <div
              className="flex flex-col cursor-pointer select-none group"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <div className="flex items-center gap-1 text-[11px] font-semibold text-wbk-brown uppercase tracking-wider">
                <span>Total ({selectedModules.length})</span>
                {isExpanded ? (
                  <TbChevronDown size={14} className="group-hover:text-wbk-black transition-colors" />
                ) : (
                  <TbChevronUp size={14} className="group-hover:text-wbk-black transition-colors" />
                )}
              </div>
              <span className="text-lg sm:text-xl font-bold text-wbk-black leading-tight">
                £{totalPrice}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Share/Save Button */}
              <button
                type="button"
                onClick={handleSave}
                title="Save & Share Configuration"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#F4F2F0] hover:bg-wbk-lightgrey/80 text-wbk-black transition-colors cursor-pointer"
              >
                <TbShare size={18} />
              </button>

              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={selectedModules.length === 0}
                className={`h-10 px-5 flex items-center gap-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-sm ${
                  selectedModules.length === 0
                    ? "bg-wbk-lightgrey text-wbk-brown cursor-not-allowed"
                    : justAdded
                    ? "bg-wbk-green text-white cursor-pointer"
                    : "bg-wbk-black hover:bg-wbk-green text-white cursor-pointer"
                }`}
              >
                {justAdded ? (
                  <>
                    <TbCheck size={16} />
                    <span>Added!</span>
                  </>
                ) : (
                  <>
                    <TbShoppingCartPlus size={16} />
                    <span className="hidden xs:inline">Add to Cart</span>
                    <span className="xs:hidden">Add</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Share / Save Modal */}
      <AnimatePresence>
        {showPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-wbk-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-none max-w-md w-full p-6 shadow-2xl border border-wbk-lightgrey flex flex-col gap-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-semibold text-wbk-black">
                    Share or Save Configuration
                  </h3>
                  <p className="text-xs text-wbk-brown mt-1">
                    Anyone opening this link will see your exact custom sofa design.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPopup(false)}
                  className="text-wbk-brown hover:text-wbk-black text-lg p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center gap-2 bg-[#F4F2F0] p-2.5 rounded-none border border-wbk-lightgrey/80">
                <input
                  type="text"
                  readOnly
                  value={generatedUrl}
                  className="bg-transparent border-none text-xs text-wbk-black flex-1 outline-none truncate font-mono"
                />
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    copySuccess
                      ? "bg-wbk-green text-white"
                      : "bg-wbk-black hover:bg-wbk-green text-white"
                  }`}
                >
                  {copySuccess ? (
                    <>
                      <TbCheck size={14} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <TbCopy size={14} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
