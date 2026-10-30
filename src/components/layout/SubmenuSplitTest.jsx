"use client";

import { useContext, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  IconArrowRight,
  IconCheck,
  IconChevronRight,
  IconBed,
} from "@tabler/icons-react";
import { MenuContext } from "@/context/MenuContext";
import { useLocale } from "@/context/LocaleContext";
import { SUBMENU_DATA } from "@/data/navigation";

// Extended gallery preview angles for Morphy & Clearance flagship beds
const BED_EXTRA_GALLERY = {
  "/products/beds/classic-morphy-bed": [
    {
      label: "Vertical Closed",
      src: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/wallbeds/1K/160x200-CV-MORPHY_5.webp",
    },
    {
      label: "With Mattress",
      src: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/wallbeds/1K/160x200-CV-MORPHY_1-m.webp",
    },
    {
      label: "Vertical Open",
      src: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/wallbeds/1K/160x200-CV-MORPHY_1.webp",
    },
    {
      label: "Horizontal Format",
      src: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/wallbeds/1K/160x200-CH-MORPHY_5.webp",
    },
  ],
  "/products/beds/studio-morphy-bed": [
    {
      label: "Vertical Closed",
      src: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/wallbeds/1K/160x200-SV-MORPHY_5.webp",
    },
    {
      label: "With Mattress",
      src: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/wallbeds/1K/160x200-SV-MORPHY_1-m.webp",
    },
    {
      label: "Vertical Open",
      src: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/wallbeds/1K/160x200-SV-MORPHY_1.webp",
    },
    {
      label: "Horizontal Format",
      src: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/wallbeds/1K/160x200-SH-MORPHY_5.webp",
    },
  ],
  "/products/beds/integrated-morphy-bed": [
    {
      label: "Vertical Closed",
      src: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/wallbeds/1K/160x200-IV-MORPHY_5.webp",
    },
    {
      label: "With Mattress",
      src: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/wallbeds/1K/160x200-IV-MORPHY_1-m.webp",
    },
    {
      label: "Cabinet Integrated",
      src: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/wallbeds/1K/160x200-IV-MORPHY_2.webp",
    },
    {
      label: "Horizontal Format",
      src: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/wallbeds/1K/160x200-IH-MORPHY_5.webp",
    },
  ],
  "/products/beds/classic-traditional-bed": [
    {
      label: "Vertical Closed",
      src: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/wallbeds/1K/160x200-CV-TRADITIONAL_1.webp",
    },
    {
      label: "Vertical Open",
      src: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/wallbeds/1K/160x200-CV-TRADITIONAL_2.webp",
    },
    {
      label: "Horizontal Format",
      src: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/wallbeds/1K/160x200-CH-TRADITIONAL_1.webp",
    },
  ],
  "/products/beds/studio-traditional-bed": [
    {
      label: "Vertical Closed",
      src: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/wallbeds/1K/150x200-SV-TRADITIONAL_1.webp",
    },
    {
      label: "Vertical Open",
      src: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/wallbeds/1K/150x200-SV-TRADITIONAL_2.webp",
    },
    {
      label: "Horizontal Format",
      src: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/wallbeds/1K/150x200-SH-TRADITIONAL_1.webp",
    },
  ],
};

// Model-specific feature bullet highlights
const PRODUCT_SPECIFIC_FEATURES = {
  // Morphy Beds
  "/products/beds/classic-morphy-bed": [
    "Direct wall-mount mechanism with high-load bracket",
    "Reinforced carbon steel frame with lifetime warranty",
    "German precision counterbalanced gas pistons",
    "Available in 19 sizes (Vertical & Horizontal)",
  ],
  "/products/beds/studio-morphy-bed": [
    "Integrated front decorative panel with clean finish",
    "Whisper-quiet German gas piston assist",
    "Reinforced steel frame with auto-fold legs",
    "Available in 19 sizes (Vertical & Horizontal)",
  ],
  "/products/beds/integrated-morphy-bed": [
    "Engineered for custom cabinetry & fitted wardrobes",
    "Compact hidden-mount frame profile",
    "Counterbalanced German gas lift struts",
    "Available in 19 sizes (Vertical & Horizontal)",
  ],
  // Clearance Beds
  "/products/beds/classic-traditional-bed": [
    "Classic open-frame steel foldaway bed mechanism",
    "Proven heavy-duty counterbalanced dual spring system",
    "Direct clearance pricing with factory dispatch",
    "11 versatile sizes with mattress-retaining strap",
  ],
  "/products/beds/studio-traditional-bed": [
    "Traditional counterbalanced mechanism with front face",
    "Smooth spring-assisted opening & closing",
    "Built-in mattress strap & auto-folding legs",
    "Clearance pricing across all sizes",
  ],
  // Cabinets
  "/products/cabinets/vertical-wall-bed-cabinet": [
    "Custom fitted enclosure for Vertical wall beds",
    "Solid 18mm melamine board build with dust seal",
    "Choice of White, Pine, Oak, or Beech finishes",
  ],
  "/products/cabinets/horizontal-wall-bed-cabinet": [
    "Low-profile wide enclosure for Horizontal wall beds",
    "Solid 18mm melamine construction with dust seal",
    "Available in White, Pine, Oak, or Beech finishes",
  ],
  "/products/cabinets/overhead-storage-extension-cabinet": [
    "Top bridge extension storage unit",
    "Maximizes ceiling height above wall bed cabinet",
    "Pre-drilled for secure modular top mounting",
  ],
  "/products/cabinets/side-storage-wardrobe-cabinet": [
    "Modular adjacent storage bookcase or wardrobe",
    "Options for internal shelving or clothes hanger rail",
    "Pre-drilled for seamless alignment to wall bed",
  ],
  // Mattresses
  "/products/mattresses/comfort-mattress": [
    "8\" (20cm) profile for seamless wall bed folding",
    "High-density foam base for durable spinal support",
    "Hypoallergenic breathable soft-touch cover",
  ],
  "/products/mattresses/luxury-mattress": [
    "Orthopaedic pocket spring & memory foam hybrid",
    "Engineered specifically for upright vertical storage",
    "Edge-to-edge support with quilted luxury cover",
  ],
  "/products/mattresses/supreme-mattress": [
    "Hotel-grade multi-layer pocket spring system",
    "Deep high-resilience foam comfort & pressure relief",
    "Temperature-regulating luxury breathable cover",
  ],
  // Sofas
  "/products/sofas/bed-front-modular-sofa": [
    "Engineered to sit directly in front of wall bed",
    "Wall bed lowers seamlessly above sofa frame",
    "High-resilience foam & stain-resistant fabric",
  ],
  "/products/sofas/free-standing-modular-sofa": [
    "Standalone modular seating for flexible layouts",
    "Premium ergonomic cushioning & durable fabric",
    "Easy to rearrange and extend with extra modules",
  ],
  // Tables
  "/products/tables?type=Dining+Table": [
    "Expanding multi-leaf mechanism for compact spaces",
    "Seats up to 10 guests when fully extended",
    "Heavy-duty solid board with steel slide rails",
  ],
  "/products/tables?type=Coffee+Table": [
    "Smooth gas-lift height adjustment from coffee to dining",
    "Fold-out expanding tabletop for dual functionality",
    "Concealed wheels for effortless room repositioning",
  ],
  "/products/tables?type=Desk": [
    "Space-saving wall or floor foldaway workstation",
    "Integrated interior storage shelves & cable routing",
    "Sturdy lockable fold-down work surface",
  ],
  "/products/tables?type=Cube+stool": [
    "5 individual padded seats nested in 1 compact cube",
    "Heavy-duty steel frame with smooth-rolling casters",
    "Waterproof stain-resistant faux leather upholstery",
  ],
};

function getProductFeatures(item) {
  if (!item) return [];
  if (PRODUCT_SPECIFIC_FEATURES[item.href]) {
    return PRODUCT_SPECIFIC_FEATURES[item.href];
  }
  const cleanHref = (item.href || "").split("?")[0];
  if (PRODUCT_SPECIFIC_FEATURES[cleanHref]) {
    return PRODUCT_SPECIFIC_FEATURES[cleanHref];
  }
  if (item.href?.includes("cabinets")) {
    return [
      "Custom enclosure engineered for WallBedKing beds",
      "Solid modular construction with dust protection",
      "Multiple durable woodgrain finishes",
    ];
  }
  if (item.href?.includes("mattresses")) {
    return [
      "Engineered specifically for upright vertical storage",
      "Orthopaedic pocket spring & memory foam balance",
      "Breathable hypoallergenic luxury cover",
    ];
  }
  if (item.href?.includes("tables")) {
    return [
      "Multi-functional transforming mechanisms",
      "Compact space-saving fold-away engineering",
      "Heavy-duty solid board & metal hardware",
    ];
  }
  return [
    "Premium quality space-saving furniture",
    "Engineered for everyday durability & ease of use",
  ];
}

export function SubmenuSplitTest() {
  const { subMenu, setSubMenu, cancelCloseSubmenu } = useContext(MenuContext);
  const { localizedHref } = useLocale();

  const [activeSectionId, setActiveSectionId] = useState("morphy");
  const [hoveredIndex, setHoveredIndex] = useState(0);
  const [selectedAngleIndex, setSelectedAngleIndex] = useState(0);

  const activeData = useMemo(() => {
    if (!subMenu) return null;
    return SUBMENU_DATA[subMenu] || null;
  }, [subMenu]);

  const hasSections = Boolean(activeData?.sections && activeData.sections.length > 0);

  // Active items list: either section-filtered (e.g. for "beds") or category items
  const currentItems = useMemo(() => {
    if (!activeData) return [];
    if (hasSections) {
      const sec = activeData.sections.find((s) => s.id === activeSectionId) || activeData.sections[0];
      return sec?.items || [];
    }
    return activeData.items || [];
  }, [activeData, hasSections, activeSectionId]);

  const currentParent = useMemo(() => {
    if (!activeData) return null;
    if (hasSections) {
      const sec = activeData.sections.find((s) => s.id === activeSectionId) || activeData.sections[0];
      return sec?.parent || activeData.parent;
    }
    return activeData.parent;
  }, [activeData, hasSections, activeSectionId]);

  // Reset hovered item when category changes
  useEffect(() => {
    setHoveredIndex(0);
    setSelectedAngleIndex(0);
  }, [subMenu, activeSectionId]);

  // Active item for the right-side showcase
  const activeItem = currentItems[hoveredIndex] || currentItems[0] || null;

  // Active gallery thumbnails for the right-side preview
  const activeGallery = useMemo(() => {
    if (!activeItem) return [];
    if (BED_EXTRA_GALLERY[activeItem.href]) {
      return BED_EXTRA_GALLERY[activeItem.href];
    }
    const list = [];
    if (activeItem.image) {
      list.push({ label: "Primary View", src: activeItem.image });
    }
    if (activeItem.hoverImage && activeItem.hoverImage !== activeItem.image) {
      list.push({ label: "Open / Alternative", src: activeItem.hoverImage });
    }
    return list;
  }, [activeItem]);

  // Reset angle index when hovered item changes
  useEffect(() => {
    setSelectedAngleIndex(0);
  }, [hoveredIndex]);

  const currentPreviewSrc =
    activeGallery[selectedAngleIndex]?.src ||
    activeItem?.image ||
    currentParent?.image;

  const isMorphy = Boolean(
    subMenu?.includes("morphy") ||
      activeSectionId === "morphy" ||
      activeItem?.title?.includes("MORPHY")
  );

  const features = useMemo(() => {
    return getProductFeatures(activeItem);
  }, [activeItem]);

  return (
    <AnimatePresence>
      {subMenu && activeData && (
        <motion.div
          key="submenu-split-test"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onMouseEnter={cancelCloseSubmenu}
          onMouseLeave={() => setSubMenu(null)}
          className="absolute left-0 right-0 top-full z-50 bg-wbk-white border-b border-wbk-lightgrey shadow-xl overflow-hidden before:absolute before:-top-4 before:left-0 before:right-0 before:h-4 before:content-['']"
        >
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="w-full flex items-stretch gap-6 min-h-[390px] max-h-[440px]">
              {/* ── LEFT COLUMN: Product List & All Category Link ── */}
              <div className="w-[330px] xl:w-[360px] shrink-0 border-r border-wbk-lightgrey/70 pr-5 flex flex-col justify-between">
                <div>
                  {/* Category Section Switcher for 'beds' */}
                  {hasSections ? (
                    <div className="flex items-center gap-1.5 p-1 bg-[#F4F1EA] rounded-none mb-3">
                      {activeData.sections.map((sec) => {
                        const isSecActive = activeSectionId === sec.id;
                        return (
                          <button
                            key={sec.id}
                            type="button"
                            onClick={() => {
                              setActiveSectionId(sec.id);
                              setHoveredIndex(0);
                            }}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full text-xs uppercase tracking-wider transition-all cursor-pointer ${
                              isSecActive
                                ? "bg-wbk-white text-wbk-black shadow-xs font-semibold"
                                : "text-wbk-grey hover:text-wbk-black font-medium"
                            }`}
                          >
                            <span>{sec.title}</span>
                            {sec.badge && sec.badge !== "New Gen" && sec.badge !== "New Generation" && (
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold ${
                                  isSecActive
                                    ? "bg-wbk-green/30 text-wbk-black"
                                    : "bg-wbk-grey/20 text-wbk-grey"
                                }`}
                              >
                                {sec.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between mb-3 px-1">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-wbk-black">
                        {currentParent?.title || "Explore Models"}
                      </span>
                    </div>
                  )}

                  {/* Vertical Items List */}
                  <div className="flex flex-col gap-1.5">
                    {currentItems.map((item, idx) => {
                      const isHovered = hoveredIndex === idx;
                      return (
                        <Link
                          key={`${item.href}-${idx}`}
                          href={localizedHref(item.href)}
                          onClick={() => setSubMenu(null)}
                          onMouseEnter={() => setHoveredIndex(idx)}
                          className={`group relative flex items-center gap-3.5 p-2.5 rounded-none transition-all duration-150 cursor-pointer ${
                            isHovered
                              ? "bg-wbk-green/10 translate-x-1"
                              : "hover:bg-wbk-green/5"
                          }`}
                        >
                          {/* Small Product Thumbnail */}
                          <div className="relative w-14 h-14 shrink-0 rounded-none overflow-hidden bg-white">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                sizes="56px"
                                className="object-contain p-1 group-hover:scale-105 transition-transform duration-200"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-wbk-lightgrey/20">
                                <IconBed size={20} className="text-wbk-grey" />
                              </div>
                            )}
                          </div>

                          {/* Item Text & Price */}
                          <div className="flex-1 min-w-0">
                            <h4
                              className={`text-xs leading-tight line-clamp-1 transition-colors ${
                                isHovered
                                  ? "text-wbk-black font-semibold"
                                  : "text-wbk-black font-normal"
                              }`}
                            >
                              {item.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] font-medium text-wbk-black">
                                {item.price || "Explore"}
                              </span>
                              {item.tagline && (
                                <>
                                  <span className="text-wbk-grey/40 text-[10px]">
                                    •
                                  </span>
                                  <span className="text-[10px] text-wbk-grey truncate">
                                    {item.tagline}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Hover Arrow Indicator */}
                          <div
                            className={`shrink-0 transition-all duration-150 ${
                              isHovered
                                ? "opacity-100 translate-x-0 text-wbk-green"
                                : "opacity-0 -translate-x-1 text-wbk-grey/40"
                            }`}
                          >
                            <IconChevronRight size={16} strokeWidth={2.5} />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Row: All Category Collection Link */}
                {currentParent && (
                  <div className="pt-2 border-t border-wbk-lightgrey/50">
                    <Link
                      href={localizedHref(currentParent.href)}
                      onClick={() => setSubMenu(null)}
                      className="group flex items-center justify-between p-2.5 rounded-none bg-[#FAF8F5] hover:bg-wbk-black hover:text-wbk-white transition-all duration-150"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-semibold uppercase tracking-wider">
                          {currentParent.title}
                        </span>
                      </div>
                      <IconArrowRight
                        size={15}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </Link>
                  </div>
                )}
              </div>

              {/* ── RIGHT COLUMN: Interactive Showcase & Angle Thumbnails ── */}
              <div className="flex-1 min-w-0 flex items-stretch gap-6 pl-1">
                {activeItem ? (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeItem.href}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="w-full flex items-stretch gap-6"
                    >
                      {/* Left side of Showcase: Large Image + Angle Thumbs */}
                      <div className="w-[340px] xl:w-[380px] shrink-0 flex flex-col justify-between">
                        {/* Large Image Card */}
                        <Link
                          href={localizedHref(activeItem.href)}
                          onClick={() => setSubMenu(null)}
                          className="group relative flex-1 min-h-[280px] max-h-[300px] w-full rounded-none overflow-hidden bg-gradient-to-b from-[#FBF9F6] to-[#F5F2EC] flex items-center justify-center p-3 cursor-pointer shadow-xs"
                        >
                          {currentPreviewSrc && (
                            <Image
                              src={currentPreviewSrc}
                              alt={activeItem.title}
                              fill
                              sizes="400px"
                              priority
                              className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                            />
                          )}
                        </Link>

                        {/* Angle thumbnails strip */}
                        {activeGallery.length > 1 && (
                          <div className="flex items-center gap-2 mt-3 px-0.5">
                            {activeGallery.map((ang, aIdx) => {
                              const isSelectedAngle = selectedAngleIndex === aIdx;
                              return (
                                <button
                                  key={`angle-${aIdx}`}
                                  type="button"
                                  onClick={() => setSelectedAngleIndex(aIdx)}
                                  onMouseEnter={() => setSelectedAngleIndex(aIdx)}
                                  className={`relative w-16 h-14 rounded-none overflow-hidden bg-white transition-all cursor-pointer ${
                                    isSelectedAngle
                                      ? "ring-2 ring-wbk-green scale-105"
                                      : "hover:opacity-80"
                                  }`}
                                  title={ang.label}
                                >
                                  <Image
                                    src={ang.src}
                                    alt={ang.label}
                                    fill
                                    sizes="64px"
                                    className="object-contain p-1"
                                  />
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Right side of Showcase: Details, Specs, CTA */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                        <div>
                          {/* Product Title (Not bold, no label above) */}
                          <h3 className="text-xl xl:text-2xl font-normal text-wbk-black leading-tight">
                            {activeItem.title}
                          </h3>

                          {/* Price Tag with Highlight */}
                          <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-2xl xl:text-3xl font-semibold text-wbk-black">
                              {activeItem.price}
                            </span>
                            <span className="text-xs text-wbk-grey font-normal">
                              incl. VAT & Frame
                            </span>
                          </div>

                          {/* Key Feature Highlights */}
                          <div className="mt-4 flex flex-col gap-2">
                            {features.map((feat, fIdx) => (
                              <div
                                key={fIdx}
                                className="flex items-center gap-2 text-xs text-wbk-black/85"
                              >
                                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-none bg-wbk-green/20 text-wbk-black">
                                  <IconCheck size={11} strokeWidth={2.5} />
                                </span>
                                <span className="font-normal">{feat}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Bottom CTA Button */}
                        <div className="pt-4 border-t border-wbk-lightgrey/60 flex items-center">
                          <Link
                            href={localizedHref(activeItem.href)}
                            onClick={() => setSubMenu(null)}
                            className="inline-flex items-center justify-center px-7 py-2.5 rounded-full bg-wbk-black text-wbk-white text-xs font-semibold uppercase tracking-wider hover:bg-wbk-green hover:text-wbk-black transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
                          >
                            Explore
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <div className="w-full flex items-center justify-center text-wbk-grey text-sm">
                    Hover over a model on the left to see details.
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
