"use client";

import React from "react";
import { fabricsData } from "./data/fabrics";
import { useSofaConfiguratorStore } from "./store/useSofaConfiguratorStore";

export function FabricSelector() {
  const selectedFabric = useSofaConfiguratorStore((state) => state.selectedFabric);
  const updateFabric = useSofaConfiguratorStore((state) => state.updateFabric);

  return (
    <div className="bg-white border-t border-wbk-lightgrey/80 p-3 sm:p-4 shrink-0">
      <div className="flex items-center justify-between gap-2 mb-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-wbk-black">
          Select Fabric
        </h3>
        <p className="text-[11px] text-wbk-brown">
          Applies to all modules
        </p>
      </div>

      <div className="flex flex-row items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {fabricsData.map((fabricDef) => {
          const isSelected = selectedFabric === fabricDef.id;
          return (
            <button
              key={fabricDef.id}
              type="button"
              onClick={() => updateFabric(fabricDef.id)}
              className="group flex flex-col items-center gap-1.5 p-1.5 rounded-none border border-transparent hover:border-wbk-lightgrey transition-all cursor-pointer select-none"
              title={fabricDef.name}
            >
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full shadow-inner transition-all ${
                  isSelected
                    ? "ring-2 ring-wbk-black ring-offset-2 scale-105 border border-black/20"
                    : "border border-black/10 group-hover:scale-105 group-hover:ring-1 group-hover:ring-wbk-brown"
                }`}
                style={{ backgroundColor: fabricDef.colorHex }}
              />
              <span className={`text-[10px] tracking-tight truncate max-w-[54px] text-center ${
                isSelected ? "font-semibold text-wbk-black" : "text-wbk-brown"
              }`}>
                {fabricDef.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
