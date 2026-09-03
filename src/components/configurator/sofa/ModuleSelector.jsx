"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { modulesData, getAssetUrl } from "./data/modules";
import { useSofaConfiguratorStore } from "./store/useSofaConfiguratorStore";
import { TbChevronLeft, TbChevronRight } from "react-icons/tb";

export function ModuleSelector() {
  const addModule = useSofaConfiguratorStore((state) => state.addModule);
  const setPreviewModule = useSofaConfiguratorStore(
    (state) => state.setPreviewModule,
  );

  const sliderRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 5);
    }
  };

  useEffect(() => {
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, []);

  const scrollByAmount = (amount) => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  const handlePointerDown = (e, moduleDef) => {
    if (e.button !== 0) return;

    const targetElement = e.currentTarget;
    targetElement.setPointerCapture(e.pointerId);

    let isDragging = false;
    const startX = e.clientX;
    const startY = e.clientY;
    let ghost = null;

    const onPointerMove = (moveEvent) => {
      if (!isDragging) {
        const dx = Math.abs(moveEvent.clientX - startX);
        const dy = Math.abs(moveEvent.clientY - startY);

        if (dx > 10 || dy > 10) {
          if (window.innerWidth < 1280 && dx > dy) {
            targetElement.releasePointerCapture(moveEvent.pointerId);
            targetElement.removeEventListener("pointermove", onPointerMove);
            targetElement.removeEventListener("pointerup", onPointerUp);
            targetElement.removeEventListener("pointercancel", onPointerCancel);
            return;
          } else {
            isDragging = true;
            document.body.classList.add("dragging-module");

            let initialRot = [0, 0, 0];
            if (moduleDef.id === 'seat-base-600' || moduleDef.id === 'seat-base-800') {
              initialRot = [0, Math.PI / 2, 0];
            }

            setPreviewModule({
              moduleId: moduleDef.id,
              position: [0, -100, 0],
              rotation: initialRot,
            });

            const imgElement = targetElement.querySelector("img");
            if (imgElement) {
              ghost = document.createElement("img");
              ghost.src = imgElement.src;
              ghost.style.position = "fixed";
              ghost.style.pointerEvents = "none";
              ghost.style.zIndex = "9999";
              ghost.style.width = imgElement.clientWidth + "px";
              ghost.style.height = imgElement.clientHeight + "px";
              ghost.style.opacity = "0.8";
              document.body.appendChild(ghost);
            }
          }
        }
      }

      if (isDragging) {
        if (ghost) {
          ghost.style.left = moveEvent.clientX - ghost.clientWidth / 2 + "px";
          ghost.style.top = moveEvent.clientY - ghost.clientHeight / 2 + "px";
        }

        const dragEvent = new CustomEvent("customDragOver", {
          detail: {
            clientX: moveEvent.clientX,
            clientY: moveEvent.clientY,
          },
        });
        window.dispatchEvent(dragEvent);
      }
    };

    const cleanupDrag = () => {
      document.body.classList.remove("dragging-module");
      if (ghost && ghost.parentNode) {
        ghost.parentNode.removeChild(ghost);
      }
      targetElement.removeEventListener("pointermove", onPointerMove);
      targetElement.removeEventListener("pointerup", onPointerUp);
      targetElement.removeEventListener("pointercancel", onPointerCancel);
    };

    const onPointerUp = (upEvent) => {
      cleanupDrag();

      if (isDragging) {
        const dropEvent = new CustomEvent("customDrop", {
          detail: {
            moduleId: moduleDef.id,
            clientX: upEvent.clientX,
            clientY: upEvent.clientY,
          },
        });
        window.dispatchEvent(dropEvent);
      } else {
        addModule(moduleDef.id);
      }
    };

    const onPointerCancel = () => {
      cleanupDrag();
      setPreviewModule(null);
    };

    targetElement.addEventListener("pointermove", onPointerMove);
    targetElement.addEventListener("pointerup", onPointerUp);
    targetElement.addEventListener("pointercancel", onPointerCancel);
  };

  return (
    <div className="bg-white p-3 sm:p-4 flex-1 flex flex-col justify-start">
      <div className="flex items-center justify-between pb-2 mb-1.5 border-b border-wbk-lightgrey/50">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-wbk-black">
            Add Modules
          </h3>
          <p className="text-[11px] text-wbk-brown">
            Click or drag & drop into 3D scene
          </p>
        </div>
        <span className="text-[10px] font-semibold bg-[#F4F2F0] text-wbk-brown px-2 py-0.5 rounded-full border border-wbk-lightgrey/60">
          {modulesData.length} Pieces
        </span>
      </div>

      <div
        ref={sliderRef}
        className="flex flex-col gap-2 overflow-y-auto custom-scrollbar py-1"
      >
        {modulesData.map((moduleDef) => (
          <div
            key={moduleDef.id}
            onPointerDown={(e) => handlePointerDown(e, moduleDef)}
            className="group w-full bg-[#FBF9F8] hover:bg-white border border-wbk-lightgrey/70 hover:border-wbk-green p-2 rounded-none cursor-grab active:cursor-grabbing transition-all duration-150 shadow-2xs hover:shadow-sm select-none flex flex-row items-center gap-2.5"
          >
            {/* Thumbnail */}
            <div className="relative w-12 h-12 shrink-0 flex items-center justify-center bg-white rounded-none border border-wbk-lightgrey/40 overflow-hidden">
              <Image
                src={getAssetUrl(moduleDef.thumbnail)}
                alt={moduleDef.name}
                width={48}
                height={48}
                className="object-contain p-0.5 pointer-events-none transition-transform group-hover:scale-105"
                unoptimized
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between gap-1">
                <p className="text-xs font-semibold text-wbk-black truncate leading-tight">
                  {moduleDef.name}
                </p>
                <span className="text-xs font-bold text-wbk-black shrink-0">
                  £{moduleDef.price}
                </span>
              </div>
              <p className="text-[10px] text-wbk-brown mt-0.5">
                {moduleDef.dimensions.width} × {moduleDef.dimensions.depth} cm
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
