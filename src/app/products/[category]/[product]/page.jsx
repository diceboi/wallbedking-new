"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconX,
  IconShoppingCart,
  IconArrowsUpDown,
} from "@tabler/icons-react";
import {
  findProductBySlug,
  getFallbackProduct,
  GLOBAL_GALLERY_TEMPLATES,
} from "@/data/products";

// Dynamically import the 3D Canvas component to prevent SSR WebGL issues
const ConfiguratorCanvas = dynamic(
  () =>
    import("@/components/configurator/ConfiguratorCanvas").then(
      (mod) => mod.ConfiguratorCanvas,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center min-h-[400px]">
        <div className="h-9 w-9 border-3 border-wbk-brown/30 border-t-wbk-green rounded-full animate-spin" />
      </div>
    ),
  },
);

export default function ProductDetailPage() {
  const params = useParams();
  const categorySlug = params?.category || "beds";
  const productSlug = params?.product || "integrated-bed";

  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);

  // ── CUSTOMIZER STATES ──
  const [isFolded, setIsFolded] = useState(false);
  const [sofaIncluded, setSofaIncluded] = useState(true);
  const [productFormat, setProductFormat] = useState("Vertical");
  const [productStyle, setProductStyle] = useState("Integrated");
  const [productSize, setProductSize] = useState("King 160 x 200");
  const [formatOpen, setFormatOpen] = useState(false);
  const [styleOpen, setStyleOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  // Mount protection
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lookup product in database
  const activeProduct =
    findProductBySlug(categorySlug, productSlug) ||
    getFallbackProduct(categorySlug, productSlug);

  // Initialize/sync customizer states when route parameters change
  useEffect(() => {
    if (!productSlug) return;
    setReady(false);

    // Default sofa to Include (true)
    setSofaIncluded(true);

    if (activeProduct) {
      setProductFormat(activeProduct.orientation || "Vertical");
      const styleName = productSlug.includes("integrated")
        ? "Integrated"
        : productSlug.includes("classic")
          ? "Classic"
          : isSofa
            ? "Sofa"
            : "Integrated";
      setProductStyle(styleName);
      const sizeName =
        activeProduct.size === "King"
          ? "King 160 x 200"
          : activeProduct.size === "Double"
            ? "Double 120 x 190"
            : "Double 120 x 160";
      setProductSize(sizeName);
    }

    const timer = setTimeout(() => {
      setReady(true);
    }, 30);

    return () => clearTimeout(timer);
  }, [categorySlug, productSlug]);

  // Pricing calculations
  const getBasePrice = () => {
    let base = activeProduct.numericPrice || 799;
    if (productSize.includes("120 x 190")) base += 50;
    if (productSize.includes("160 x 200")) base += 100;
    if (productStyle === "Integrated") base += 80;
    return base;
  };

  const getSofaSurcharge = () => {
    return sofaIncluded ? 280 : 0;
  };

  const totalDecimal = getBasePrice() + getSofaSurcharge();

  // Dynamic gallery images (uses product-specific gallery if provided, otherwise template)
  const galleryImages =
    activeProduct.gallery && activeProduct.gallery.length > 0
      ? activeProduct.gallery
      : [
          {
            src: activeProduct.image,
            alt: `${activeProduct.title} Primary View`,
          },
          {
            src: activeProduct.hoverImage,
            alt: `${activeProduct.title} Open View`,
          },
          ...GLOBAL_GALLERY_TEMPLATES.filter(
            (img) =>
              img.src !== activeProduct.image &&
              img.src !== activeProduct.hoverImage,
          ),
        ];

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) =>
      prev === 0 ? galleryImages.length - 1 : prev - 1,
    );
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) =>
      prev === galleryImages.length - 1 ? 0 : prev + 1,
    );
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === -1) return;
      if (e.key === "Escape") setLightboxIndex(-1);
      if (e.key === "ArrowLeft") handlePrevImage(e);
      if (e.key === "ArrowRight") handleNextImage(e);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, galleryImages]);

  if (!mounted) {
    return (
      <div className="bg-wbk-white min-h-screen pt-28 flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-wbk-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative h-[94vh] max-h-[94vh] flex flex-col bg-white overflow-hidden pt-20">
      {/* ── MAIN PRODUCT LAYOUT: FULL-SECTION CANVAS WITH TRANSPARENT SIDE PANELS ── */}
      <section className="relative z-10 flex-1 min-h-0 flex items-center overflow-hidden pb-2">
        {/* 3D Canvas spans the full section width as a background layer, shifted up vertically */}
        <div className="absolute inset-0 z-0 flex items-center justify-center -translate-y-10 lg:-translate-y-20">
          {mounted && ready && (
            <ConfiguratorCanvas
              key={`${categorySlug}-${productSlug}`}
              isFolded={isFolded}
              sofaIncluded={sofaIncluded}
            />
          )}
        </div>

        {/* Floating UI Grid on top (transparent columns, pointer events pass to canvas on empty areas) */}
        <Container className="w-full h-full relative z-10 pointer-events-none flex flex-col justify-between py-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch h-full">
            {/* ── LEFT COLUMN: CUSTOMIZATION CONTROLS (TRANSPARENT BACKGROUND) ── */}
            <div className="lg:col-span-3 flex flex-col justify-start space-y-6 pointer-events-auto h-full overflow-y-auto custom-scrollbar pr-1">
              <div className="space-y-3">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-1.5 text-[11px] font-poppins text-wbk-brown/80">
                  <Link
                    href="/products"
                    className="hover:text-wbk-black transition-colors"
                  >
                    Products
                  </Link>
                  <span>/</span>
                  <Link
                    href={`/products/${categorySlug}`}
                    className="capitalize hover:text-wbk-black transition-colors"
                  >
                    {categorySlug.replace("-", " ")}
                  </Link>
                </nav>

                {/* Title */}
                <div className="space-y-2">
                  <h1 className="font-new-york text-3xl sm:text-4xl text-wbk-black leading-tight">
                    {activeProduct.title}
                  </h1>
                  <p className="font-poppins text-md font-light text-wbk-black">
                    {productSize}
                  </p>
                </div>

                {/* Dropdowns */}
                <div className="space-y-2.5">
                  {/* Format */}
                  <div className="relative">
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-wbk-brown mb-1 font-poppins">
                      Format:
                    </label>
                    <button
                      onClick={() => {
                        setFormatOpen(!formatOpen);
                        setStyleOpen(false);
                        setSizeOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2 border border-wbk-black/40 rounded-full text-xs font-semibold text-wbk-black bg-white/40 hover:bg-white/70 backdrop-blur-xs transition-all duration-200"
                    >
                      <span>{productFormat}</span>
                      <IconChevronDown size={14} className="text-wbk-brown" />
                    </button>
                    {formatOpen && (
                      <div className="absolute left-0 right-0 mt-1 bg-white/95 backdrop-blur-md border border-wbk-lightgrey rounded-xl shadow-lg z-50 overflow-hidden text-xs">
                        {["Vertical", "Horizontal"].map((item) => (
                          <button
                            key={item}
                            onClick={() => {
                              setProductFormat(item);
                              setFormatOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-wbk-lightgrey/30 font-medium text-wbk-black transition-colors"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Style */}
                  <div className="relative">
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-wbk-brown mb-1 font-poppins">
                      Style:
                    </label>
                    <button
                      onClick={() => {
                        setStyleOpen(!styleOpen);
                        setFormatOpen(false);
                        setSizeOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2 border border-wbk-black/40 rounded-full text-xs font-semibold text-wbk-black bg-white/40 hover:bg-white/70 backdrop-blur-xs transition-all duration-200"
                    >
                      <span>{productStyle}</span>
                      <IconChevronDown size={14} className="text-wbk-brown" />
                    </button>
                    {styleOpen && (
                      <div className="absolute left-0 right-0 mt-1 bg-white/95 backdrop-blur-md border border-wbk-lightgrey rounded-xl shadow-lg z-50 overflow-hidden text-xs">
                        {["Integrated", "Classic", "Sofa"].map((item) => (
                          <button
                            key={item}
                            onClick={() => {
                              setProductStyle(item);
                              setStyleOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-wbk-lightgrey/30 font-medium text-wbk-black transition-colors"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Size */}
                  <div className="relative">
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-wbk-brown mb-1 font-poppins">
                      Size:
                    </label>
                    <button
                      onClick={() => {
                        setSizeOpen(!sizeOpen);
                        setFormatOpen(false);
                        setStyleOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2 border border-wbk-black/40 rounded-full text-xs font-semibold text-wbk-black bg-white/40 hover:bg-white/70 backdrop-blur-xs transition-all duration-200"
                    >
                      <span>{productSize}</span>
                      <IconChevronDown size={14} className="text-wbk-brown" />
                    </button>
                    {sizeOpen && (
                      <div className="absolute left-0 right-0 mt-1 bg-white/95 backdrop-blur-md border border-wbk-lightgrey rounded-xl shadow-lg z-50 overflow-hidden text-xs">
                        {[
                          "Double 120 x 160",
                          "Double 120 x 190",
                          "King 160 x 200",
                        ].map((item) => (
                          <button
                            key={item}
                            onClick={() => {
                              setProductSize(item);
                              setSizeOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-wbk-lightgrey/30 font-medium text-wbk-black transition-colors"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Sofa toggle */}
                  <div className="pt-0.5">
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-wbk-brown mb-1 font-poppins">
                      + Sofa:
                    </label>
                    <div className="relative inline-flex p-1 border border-wbk-black/30 rounded-full bg-white/40 backdrop-blur-xs">
                      <button
                        type="button"
                        onClick={() => setSofaIncluded(true)}
                        className={`relative z-10 px-5 py-1 text-xs font-semibold uppercase tracking-wider transition-colors duration-200 cursor-pointer ${
                          sofaIncluded
                            ? "text-white"
                            : "text-wbk-brown hover:text-wbk-black"
                        }`}
                      >
                        {sofaIncluded && (
                          <motion.div
                            layoutId="sofaTogglePill"
                            className="absolute inset-0 bg-[#9A9A8C] rounded-full shadow-sm"
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 35,
                            }}
                          />
                        )}
                        <span className="relative z-10">Include</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSofaIncluded(false)}
                        className={`relative z-10 px-5 py-1 text-xs font-semibold uppercase tracking-wider transition-colors duration-200 cursor-pointer ${
                          !sofaIncluded
                            ? "text-white"
                            : "text-wbk-brown hover:text-wbk-black"
                        }`}
                      >
                        {!sofaIncluded && (
                          <motion.div
                            layoutId="sofaTogglePill"
                            className="absolute inset-0 bg-[#9A9A8C] rounded-full shadow-sm"
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 35,
                            }}
                          />
                        )}
                        <span className="relative z-10">Exclude</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Spec description */}
              <div className="pt-3 border-t border-wbk-lightgrey/40">
                <p className="text-[14px] text-wbk-black leading-relaxed font-poppins">
                  Morphy isn't just a bed – it's a complete modular sleeping
                  system with SizeFlex™ & TypeFlex™ innovation.
                </p>
              </div>

              {/* Price + Cart */}
              <div className="space-y-2 pt-3 border-t border-wbk-lightgrey/40 shrink-0">
                <div className="font-poppins flex items-baseline justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-wbk-brown font-medium">
                    Total
                  </span>
                  <span className="font-bold text-wbk-black text-2xl leading-none">
                    £{totalDecimal}
                  </span>
                </div>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#9A9A8C] hover:bg-wbk-black text-white text-[10px] font-semibold uppercase tracking-widest rounded-full transition-all duration-300 shadow-md group">
                  <IconShoppingCart
                    size={14}
                    className="transition-transform duration-200 group-hover:scale-110"
                  />
                  Add to cart
                </button>
              </div>
            </div>

            {/* ── CENTER COLUMN: SPACER & FOLD BUTTON ── */}
            <div className="lg:col-span-7 relative min-h-[220px] lg:min-h-0 flex flex-col justify-end items-center pointer-events-none pb-2">
              {/* Fold/Unfold button */}
              <div className="pointer-events-auto flex flex-col items-center gap-4 mb-20">
                {/* Drag hint */}
                <p className="text-[12px] text-wbk-brown/60 font-poppins select-none pointer-events-none hidden md:block">
                  ← Drag to rotate →
                </p>
                <button
                  onClick={() => setIsFolded(!isFolded)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-wbk-black text-wbk-white hover:bg-wbk-green hover:text-wbk-black text-[10px] font-semibold uppercase tracking-wider rounded-full shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <IconArrowsUpDown size={13} className="animate-pulse" />
                  {isFolded ? "Open" : "Close"}
                </button>
              </div>
            </div>

            {/* ── RIGHT COLUMN: GALLERY + PRICE + CART (COMPACT SIZE, TRANSPARENT) ── */}
            <div className="lg:col-span-2 flex flex-col justify-between gap-3 pointer-events-auto h-full overflow-hidden">
              {/* Gallery 2-col scrollable grid */}
              <div className="flex flex-col gap-1.5 min-h-0 flex-1 overflow-hidden">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-wbk-brown font-poppins shrink-0">
                  Gallery ({galleryImages.length})
                </p>
                <div className="grid grid-cols-2 gap-2 overflow-y-auto custom-scrollbar p-0.5">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setLightboxIndex(idx)}
                      className="relative w-full aspect-square rounded-md overflow-hidden bg-white/70 hover:bg-white border border-wbk-lightgrey/80 hover:border-wbk-green shadow-xs transition-all duration-200 group cursor-pointer focus:outline-none"
                    >
                      <img
                        src={img.src}
                        alt={img.alt}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── LIGHTBOX MODAL OVERLAY ── */}
      {lightboxIndex !== -1 && (
        <div
          onClick={() => setLightboxIndex(-1)}
          className="fixed inset-0 z-[999] bg-wbk-black/95 backdrop-blur-md flex items-center justify-center p-4"
        >
          <button
            onClick={() => setLightboxIndex(-1)}
            className="absolute top-6 right-6 text-wbk-white hover:text-wbk-green p-2 rounded-full hover:bg-white/10 transition-all cursor-pointer"
            aria-label="Close lightbox"
          >
            <IconX size={24} />
          </button>
          <button
            onClick={handlePrevImage}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-wbk-white hover:text-wbk-green bg-white/5 hover:bg-white/15 h-12 w-12 rounded-full flex items-center justify-center transition-all cursor-pointer"
            aria-label="Previous image"
          >
            <IconChevronLeft size={28} />
          </button>
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[80vh] w-full flex flex-col items-center justify-center"
          >
            <img
              src={galleryImages[lightboxIndex].src}
              alt={galleryImages[lightboxIndex].alt}
              className="max-w-full max-h-[70vh] object-contain shadow-2xl"
            />
            <p className="mt-4 font-poppins text-xs text-wbk-white/80 text-center tracking-wide px-4">
              {galleryImages[lightboxIndex].alt}
            </p>
          </div>
          <button
            onClick={handleNextImage}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-wbk-white hover:text-wbk-green bg-white/5 hover:bg-white/15 h-12 w-12 rounded-full flex items-center justify-center transition-all cursor-pointer"
            aria-label="Next image"
          >
            <IconChevronRight size={28} />
          </button>
        </div>
      )}
    </div>
  );
}
