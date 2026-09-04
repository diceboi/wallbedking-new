"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Mousewheel } from "swiper/modules";

// Swiper CSS
import "swiper/css";
import "swiper/css/navigation";

import {
  IconChevronDown,
  IconChevronUp,
  IconChevronLeft,
  IconChevronRight,
  IconX,
  IconShoppingCart,
  IconArrowsUpDown,
  IconZoomIn,
  IconPhoto,
  IconCheck,
} from "@tabler/icons-react";
import {
  findProductBySlug,
  getProductVariants,
  getFallbackProduct,
  GLOBAL_GALLERY_TEMPLATES,
  RAW_CATALOG,
} from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useLocale } from "@/context/LocaleContext";
import { getProductPrice, formatPrice } from "@/lib/i18n";
import { resolveCategory } from "@/data/slugs";

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
  const { locale, t } = useLocale();
  const params = useParams();
  const router = useRouter();
  const rawCategory = params?.category || "beds";
  const categorySlug = resolveCategory(rawCategory, params?.locale);
  const productSlug = params?.product || "integrated-bed";

  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);

  // ── CUSTOMIZER & GALLERY STATES ──
  const [isFolded, setIsFolded] = useState(false);
  const [sofaIncluded, setSofaIncluded] = useState(false);
  const [productFormat, setProductFormat] = useState("Vertical");
  const [productStyle, setProductStyle] = useState("Integrated");
  const [productSize, setProductSize] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);

  const [formatOpen, setFormatOpen] = useState(false);
  const [styleOpen, setStyleOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [activeTab, setActiveTab] = useState("description");
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Vertical gallery step-scrolling state & refs
  const galleryContainerRef = useRef(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(true);

  const updateScrollButtons = useCallback(() => {
    const el = galleryContainerRef.current;
    if (!el) return;
    setCanScrollUp(el.scrollTop > 4);
    setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 4);
  }, []);

  const handleScrollGallery = useCallback((direction) => {
    const el = galleryContainerRef.current;
    if (!el) return;
    const firstCard = el.querySelector("[data-gallery-card]");
    const cardHeight = firstCard
      ? firstCard.getBoundingClientRect().height
      : 140;
    const gap = 10;
    const step = cardHeight + gap;

    el.scrollBy({
      top: direction === "down" ? step : -step,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      updateScrollButtons();
    }, 150);
    window.addEventListener("resize", updateScrollButtons);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [updateScrollButtons]);

  const [customerPhotos, setCustomerPhotos] = useState([
    {
      src: "/sofa1.webp",
      author: "Roz M.",
      comment:
        "Looks amazing in our small apartment living room! Easy to pull down.",
      stars: "★★★★★",
    },
    {
      src: "/sofa2.webp",
      author: "Iain D.",
      comment:
        "The mechanism is solid and the framing fits nicely into our cabinets.",
      stars: "★★★★★",
    },
    {
      src: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
      author: "Sarah J.",
      comment: "Outstanding product, completely transformed our guest room.",
      stars: "★★★★★",
    },
  ]);
  const fileInputRef = useRef(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setCustomerPhotos((prev) => [
        {
          src: event.target.result,
          author: "You (Verified Buyer)",
          comment: "My newly installed WallBedKing setup!",
          stars: "★★★★★",
        },
        ...prev,
      ]);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Read size from URL search parameters if provided (e.g. ?size=135x190)
  const searchParams = useSearchParams();
  // Helper to map category, style, and orientation to flagship slugs
  const getFlagshipSlug = useCallback((category, style, orientation) => {
    const cat = (category || "beds").toLowerCase();
    const s = (style || "").toLowerCase();
    const o = (orientation || "Vertical").toLowerCase();

    if (cat === "beds") {
      if (s === "integrated") return `integrated-${o}-wall-bed`;
      if (s === "studio") return `studio-${o}-wall-bed`;
      return `classic-${o}-wall-bed`;
    }

    if (cat === "sofas") {
      if (s.includes("free") || s.includes("standing")) {
        return "free-standing-modular-sofa";
      }
      return "bed-front-modular-sofa";
    }

    if (cat === "mattresses") {
      if (s.includes("supreme")) return "supreme-mattress";
      if (s.includes("luxury")) return "luxury-mattress";
      return "comfort-mattress";
    }

    if (cat === "cabinets") {
      if (s.includes("side") || s.includes("unit")) return "side-storage-wardrobe-cabinet";
      if (s.includes("ext") || s.includes("overhead") || s.includes("bridge")) return "overhead-storage-extension-cabinet";
      if (s.includes("horiz") || o === "horizontal") return "horizontal-wall-bed-cabinet";
      return "vertical-wall-bed-cabinet";
    }

    return null;
  }, []);

  // Helper to match size query string against variants
  const findMatchingVariant = useCallback((variants, query) => {
    if (!variants || !variants.length || !query) return null;
    const clean = query.toLowerCase().replace(/[^a-z0-9]/g, "");

    // 1. Exact sizeSlug match (e.g. "135x190")
    const matchSlug = variants.find(
      (v) => (v.sizeSlug || "").replace(/[^a-z0-9]/g, "") === clean
    );
    if (matchSlug) return matchSlug;

    // 2. Dimensions match (e.g. 135x190 or 1350x1900)
    const matchDim = variants.find((v) => {
      const w = Math.min(v.width || 0, v.length || 0);
      const l = Math.max(v.width || 0, v.length || 0);
      const dimCm = `${Math.round(w / 10)}x${Math.round(l / 10)}`;
      const dimMm = `${w}x${l}`;
      return clean.includes(dimCm) || clean.includes(dimMm);
    });
    if (matchDim) return matchDim;

    // 3. Name or size category match (e.g. "double", "king", "single")
    const matchName = variants.find((v) => {
      const s = (v.size || v.sizeLabel || v.name || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
      return s.includes(clean) || clean.includes(s);
    });
    if (matchName) return matchName;

    return null;
  }, []);

  // Lookup active product (flagship or specific)
  const activeProduct = useMemo(() => {
    return (
      findProductBySlug(categorySlug, productSlug) ||
      getFallbackProduct(categorySlug, productSlug)
    );
  }, [categorySlug, productSlug]);

  // Available variants for the family / category (all sizes for this flagship model)
  const familyVariants = useMemo(() => {
    return getProductVariants(activeProduct);
  }, [activeProduct]);

  // Derived options for dropdowns based on actual products in the family
  const availableFormats = useMemo(() => {
    if (activeProduct.parent_category === "beds") {
      return ["Vertical", "Horizontal"];
    }
    // Only beds require a separate Vertical / Horizontal format selector
    return [];
  }, [activeProduct.parent_category]);

  const availableStyles = useMemo(() => {
    if (activeProduct.parent_category === "beds") {
      return ["Classic", "Studio", "Integrated"];
    }
    if (activeProduct.parent_category === "sofas") {
      return ["Bed Front", "Free Standing"];
    }
    if (activeProduct.parent_category === "mattresses") {
      return ["Comfort", "Luxury", "Supreme"];
    }
    if (activeProduct.parent_category === "cabinets") {
      return ["Vertical", "Horizontal", "Side Units", "Extensions"];
    }
    return [];
  }, [activeProduct.parent_category]);

  const availableSizes = useMemo(() => {
    if (!familyVariants || familyVariants.length === 0) {
      return [{ label: activeProduct.sizeLabel || "Standard", product: activeProduct }];
    }

    const seen = new Set();
    const result = [];

    // For cabinets, filter by target color if present
    const targetColor = activeProduct?.color || selectedVariant?.color;
    const variantsList =
      activeProduct.parent_category === "cabinets" && targetColor
        ? familyVariants.filter((v) => !v.color || v.color === targetColor)
        : familyVariants;

    const list = variantsList.length > 0 ? variantsList : familyVariants;

    for (const v of list) {
      const label = v.sizeLabel || v.size || v.name || "Standard";
      if (!seen.has(label)) {
        seen.add(label);
        result.push({
          label,
          product: v,
        });
      }
    }
    return result;
  }, [familyVariants, activeProduct, selectedVariant?.color]);

  // Initialize/sync customizer states when route parameters or size change
  useEffect(() => {
    if (!productSlug) return;
    setReady(false);
    setSelectedImageIndex(0);

    if (activeProduct) {
      const currentFmt = activeProduct.orientation || "Vertical";
      const currentSty =
        activeProduct.sub_category || activeProduct.type || "Classic";
      setProductFormat(currentFmt);
      setProductStyle(currentSty);

      // Find matching size variant from familyVariants
      let targetVariant = null;
      const sizeQuery = searchParams?.get("size");
      if (sizeQuery) {
        targetVariant = findMatchingVariant(familyVariants, sizeQuery);
      }
      if (!targetVariant && activeProduct.defaultSizeSlug) {
        targetVariant = findMatchingVariant(
          familyVariants,
          activeProduct.defaultSizeSlug
        );
      }
      if (!targetVariant && familyVariants.length > 0) {
        targetVariant =
          findMatchingVariant(familyVariants, "135x190") ||
          findMatchingVariant(familyVariants, "160x200") ||
          familyVariants[0];
      }

      if (targetVariant) {
        setSelectedVariant(targetVariant);
        setProductSize(
          targetVariant.sizeLabel ||
            targetVariant.size ||
            targetVariant.name ||
            "Standard"
        );
      } else {
        setSelectedVariant(activeProduct);
        setProductSize(
          activeProduct.sizeLabel ||
            activeProduct.size ||
            activeProduct.name ||
            "Standard"
        );
      }

      setSofaIncluded(activeProduct.has3D || false);
    }

    const timer = setTimeout(() => {
      setReady(true);
    }, 30);

    return () => clearTimeout(timer);
  }, [
    categorySlug,
    productSlug,
    searchParams,
    activeProduct,
    familyVariants,
    findMatchingVariant,
  ]);

  // When dropdown selections change, pick matching variant or navigate
  const handleOptionChange = (newFormat, newStyle, newSizeLabel) => {
    const fmt = newFormat ?? productFormat;
    const sty = newStyle ?? productStyle;

    // Flagship navigation when format or style changes
    if (newFormat !== undefined || newStyle !== undefined) {
      const targetSlug = getFlagshipSlug(categorySlug, sty, fmt);
      if (targetSlug && targetSlug !== productSlug) {
        const currentSizeSlug = selectedVariant?.sizeSlug || "";
        const query = currentSizeSlug ? `?size=${currentSizeSlug}` : "";
        router.push(`/products/${categorySlug}/${targetSlug}${query}`);
        return;
      }
    }

    if (newFormat !== undefined) setProductFormat(newFormat);
    if (newStyle !== undefined) setProductStyle(newStyle);

    // If format or style changed for non-bed products, auto-select a compatible variant
    if (
      categorySlug !== "beds" &&
      (newFormat !== undefined || newStyle !== undefined) &&
      newSizeLabel === undefined
    ) {
      const targetColor = activeProduct?.color || selectedVariant?.color;
      const matchingVariants = familyVariants.filter((v) => {
        const matchFormat = !fmt || v.orientation === fmt;
        const matchStyle =
          !sty ||
          v.type?.toLowerCase() === sty.toLowerCase() ||
          v.sub_category?.toLowerCase() === sty.toLowerCase();
        const matchColor = !targetColor || !v.color || v.color === targetColor;
        return matchFormat && matchStyle && matchColor;
      });
      const candidates =
        matchingVariants.length > 0 ? matchingVariants : familyVariants;
      const sameSize = candidates.find(
        (v) =>
          (v.sizeLabel && v.sizeLabel === productSize) ||
          (v.size && v.size === selectedVariant?.size)
      );
      const nextVariant = sameSize || candidates[0];
      if (nextVariant) {
        setSelectedVariant(nextVariant);
        setProductSize(
          nextVariant.sizeLabel ||
            nextVariant.size ||
            nextVariant.name ||
            "Standard"
        );
      }
    }

    if (newSizeLabel !== undefined) {
      setProductSize(newSizeLabel);
      const match =
        familyVariants.find(
          (v) => v.sizeLabel === newSizeLabel || v.name === newSizeLabel
        ) ||
        familyVariants.find(
          (v) => v.size === newSizeLabel
        );
      if (match) {
        setSelectedVariant(match);
        if (match.sizeLabel) setProductSize(match.sizeLabel);

        // Update URL shallowly without reloading page
        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
          if (match.sizeSlug) {
            url.searchParams.set("size", match.sizeSlug);
          }
          window.history.replaceState(null, "", url.toString());
        }
      }
    }
  };

  // Current display product is selectedVariant or activeProduct
  const displayProduct = selectedVariant || activeProduct;
  const has3D = Boolean(
    displayProduct?.has3D ||
    displayProduct?.type === "Integrated" ||
    activeProduct?.has3D ||
    productSlug.includes("integrated") ||
    productSlug === "integrated-bed",
  );

  // Dynamic pricing strictly from Supabase columns
  const productPricing = getProductPrice(displayProduct, locale);
  const sofaSurcharge =
    has3D && sofaIncluded
      ? productPricing.currency === "GBP"
        ? 280
        : productPricing.currency === "USD"
          ? 350
          : 320
      : 0;
  const currentPrice = productPricing.raw;
  const totalDecimal = currentPrice + sofaSurcharge;

  // ── CART INTEGRATION ──
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    const itemToAdd = {
      id: `${displayProduct?.slug || displayProduct?.id || productSlug}-${productSize || "standard"}-${productFormat}-${productStyle}-${sofaIncluded ? "sofa" : "nosofa"}`,
      productId: displayProduct?.slug || displayProduct?.id || productSlug,
      title: displayProduct?.title || displayProduct?.name || "Wall Bed",
      image: currentMainImage?.src || displayProduct?.image || "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
      price: totalDecimal,
      options: {
        size: productSize || "Standard",
        orientation: productFormat,
        type: productStyle,
        sofaIncluded: Boolean(sofaIncluded),
      },
      href: `/products/${categorySlug}/${productSlug}${productSize ? `?size=${encodeURIComponent(productSize)}` : ""}`,
    };

    addItem(itemToAdd, 1, true);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2200);
  };

  // Dynamic gallery images
  const galleryImages =
    displayProduct.gallery && displayProduct.gallery.length > 0
      ? displayProduct.gallery
      : [
          {
            src: displayProduct.image,
            alt: `${displayProduct.title} Primary View`,
          },
          {
            src: displayProduct.hover_image || displayProduct.hoverImage,
            alt: `${displayProduct.title} Open View`,
          },
          ...GLOBAL_GALLERY_TEMPLATES.filter(
            (img) =>
              img.src !== displayProduct.image &&
              img.src !== displayProduct.hover_image,
          ),
        ];

  const currentMainImage =
    galleryImages[selectedImageIndex] || galleryImages[0];

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
      <div className="bg-wbk-white min-h-screen pt-16 flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-wbk-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-white pt-4 sm:pt-8 pb-32 sm:pb-36">
      {/* ── MAIN PRODUCT SECTION ── */}
      <section className="relative z-10 w-full pb-8">
        <Container size="xl" className="w-full">
          {/* Mobile Top Header (Breadcrumbs + Title) visible only on < lg */}
          <div className="lg:hidden mb-4 space-y-2">
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
            <div className="space-y-1">
              <h1 className="font-new-york text-2xl sm:text-3xl text-wbk-black leading-tight tracking-tight">
                {displayProduct.title || displayProduct.name}
              </h1>
              <div className="flex items-center gap-2 text-xs font-poppins text-wbk-brown">
                <span>{productSize}</span>
                {has3D && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-wbk-green/30 text-wbk-black font-semibold text-[10px]">
                    3D View
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* ── LEFT COLUMN: PRODUCT CUSTOMIZATION CONTROLS (Order 2 on mobile, Column 1 on desktop) ── */}
            <div className="order-2 lg:order-1 lg:col-span-3 flex flex-col justify-start space-y-5">
              {/* Desktop Breadcrumbs & Title (hidden on mobile) */}
              <div className="hidden lg:block space-y-3">
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

                <div className="space-y-1">
                  <h1 className="font-new-york text-3xl xl:text-4xl text-wbk-black leading-tight tracking-tight">
                    {displayProduct.title || displayProduct.name}
                  </h1>
                  <div className="flex items-center gap-2 text-xs font-poppins text-wbk-brown">
                    <span>{productSize}</span>
                    {has3D && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-wbk-green/30 text-wbk-black font-semibold text-[10px]">
                        3D View
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Dropdowns */}
              <div className="space-y-3">
                {/* Format / Orientation */}
                {availableFormats.length > 0 && (
                  <div className="relative">
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-wbk-brown mb-1 font-poppins">
                      Format:
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setFormatOpen(!formatOpen);
                        setStyleOpen(false);
                        setSizeOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 border border-wbk-black/40 rounded-full text-xs font-semibold text-wbk-black bg-white/70 hover:bg-white backdrop-blur-xs transition-all duration-200 cursor-pointer"
                    >
                      <span>{productFormat}</span>
                      <IconChevronDown size={14} className="text-wbk-brown" />
                    </button>
                    {formatOpen && (
                      <div className="absolute left-0 right-0 mt-1 bg-white/95 backdrop-blur-md border border-wbk-lightgrey rounded-xl shadow-lg z-50 overflow-hidden text-xs py-1">
                        {availableFormats.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => {
                              handleOptionChange(item, undefined, undefined);
                              setFormatOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-wbk-lightgrey/30 font-medium transition-colors cursor-pointer ${
                              productFormat === item
                                ? "text-wbk-gold font-semibold"
                                : "text-wbk-black"
                            }`}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Style / Type */}
                {availableStyles.length > 0 && (
                  <div className="relative">
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-wbk-brown mb-1 font-poppins">
                      Style:
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setStyleOpen(!styleOpen);
                        setFormatOpen(false);
                        setSizeOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 border border-wbk-black/40 rounded-full text-xs font-semibold text-wbk-black bg-white/70 hover:bg-white backdrop-blur-xs transition-all duration-200 cursor-pointer"
                    >
                      <span>{productStyle}</span>
                      <IconChevronDown size={14} className="text-wbk-brown" />
                    </button>
                    {styleOpen && (
                      <div className="absolute left-0 right-0 mt-1 bg-white/95 backdrop-blur-md border border-wbk-lightgrey rounded-xl shadow-lg z-50 overflow-hidden text-xs py-1">
                        {availableStyles.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => {
                              handleOptionChange(undefined, item, undefined);
                              setStyleOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-wbk-lightgrey/30 font-medium transition-colors cursor-pointer ${
                              productStyle === item
                                ? "text-wbk-gold font-semibold"
                                : "text-wbk-black"
                            }`}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Size */}
                {availableSizes.length > 0 && (
                  <div className="relative">
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-wbk-brown mb-1 font-poppins">
                      Size:
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setSizeOpen(!sizeOpen);
                        setFormatOpen(false);
                        setStyleOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 border border-wbk-black/40 rounded-full text-xs font-semibold text-wbk-black bg-white/70 hover:bg-white backdrop-blur-xs transition-all duration-200 cursor-pointer"
                    >
                      <span className="truncate">
                        {productSize || availableSizes[0]?.label}
                      </span>
                      <IconChevronDown
                        size={14}
                        className="text-wbk-brown shrink-0 ml-1"
                      />
                    </button>
                    {sizeOpen && (
                      <div className="absolute left-0 right-0 mt-1 bg-white/95 backdrop-blur-md border border-wbk-lightgrey rounded-xl shadow-lg z-50 overflow-y-auto max-h-56 text-xs py-1">
                        {availableSizes.map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              handleOptionChange(
                                undefined,
                                undefined,
                                item.label,
                              );
                              if (item.product)
                                setSelectedVariant(item.product);
                              setSizeOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-wbk-lightgrey/30 font-medium transition-colors flex items-center justify-between cursor-pointer ${
                              productSize === item.label
                                ? "text-wbk-gold font-semibold"
                                : "text-wbk-black"
                            }`}
                          >
                            <span>{item.label}</span>
                            {item.product && (
                              <span className="text-[11px] text-wbk-brown font-poppins">
                                {getProductPrice(item.product, locale).display}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Sofa toggle (shown when 3D or sofa model) */}
                {has3D && (
                  <div className="pt-1">
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-wbk-brown mb-1 font-poppins">
                      + Sofa:
                    </label>
                    <div className="relative inline-flex p-1 border border-wbk-black/30 rounded-full bg-[#F4F2F0]">
                      <button
                        type="button"
                        onClick={() => setSofaIncluded(true)}
                        className={`relative z-10 px-4 sm:px-5 py-1 text-xs font-semibold uppercase tracking-wider transition-colors duration-200 cursor-pointer ${
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
                        <span className="relative z-10">
                          {t("common.includeSofa", "Include Sofa")}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSofaIncluded(false)}
                        className={`relative z-10 px-4 sm:px-5 py-1 text-xs font-semibold uppercase tracking-wider transition-colors duration-200 cursor-pointer ${
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
                        <span className="relative z-10">
                          {t("common.excludeSofa", "Exclude Sofa")}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Spec description */}
              <div className="pt-2">
                <p className="text-[13px] text-wbk-black/90 leading-relaxed font-poppins">
                  {displayProduct.description ||
                    "The Classic Wall Bed is a practical and durable space-saving solution for bedrooms, guest rooms and multifunctional spaces."}
                </p>
              </div>
            </div>

            {/* ── CENTER COLUMN: 3D VIEWER OR 2D MAIN IMAGE (Order 1 on mobile, Column 2 on desktop) ── */}
            <div className="order-1 lg:order-2 lg:col-span-7 flex flex-col items-center justify-center w-full">
              {has3D ? (
                /* 3D Mode Canvas Container */
                <div className="relative w-full h-[360px] sm:h-[450px] lg:h-[580px] xl:h-[620px] bg-[#F8F7F5] border border-wbk-lightgrey/50 rounded-2xl overflow-hidden flex items-center justify-center shadow-xs">
                  {mounted && ready && (
                    <ConfiguratorCanvas
                      key={`${categorySlug}-${productSlug}-${displayProduct.slug}`}
                      isFolded={isFolded}
                      sofaIncluded={sofaIncluded}
                    />
                  )}

                  {/* 3D Mode Top Controls */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 pointer-events-auto">
                    <button
                      type="button"
                      onClick={() => setIsFolded(!isFolded)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-wbk-black text-wbk-white hover:bg-wbk-green hover:text-wbk-black text-[10px] font-semibold uppercase tracking-wider rounded-full shadow-lg transition-all duration-300 cursor-pointer"
                    >
                      <IconArrowsUpDown size={13} className="animate-pulse" />
                      {isFolded ? "Open Bed" : "Close Bed"}
                    </button>
                    <p className="text-[10px] text-wbk-brown/70 font-poppins select-none pointer-events-none">
                      ← Drag to rotate 3D view →
                    </p>
                  </div>
                </div>
              ) : (
                /* Non-3D Mode: High-Impact Center Main Image */
                <div className="relative w-full flex flex-col items-center justify-center">
                  <div
                    onClick={() => setLightboxIndex(selectedImageIndex)}
                    className="relative group w-full max-w-[620px] aspect-[4/3] sm:aspect-[16/11] bg-[#F4F2F0]/80 rounded-2xl border border-wbk-lightgrey/60 overflow-hidden flex items-center justify-center p-6 sm:p-8 cursor-zoom-in shadow-xs hover:shadow-md transition-all duration-300"
                  >
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={currentMainImage?.src || selectedImageIndex}
                        src={currentMainImage?.src}
                        alt={currentMainImage?.alt || displayProduct.title}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="max-h-full max-w-full object-contain filter drop-shadow-xs select-none"
                      />
                    </AnimatePresence>

                    <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-wbk-black/80 text-white rounded-full text-[10px] font-poppins font-medium uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-xs shadow-md">
                      <IconZoomIn size={13} />
                      <span>Click to zoom</span>
                    </div>

                    <div className="absolute top-4 left-4 flex items-center gap-1 px-2.5 py-1 bg-white/80 text-wbk-black rounded-full text-[10px] font-poppins font-semibold border border-wbk-lightgrey/60 backdrop-blur-xs shadow-2xs">
                      <IconPhoto size={12} className="text-wbk-brown" />
                      <span>
                        {selectedImageIndex + 1} / {galleryImages.length}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── MOBILE GALLERY HORIZONTAL ROW (visible on < lg) ── */}
              <div className="w-full lg:hidden mt-3">
                <div className="flex items-center justify-between pb-1.5">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-wbk-brown font-poppins">
                    Gallery ({galleryImages.length})
                  </p>
                  <span className="text-[10px] text-wbk-brown/70 font-poppins">
                    {has3D ? "Tap photo to zoom" : "Select view"}
                  </span>
                </div>
                <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none py-1">
                  {galleryImages.map((img, idx) => {
                    const isSelected = !has3D && idx === selectedImageIndex;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (has3D) {
                            setLightboxIndex(idx);
                          } else {
                            setSelectedImageIndex(idx);
                          }
                        }}
                        className={`relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden bg-[#F4F2F0] border transition-all duration-200 cursor-pointer p-1 ${
                          isSelected
                            ? "border-wbk-black ring-2 ring-wbk-black/80 shadow-xs scale-[0.98]"
                            : "border-wbk-lightgrey/80 hover:border-wbk-black/60 opacity-85 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={img.src}
                          alt={img.alt}
                          className="w-full h-full object-cover object-center rounded-lg"
                        />
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-wbk-green ring-2 ring-white" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── RIGHT COLUMN: VERTICAL STEP-SCROLLING GALLERY (Desktop Only, hidden on mobile) ── */}
            <div className="hidden lg:flex lg:col-span-2 lg:order-3 flex-col justify-between h-[580px] xl:h-[620px] overflow-hidden">
              <div className="flex flex-col h-full overflow-hidden">
                <div className="flex items-center justify-between pb-2 shrink-0 border-b border-wbk-lightgrey/40">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-wbk-brown font-poppins">
                    Gallery ({galleryImages.length})
                  </p>
                  <span className="text-[10px] text-wbk-brown/70 font-poppins">
                    {has3D ? "Photos" : "Select view"}
                  </span>
                </div>

                <div className="relative flex-1 flex flex-col items-center justify-between py-2 min-h-0">
                  {/* Up Arrow */}
                  <button
                    type="button"
                    onClick={() => handleScrollGallery("up")}
                    disabled={!canScrollUp}
                    className="w-full flex items-center justify-center py-1.5 text-wbk-brown hover:text-wbk-black transition-colors shrink-0 cursor-pointer disabled:opacity-20 disabled:pointer-events-none"
                    aria-label="Previous gallery image"
                  >
                    <IconChevronUp size={18} />
                  </button>

                  {/* Vertical Scroll Container */}
                  <div
                    ref={galleryContainerRef}
                    onScroll={updateScrollButtons}
                    className="w-full flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center gap-2.5 my-1 pr-0.5"
                  >
                    {galleryImages.map((img, idx) => {
                      const isSelected = !has3D && idx === selectedImageIndex;
                      return (
                        <div
                          key={idx}
                          data-gallery-card
                          className="w-full max-w-[140px] xl:max-w-[150px] aspect-square shrink-0 mx-auto"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              if (has3D) {
                                setLightboxIndex(idx);
                              } else {
                                setSelectedImageIndex(idx);
                              }
                            }}
                            className={`relative w-full h-full aspect-square rounded-xl overflow-hidden bg-[#F4F2F0] border transition-all duration-200 group cursor-pointer focus:outline-none flex items-center justify-center p-1.5 ${
                              isSelected
                                ? "border-wbk-black ring-2 ring-wbk-black/80 shadow-xs opacity-100 scale-[0.98]"
                                : "border-wbk-lightgrey/80 hover:border-wbk-black/60 opacity-85 hover:opacity-100"
                            }`}
                          >
                            <img
                              src={img.src}
                              alt={img.alt}
                              className="w-full h-full object-cover object-center rounded-lg group-hover:scale-105 transition-transform duration-300"
                              onLoad={updateScrollButtons}
                            />
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-wbk-green ring-2 ring-white" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Down Arrow */}
                  <button
                    type="button"
                    onClick={() => handleScrollGallery("down")}
                    disabled={!canScrollDown}
                    className="w-full flex items-center justify-center py-1.5 text-wbk-brown hover:text-wbk-black transition-colors shrink-0 cursor-pointer disabled:opacity-20 disabled:pointer-events-none"
                    aria-label="Next gallery image"
                  >
                    <IconChevronDown size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── RATINGS & REVIEWS SUMMARY SECTION ── */}
      <Container size="xl" className="pt-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-white border border-wbk-lightgrey/50 p-8 rounded-none shadow-xs">
          <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left justify-center space-y-4 border-b md:border-b-0 md:border-r border-wbk-lightgrey/30 pb-6 md:pb-0 md:pr-8">
            <div className="text-5xl font-semibold font-poppins text-wbk-black tracking-tight">
              4,9
            </div>
            <div className="space-y-1">
              <div className="text-[#D2AA7C] text-xl tracking-wider select-none">
                ★★★★★
              </div>
              <div className="text-[11px] text-wbk-brown font-poppins">
                Rated by{" "}
                <span className="font-semibold text-wbk-black">742 buyers</span>
              </div>
            </div>
            <button className="px-5 py-2.5 bg-[#9A9A8C] hover:bg-wbk-black text-white text-[10px] font-semibold uppercase tracking-widest rounded-full transition-all duration-300 shadow-sm cursor-pointer">
              Write a review
            </button>
          </div>

          <div className="md:col-span-4 flex flex-col justify-center space-y-2">
            {[
              { stars: 5, count: 674, percent: 90 },
              { stars: 4, count: 50, percent: 7 },
              { stars: 3, count: 4, percent: 1 },
              { stars: 2, count: 5, percent: 1 },
              { stars: 1, count: 9, percent: 1 },
            ].map((row) => (
              <div
                key={row.stars}
                className="flex items-center gap-3 text-xs font-poppins"
              >
                <span className="w-3 text-right font-medium text-wbk-black">
                  {row.stars}
                </span>
                <span className="text-[#D2AA7C] text-[10px]">★</span>
                <div className="flex-1 h-2 bg-[#F4F2F0] rounded-none overflow-hidden">
                  <div
                    className="h-full bg-[#A3A48C] rounded-none"
                    style={{ width: `${row.percent}%` }}
                  />
                </div>
                <span className="w-10 text-right text-wbk-brown">
                  {row.count}x
                </span>
              </div>
            ))}
          </div>

          <div className="md:col-span-4 flex flex-col justify-center gap-4 pl-0 md:pl-8 text-xs font-poppins">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-none bg-[#A3A48C]/10 text-[#A3A48C] flex items-center justify-center text-xs shrink-0 mt-0.5 select-none font-bold">
                ✓
              </div>
              <div>
                <div className="font-semibold text-wbk-black text-sm">98%</div>
                <div className="text-wbk-brown text-[11px] leading-relaxed">
                  proportion recommended by our users
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-none bg-[#A3A48C]/10 text-[#A3A48C] flex items-center justify-center text-xs shrink-0 mt-0.5 select-none font-bold">
                ⚙
              </div>
              <div>
                <div className="font-semibold text-wbk-black text-sm">
                  0,06%
                </div>
                <div className="text-wbk-brown text-[11px] leading-relaxed">
                  extremely low warranty claim rate
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-none bg-[#A3A48C]/10 text-[#A3A48C] flex items-center justify-center text-xs shrink-0 mt-0.5 select-none font-bold">
                ★
              </div>
              <div>
                <div className="font-semibold text-wbk-black text-sm">201</div>
                <div className="text-wbk-brown text-[11px] leading-relaxed">
                  written customer evaluations
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ── TABS NAVIGATION SECTION ── */}
      <section className="relative z-20 bg-white py-16">
        <Container size="xl">
          <div className="flex border-b border-wbk-lightgrey/40 mb-12 overflow-x-auto scrollbar-none whitespace-nowrap">
            {[
              { id: "description", label: "Description" },
              { id: "media", label: "Photos & Videos" },
              { id: "support", label: "Support & Guides" },
              { id: "reviews", label: "Reviews" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative py-4 px-6 font-poppins text-sm font-medium tracking-wide uppercase transition-all duration-300 cursor-pointer ${
                  activeTab === tab.id
                    ? "text-wbk-gold font-semibold"
                    : "text-wbk-brown hover:text-wbk-black"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabUnderbar"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-wbk-gold"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          <div className="min-h-[250px]">
            {/* Description Tab */}
            {activeTab === "description" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-12"
              >
                <div className="space-y-6">
                  <h3 className="font-new-york text-2xl text-wbk-black">
                    About {displayProduct.title || displayProduct.name}
                  </h3>
                  <p className="font-poppins text-sm leading-relaxed text-wbk-black/80">
                    {displayProduct.description ||
                      "The Morphy Wall Bed is a flexible modular sleeping system designed to adapt to changing spaces and needs."}
                  </p>
                  <ul className="space-y-3 font-poppins text-xs text-wbk-brown">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-none bg-wbk-gold" />
                      Premium solid carbon steel metal framework
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-none bg-wbk-gold" />
                      Heavy duty counter-balance mechanism (10,000+ cycle test)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-none bg-wbk-gold" />
                      Automatic self-folding leg system for safety and ease
                    </li>
                  </ul>
                </div>
                <div className="bg-[#F4F2F0]/60 p-8 rounded-none border border-wbk-lightgrey/40">
                  <h4 className="font-poppins font-semibold text-xs uppercase tracking-wider text-wbk-black mb-6">
                    Technical Specifications
                  </h4>
                  <table className="w-full text-xs font-poppins text-wbk-black/80 space-y-3">
                    <tbody>
                      <tr className="border-b border-wbk-lightgrey/40">
                        <td className="py-2.5 font-medium">Mechanism</td>
                        <td className="py-2.5 text-right text-wbk-brown">
                          Gas Piston Cylinder System
                        </td>
                      </tr>
                      {displayProduct.width && (
                        <tr className="border-b border-wbk-lightgrey/40">
                          <td className="py-2.5 font-medium">
                            Mattress Size (W x L)
                          </td>
                          <td className="py-2.5 text-right text-wbk-brown">
                            {displayProduct.width / 10} x{" "}
                            {displayProduct.length
                              ? displayProduct.length / 10
                              : 200}{" "}
                            cm
                          </td>
                        </tr>
                      )}
                      {displayProduct.frame_width && (
                        <tr className="border-b border-wbk-lightgrey/40">
                          <td className="py-2.5 font-medium">Frame width</td>
                          <td className="py-2.5 text-right text-wbk-brown">
                            {displayProduct.frame_width} mm
                          </td>
                        </tr>
                      )}
                      {displayProduct.folded_up_height && (
                        <tr className="border-b border-wbk-lightgrey/40">
                          <td className="py-2.5 font-medium">
                            Folded up height
                          </td>
                          <td className="py-2.5 text-right text-wbk-brown">
                            {displayProduct.folded_up_height} mm
                          </td>
                        </tr>
                      )}
                      {displayProduct.folded_up_projection && (
                        <tr className="border-b border-wbk-lightgrey/40">
                          <td className="py-2.5 font-medium">
                            Bed depth (Folded)
                          </td>
                          <td className="py-2.5 text-right text-wbk-brown">
                            {displayProduct.folded_up_projection} mm
                          </td>
                        </tr>
                      )}
                      {displayProduct.folded_down_projection && (
                        <tr className="border-b border-wbk-lightgrey/40">
                          <td className="py-2.5 font-medium">
                            Bed depth (Open)
                          </td>
                          <td className="py-2.5 text-right text-wbk-brown">
                            {displayProduct.folded_down_projection} mm
                          </td>
                        </tr>
                      )}
                      {displayProduct.mounting_frame_height && (
                        <tr className="border-b border-wbk-lightgrey/40">
                          <td className="py-2.5 font-medium">
                            Mounting frame height
                          </td>
                          <td className="py-2.5 text-right text-wbk-brown">
                            {displayProduct.mounting_frame_height} mm
                          </td>
                        </tr>
                      )}
                      {displayProduct.maximum_mattress_depth && (
                        <tr className="border-b border-wbk-lightgrey/40">
                          <td className="py-2.5 font-medium">
                            Max mattress thickness
                          </td>
                          <td className="py-2.5 text-right text-wbk-brown">
                            Up to {displayProduct.maximum_mattress_depth / 10}{" "}
                            cm
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td className="py-2.5 font-medium">Warranty</td>
                        <td className="py-2.5 text-right text-wbk-brown">
                          {displayProduct.warranty ||
                            "Lifetime mechanism warranty"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Photos & Videos Tab */}
            {activeTab === "media" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-16"
              >
                <div className="space-y-6">
                  <h3 className="font-new-york text-xl text-wbk-black">
                    Official Product Gallery
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {galleryImages.map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() => setLightboxIndex(idx)}
                        className="group relative aspect-square bg-[#F4F2F0] border border-wbk-lightgrey/40 overflow-hidden rounded-none cursor-pointer"
                      >
                        <img
                          src={img.src}
                          alt={img.alt}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <span className="text-white text-xs font-semibold uppercase tracking-wider font-poppins">
                            View
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Setup Gallery */}
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-new-york text-xl text-wbk-black">
                        Customer Setup Gallery
                      </h3>
                      <p className="text-xs text-wbk-brown font-poppins">
                        See how other customers styled their WallBedKing product
                        in their homes.
                      </p>
                    </div>
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handlePhotoUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current.click()}
                        className="px-5 py-2.5 bg-wbk-black hover:bg-wbk-green hover:text-wbk-black text-white text-[10px] font-semibold uppercase tracking-wider rounded-full transition-all duration-300 shadow-sm cursor-pointer"
                      >
                        Share your setup photo
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    <div
                      onClick={() => fileInputRef.current.click()}
                      className="border-2 border-dashed border-wbk-lightgrey hover:border-wbk-gold rounded-none aspect-square flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors group bg-[#F4F2F0]/20"
                    >
                      <span className="text-2xl text-wbk-brown group-hover:scale-110 transition-transform mb-2">
                        📸
                      </span>
                      <span className="text-xs font-semibold text-wbk-black font-poppins uppercase tracking-wider">
                        Upload Setup Photo
                      </span>
                      <span className="text-[10px] text-wbk-brown font-poppins mt-1">
                        Show off your room design
                      </span>
                    </div>

                    {customerPhotos.map((photo, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-wbk-lightgrey/50 rounded-none overflow-hidden shadow-xs flex flex-col justify-between group"
                      >
                        <div className="relative aspect-square w-full bg-[#F4F2F0] overflow-hidden">
                          <img
                            src={photo.src}
                            alt={`Setup by ${photo.author}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                          />
                        </div>
                        <div className="p-4 space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-poppins">
                            <span className="font-semibold text-wbk-black">
                              {photo.author}
                            </span>
                            <span className="text-wbk-gold font-bold">
                              {photo.stars}
                            </span>
                          </div>
                          <p className="text-[11px] font-poppins text-wbk-brown italic leading-relaxed">
                            "{photo.comment}"
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Setup Video Guide */}
                <div className="bg-[#F4F2F0]/60 p-8 rounded-none border border-wbk-lightgrey/40 text-center space-y-4 max-w-2xl mx-auto">
                  <h4 className="font-new-york text-xl text-wbk-black">
                    Watch setup guide
                  </h4>
                  <p className="text-xs font-poppins text-wbk-brown leading-relaxed">
                    See how easily you can customize, open, and close the
                    WallBedKing system in real-time.
                  </p>
                  <div className="relative aspect-video bg-[#E4E0DE] rounded-none flex items-center justify-center overflow-hidden border border-wbk-lightgrey group cursor-pointer shadow-sm max-w-lg mx-auto">
                    <div className="w-14 h-14 bg-white/95 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                      <span className="text-wbk-black ml-1 text-lg">▶</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Support & Guides Tab */}
            {activeTab === "support" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h3 className="font-new-york text-2xl text-wbk-black">
                    Guides & Downloads
                  </h3>
                  <p className="font-poppins text-xs text-wbk-brown max-w-2xl leading-relaxed">
                    Download official step-by-step manuals, structural
                    guidelines, and requirements in PDF format.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: "Wall Bed Installation & Assembly Manual",
                      size: "PDF, 4.2 MB",
                      desc: "Complete guide on drilling, frame assembly, and wall fixation.",
                    },
                    {
                      title: "Gas Piston Adjustment & Tensioning Sheet",
                      size: "PDF, 1.8 MB",
                      desc: "Tension calculation guidelines for custom mattress loads.",
                    },
                    {
                      title: "Cabinetry Mounting Specifications",
                      size: "PDF, 2.5 MB",
                      desc: "Clearance requirements and mounting configurations for side cabinets.",
                    },
                    {
                      title: "Sofa Mechanism Integration Guide",
                      size: "PDF, 3.1 MB",
                      desc: "Assembly checklist for attaching and aligning the front sofa base.",
                    },
                  ].map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between p-6 bg-[#F4F2F0]/50 rounded-none border border-wbk-lightgrey/40 hover:border-wbk-gold transition-colors group"
                    >
                      <div className="space-y-1.5 max-w-[70%]">
                        <span className="text-[10px] font-semibold text-wbk-gold uppercase tracking-wider font-poppins">
                          {doc.size}
                        </span>
                        <h4 className="font-poppins font-medium text-sm text-wbk-black">
                          {doc.title}
                        </h4>
                        <p className="text-xs text-wbk-brown font-poppins leading-relaxed">
                          {doc.desc}
                        </p>
                      </div>
                      <button className="flex items-center gap-1.5 px-4 py-2 border border-wbk-black text-wbk-black text-[10px] font-semibold uppercase tracking-wider rounded-full hover:bg-wbk-black hover:text-white transition-all duration-300 shrink-0 cursor-pointer">
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-12"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      author: "Iain Donald",
                      stars: "★★★★★",
                      text: "Outstanding quality wall bed and excellent customer service. Straightforward installation instructions. Highly recommended if you want to save space.",
                      date: "2 weeks ago",
                    },
                    {
                      author: "Roz M",
                      stars: "★★★★★",
                      text: "The bed we bought is fantastic, we have a small room and it fits away perfectly. You can use your own mattress. We are really pleased with this product and would definitely recommend Wall Bed King.",
                      date: "1 month ago",
                    },
                    {
                      author: "Christopher Pettite",
                      stars: "★★★★★",
                      text: "I bought a bed from Wall Bed King, I have to say they have been one of the best companies I have dealt with in a long time. Prompt and helpful response to all my inquiries.",
                      date: "3 months ago",
                    },
                    {
                      author: "Catherine O'Connor",
                      stars: "★★★★★",
                      text: "I paid a great price for a small double bed, which made my space much better and useful and I could not be happier and more pleased with my purchase!",
                      date: "4 months ago",
                    },
                  ].map((rev, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-6 rounded-none border border-wbk-lightgrey/50 shadow-xs flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-wbk-gold text-xs font-semibold tracking-wider font-poppins">
                            {rev.stars}
                          </span>
                          <span className="text-[10px] text-wbk-brown font-poppins uppercase">
                            {rev.date}
                          </span>
                        </div>
                        <p className="text-xs font-poppins leading-relaxed text-wbk-black/90">
                          "{rev.text}"
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-wbk-lightgrey/20 text-xs font-poppins font-medium text-wbk-black">
                        {rev.author}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </Container>
      </section>

      {/* ── MORPHY / BED FEATURE BLOCKS & VIDEO SECTION ── */}
      {(categorySlug === "beds" ||
        activeProduct?.parent_category === "beds" ||
        has3D) && (
        <section className="relative z-20 bg-white py-20 border-t border-wbk-lightgrey/40">
          <Container size="xl" className="space-y-20">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-[10px] uppercase tracking-widest font-semibold text-wbk-gold font-poppins">
                System Innovations & Features
              </span>
              <h2 className="font-new-york text-4xl sm:text-5xl lg:text-6xl text-wbk-black leading-tight tracking-tight">
                Say hello to Morphy
              </h2>
              <p className="font-poppins text-sm text-wbk-brown leading-relaxed">
                The next generation of modular and adaptable wall bed systems by
                Wall Bed King.
              </p>
            </div>

            {/* Video Showcase (Clean background-less) */}
            <div className="space-y-6 pb-12 border-b border-wbk-lightgrey/40">
              <div className="relative w-full aspect-video rounded-none overflow-hidden bg-black/90 shadow-md">
                <iframe
                  title="Discover Morphy – Modular Bed System"
                  src="https://www.youtube.com/embed/VJba8mH8WTk?showinfo=0&rel=0"
                  className="absolute inset-0 w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>

            {/* Alternating Left/Right Feature Rows (No background boxes, clean dividers) */}
            <div className="space-y-16">
              {/* Feature 1: Two ways to flex your space (Cinematic Video Banner with Title Overlay & Description Below) */}
              <div className="space-y-8 pb-16 border-b border-wbk-lightgrey/40">
                {/* Video Card with Overlay Title */}
                <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-none overflow-hidden shadow-xl border border-wbk-lightgrey/40 bg-black group">
                  <video
                    src="/videos/morphy-indiegogo-trailer.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover select-none"
                  />
                  {/* Dark gradient overlay for crystal-clear title readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

                  {/* Overlaid Title Content */}
                  <div className="absolute inset-0 p-8 sm:p-12 md:p-16 flex flex-col justify-end items-center">
                    <span className="text-[11px] sm:text-xs uppercase tracking-widest font-semibold text-wbk-gold font-poppins mb-2 drop-shadow-sm">
                      Flexibility
                    </span>
                    <h3 className="font-new-york text-3xl sm:text-5xl lg:text-6xl text-white leading-tight tracking-tight max-w-3xl drop-shadow-md">
                      Two ways to flex your space
                    </h3>
                  </div>
                </div>

                {/* Subtitle / Paragraph Description below the video in container width */}
                <p className="font-poppins text-sm sm:text-sm text-wbk-black/85 leading-relaxed text-center">
                  Morphy isn’t just a bed — it’s a complete, next-generation
                  modular sleeping system designed to adapt to your life. With
                  our SizeFlex™ and TypeFlex™ innovations, one frame can
                  transform, resize, and reimagine itself. Whether you move
                  homes, grow your family, or simply want a new look, your
                  Morphy evolves with you — without compromise.
                </p>
              </div>

              {/* Card 2: SizeFlex™ */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pb-16 border-b border-wbk-lightgrey/40">
                <div className="lg:col-span-7 w-full aspect-[16/10] rounded-none bg-[#F8F7F5] border border-wbk-lightgrey/60 flex flex-col items-center justify-center p-6 text-center text-wbk-brown lg:order-1">
                  <span className="text-3xl mb-2">📐</span>
                  <span className="text-xs font-semibold uppercase tracking-wider font-poppins text-wbk-black">
                    Image Slot — SizeFlex™
                  </span>
                  <span className="text-[10px] font-poppins text-wbk-brown/70 mt-1">
                    Add custom image here
                  </span>
                </div>
                <div className="lg:col-span-5 space-y-4 lg:order-2">
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-wbk-gold font-poppins">
                    SizeFlex™ Innovation
                  </span>
                  <h3 className="font-new-york text-2xl sm:text-3xl text-wbk-black">
                    SizeFlex™ — your bed that grows with you
                  </h3>
                  <p className="font-poppins text-sm leading-relaxed text-wbk-black/80">
                    Why buy a new bed every time your needs change? With
                    SizeFlex™, your Morphy can grow from Single to Double,
                    Queen, or even King size — all using the same base
                    components. Our modular frame system features universal
                    parts that connect and expand easily. When you’re ready for
                    a bigger bed, simply order the additional modules you need
                    and reconfigure your existing frame — no need to replace the
                    whole system. Morphy currently supports 16 different size
                    configurations.
                  </p>
                </div>
              </div>

              {/* Card 3: TypeFlex™ */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pb-16 border-b border-wbk-lightgrey/40">
                <div className="lg:col-span-5 space-y-4">
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-wbk-gold font-poppins">
                    TypeFlex™ Adaptability
                  </span>
                  <h3 className="font-new-york text-2xl sm:text-3xl text-wbk-black">
                    TypeFlex™ — reimagine your space, your way
                  </h3>
                  <p className="font-poppins text-sm leading-relaxed text-wbk-black/80">
                    Your Morphy isn’t limited to one purpose. With TypeFlex™,
                    the same base can be transformed into a wall bed, storage
                    bed, ottoman bed, or even a bunk bed. Start simple — then
                    upgrade at your own pace. Add panels to turn it into a
                    Morphy Studio wall bed, or add modules such as desks,
                    cabinets, or sofas. Every component connects seamlessly,
                    giving you complete freedom to design your perfect setup.
                  </p>
                </div>
                <div className="lg:col-span-7 w-full aspect-[16/10] rounded-none bg-[#F8F7F5] border border-wbk-lightgrey/60 flex flex-col items-center justify-center p-6 text-center text-wbk-brown">
                  <span className="text-3xl mb-2">🔄</span>
                  <span className="text-xs font-semibold uppercase tracking-wider font-poppins text-wbk-black">
                    Image Slot — TypeFlex™
                  </span>
                  <span className="text-[10px] font-poppins text-wbk-brown/70 mt-1">
                    Add custom image here
                  </span>
                </div>
              </div>

              {/* Card 4: Flexible Orientation */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pb-16 border-b border-wbk-lightgrey/40">
                <div className="lg:col-span-7 w-full aspect-[16/10] rounded-2xl bg-[#F8F7F5] border border-wbk-lightgrey/60 flex flex-col items-center justify-center p-6 text-center text-wbk-brown lg:order-1">
                  <span className="text-3xl mb-2">↕️</span>
                  <span className="text-xs font-semibold uppercase tracking-wider font-poppins text-wbk-black">
                    Image Slot — Flexible Orientation
                  </span>
                  <span className="text-[10px] font-poppins text-wbk-brown/70 mt-1">
                    Add custom image here
                  </span>
                </div>
                <div className="lg:col-span-5 space-y-4 lg:order-2">
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-wbk-gold font-poppins">
                    Orientation
                  </span>
                  <h3 className="font-new-york text-2xl sm:text-3xl text-wbk-black">
                    Endless possibilities with Flexible Orientation
                  </h3>
                  <p className="font-poppins text-sm leading-relaxed text-wbk-black/80">
                    Change your mind, not your furniture. Morphy’s universal
                    base lets you install the same bed vertically or
                    horizontally—even years after your purchase. Avoid costly
                    exchanges, adapt your bed with ease, and make any room truly
                    yours.
                  </p>
                </div>
              </div>

              {/* Card 5: Modular and Upgradeable */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pb-16 border-b border-wbk-lightgrey/40">
                <div className="lg:col-span-5 space-y-4">
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-wbk-gold font-poppins">
                    Upgradeable
                  </span>
                  <h3 className="font-new-york text-2xl sm:text-3xl text-wbk-black">
                    Modular & Upgradeable System
                  </h3>
                  <p className="font-poppins text-sm leading-relaxed text-wbk-black/80">
                    Start with a simple Classic and upgrade anytime: add a
                    cabinet, switch to Studio, or integrate side units, sofas,
                    or desks (module options launching soon!). With Morphy, your
                    bed isn’t fixed—it evolves alongside your needs, giving you
                    total control and lasting value.
                  </p>
                </div>
                <div className="lg:col-span-7 w-full aspect-[16/10] rounded-2xl bg-[#F8F7F5] border border-wbk-lightgrey/60 flex flex-col items-center justify-center p-6 text-center text-wbk-brown">
                  <span className="text-3xl mb-2">🛋️</span>
                  <span className="text-xs font-semibold uppercase tracking-wider font-poppins text-wbk-black">
                    Image Slot — Modular Upgrades
                  </span>
                  <span className="text-[10px] font-poppins text-wbk-brown/70 mt-1">
                    Add custom image here
                  </span>
                </div>
              </div>

              {/* Card 6: Lifetime Warranty */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pb-16 border-b border-wbk-lightgrey/40">
                <div className="lg:col-span-7 w-full aspect-[16/10] rounded-2xl bg-[#F8F7F5] border border-wbk-lightgrey/60 flex flex-col items-center justify-center p-6 text-center text-wbk-brown lg:order-1">
                  <span className="text-3xl mb-2">🛡️</span>
                  <span className="text-xs font-semibold uppercase tracking-wider font-poppins text-wbk-black">
                    Image Slot — Lifetime Warranty
                  </span>
                  <span className="text-[10px] font-poppins text-wbk-brown/70 mt-1">
                    Add custom image here
                  </span>
                </div>
                <div className="lg:col-span-5 space-y-4 lg:order-2">
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-wbk-gold font-poppins">
                    Quality
                  </span>
                  <h3 className="font-new-york text-2xl sm:text-3xl text-wbk-black">
                    Lifetime Warranty & Sustainable Quality
                  </h3>
                  <p className="font-poppins text-sm leading-relaxed text-wbk-black/80">
                    Morphy isn’t locked into one purpose. Transform it from a
                    wall bed to an ottoman, bunk, or traditional frame as life
                    changes. Lifetime warranty means long-lasting quality, and
                    modular reuse means you’ll never need to discard your bed
                    when styles or needs change. Choose sustainability, choose
                    Morphy.
                  </p>
                </div>
              </div>

              {/* Card 7: Modules Coming Soon */}
              <div className="py-8 space-y-3">
                <span className="text-[10px] uppercase tracking-widest font-semibold text-wbk-gold font-poppins">
                  Modules Coming Soon
                </span>
                <h3 className="font-new-york text-2xl sm:text-3xl text-wbk-black">
                  Elevate Your Morphy Experience
                </h3>
                <p className="font-poppins text-sm leading-relaxed text-wbk-brown max-w-3xl">
                  Get ready to personalize your space like never before! Our
                  sleek new sofa module, versatile desk module, and smart
                  storage units are designed to perfectly complement and expand
                  your Morphy bed—effortlessly transforming your space for work,
                  rest, and play.
                </p>
              </div>
            </div>

            {/* Morphy FAQ Accordion Section (Clean background-less) */}
            <div className="pt-8 border-t border-wbk-lightgrey/40 space-y-8">
              <div className="space-y-2 text-center max-w-xl mx-auto">
                <span className="text-[10px] uppercase tracking-widest font-semibold text-wbk-gold font-poppins">
                  Got Questions?
                </span>
                <h3 className="font-new-york text-2xl sm:text-3xl text-wbk-black">
                  Frequently Asked Questions
                </h3>
              </div>

              <div className="divide-y divide-wbk-lightgrey/40 max-w-3xl mx-auto">
                {[
                  {
                    q: "What is Morphy?",
                    a: "Morphy is the next-generation modular wall bed system by WallBedKing — designed to save space, adapt to any room, and evolve with your life. It can be wall or floor mounted, or built into a cabinet body. Unlike traditional folding beds, it features a modular base, bolt-on legs, and interchangeable parts you can reconfigure anytime.",
                  },
                  {
                    q: "What makes Morphy different from other wall beds?",
                    a: "Traditional wall beds have fixed-size frames when installed. Morphy is fully modular — you can install it vertically or horizontally, change sizes, add cabinets or sofas later, and even convert it into other bed types. It’s the world’s first wall bed that grows and transforms with you.",
                  },
                  {
                    q: "What is SizeFlex™?",
                    a: "SizeFlex™ lets you use the same core parts to build different bed sizes — from Single to Double to King, we have 16 different sizes available. When your needs change, you simply add or remove modules instead of buying a whole new frame.",
                  },
                  {
                    q: "What is TypeFlex™?",
                    a: "TypeFlex™ means your Morphy base isn’t limited to one bed type. It can become a wall bed, storage bed, ottoman bed, or even a bunk. One system, endless options.",
                  },
                  {
                    q: "Can I install Morphy vertically or horizontally?",
                    a: "Yes! Morphy’s universal base allows both orientations — so you can switch from vertical to horizontal installation at any time without needing a new frame.",
                  },
                  {
                    q: "Can I add more modules later?",
                    a: "Absolutely. Start simple with a Classic model and expand whenever you’re ready — add the front panels to turn it instantly into a Studio wall bed, or add cabinets, a sofa, a desk, and side units (modules launching soon). You can always purchase additional parts directly from us, saving money and avoiding waste.",
                  },
                  {
                    q: "Are all parts compatible with future Morphy upgrades?",
                    a: "Yes. Every Morphy component is designed to work seamlessly with future upgrades and new modules — ensuring your bed stays compatible for years to come.",
                  },
                  {
                    q: "Are replacement parts always available?",
                    a: "We make every effort to keep all replacement parts in stock, so you can easily order what you need, whenever you need it.",
                  },
                  {
                    q: "How will I know which parts I need to upgrade my bed?",
                    a: "We’ll guide you through it. Just tell us what you currently have and what you’d like to upgrade to, and we’ll make sure you get every part you need for a smooth transition.",
                  },
                  {
                    q: "Can I install a Morphy wall bed myself?",
                    a: "Yes — installation of the Morphy Classic and Morphy Studio is similar to our other models and comes with detailed instructions. For built-in or cabinet installations, we recommend a professional installer or carpenter — unless you are very good at DIY.",
                  },
                  {
                    q: "Do I need special tools to reconfigure or upgrade?",
                    a: "No. Morphy arrives flat-packed for easy self-assembly, and reconfiguration can be done with basic tools — no professional installation required.",
                  },
                  {
                    q: "Is Morphy compatible with any mattress?",
                    a: "Yes. Morphy fits all standard mattress sizes and thicknesses, up to 30 cm / 12 in. You can keep your favourite mattress or replace it anytime without changing the bed frame.",
                  },
                  {
                    q: "How durable is the Morphy system?",
                    a: "Extremely. Morphy is built from premium, long-lasting materials and powered by a German gas piston system for smooth, safe operation. Every structural component is backed by a lifetime warranty — built to last, built for life.",
                  },
                  {
                    q: "What does the lifetime warranty cover?",
                    a: "The lifetime warranty covers all structural parts of your Morphy bed — including the frame, joints, and mechanical components. If a component ever fails due to manufacturing defects, we’ll replace it free of charge.",
                  },
                  {
                    q: "Is it sustainable?",
                    a: "Yes. Morphy’s modularity means you’ll never need to throw away your bed when your space or style changes. By upgrading instead of replacing, you save resources, reduce waste, and support long-term sustainability.",
                  },
                  {
                    q: "Is Morphy available worldwide?",
                    a: "Yes — we offer fast, reliable, worldwide shipping, with all systems shipped factory-direct for the best value for money.",
                  },
                  {
                    q: "How can I stay tuned for new modules and updates?",
                    a: "Follow us on social media or visit our website regularly for the latest product launches, new module announcements, and exclusive offers.",
                  },
                  {
                    q: "Why should I choose Morphy?",
                    a: "Because Morphy gives you freedom. Freedom to adapt your home, your way — to upgrade, resize, or restyle your bed at any time. It’s smarter, more sustainable, and built to last a lifetime.",
                  },
                ].map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div key={idx} className="py-4">
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between text-left font-poppins font-medium text-sm text-wbk-black hover:text-wbk-gold transition-colors py-1 cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        <span className="text-lg font-bold text-wbk-brown ml-4">
                          {isOpen ? "−" : "+"}
                        </span>
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <p className="pt-2 text-xs font-poppins text-wbk-brown leading-relaxed pr-8">
                              {faq.a}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ── LIGHTBOX MODAL OVERLAY ── */}
      {lightboxIndex !== -1 && (
        <div
          onClick={() => setLightboxIndex(-1)}
          className="fixed inset-0 z-[999] bg-wbk-black/95 backdrop-blur-md flex items-center justify-center p-4"
        >
          <button
            onClick={() => setLightboxIndex(-1)}
            className="absolute top-6 right-6 text-wbk-white hover:text-wbk-green p-2 rounded-full hover:bg-white/10 transition-all cursor-pointer z-20"
            aria-label="Close lightbox"
          >
            <IconX size={24} />
          </button>
          <button
            onClick={handlePrevImage}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-wbk-white hover:text-wbk-green bg-white/5 hover:bg-white/15 h-12 w-12 rounded-full flex items-center justify-center transition-all cursor-pointer z-20"
            aria-label="Previous image"
          >
            <IconChevronLeft size={28} />
          </button>
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[80vh] w-full flex flex-col items-center justify-center"
          >
            <img
              src={galleryImages[lightboxIndex]?.src}
              alt={galleryImages[lightboxIndex]?.alt}
              className="max-w-full max-h-[70vh] object-contain shadow-2xl rounded-none"
            />
            <p className="mt-4 font-poppins text-xs text-wbk-white/80 text-center tracking-wide px-4">
              {galleryImages[lightboxIndex]?.alt}
            </p>
          </div>
          <button
            onClick={handleNextImage}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-wbk-white hover:text-wbk-green bg-white/5 hover:bg-white/15 h-12 w-12 rounded-full flex items-center justify-center transition-all cursor-pointer z-20"
            aria-label="Next image"
          >
            <IconChevronRight size={28} />
          </button>
        </div>
      )}

      {/* ── PERSISTENT STICKY BOTTOM BAR: PRODUCT TITLE, SIZE, TOTAL PRICE & ADD TO CART ── */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 1 }}
        className="fixed bottom-3 sm:bottom-6 left-0 right-0 z-50 pointer-events-none px-2.5 sm:px-6"
      >
        <Container
          size="xl"
          className="flex items-center justify-between gap-3 sm:gap-6 bg-[#A3A48C]/95 backdrop-blur-md rounded-2xl shadow-xl px-3.5 sm:px-8 py-2.5 sm:py-3 transition-all duration-300 pointer-events-auto border border-white/20"
        >
          {/* Left: Product Name & Selected Size */}
          <div className="flex flex-col min-w-0 max-w-[130px] sm:max-w-xs md:max-w-sm">
            <span className="font-new-york text-sm sm:text-base md:text-lg text-wbk-black font-semibold truncate leading-tight">
              {displayProduct.title || displayProduct.name}
            </span>
            <span className="font-poppins text-[10px] sm:text-xs text-wbk-black/75 font-light truncate">
              {productSize || "Standard"}
            </span>
          </div>

          {/* Right: Total Price & Add to Cart Button */}
          <div className="flex items-center gap-2.5 sm:gap-6 shrink-0">
            <div className="flex flex-col items-end font-poppins">
              <span className="text-[9px] uppercase tracking-widest text-wbk-black/80 font-semibold">
                {t("common.total", "Total")}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold text-wbk-black text-base sm:text-xl md:text-2xl leading-none">
                  {formatPrice(totalDecimal, locale)}
                </span>
                {productPricing.isOnSale && (
                  <span className="text-[10px] sm:text-xs text-wbk-black/60 line-through font-normal hidden sm:inline">
                    {formatPrice(productPricing.regularRaw + sofaSurcharge, locale)}
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-wbk-black hover:bg-wbk-black text-white text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest rounded-full transition-all duration-300 shadow-md hover:shadow-lg group cursor-pointer shrink-0"
            >
              {isAdded ? (
                <>
                  <IconCheck size={14} className="text-wbk-gold" />
                  <span className="text-wbk-gold">
                    {t("common.addedToCart", "Added!")}
                  </span>
                </>
              ) : (
                <>
                  <IconShoppingCart
                    size={14}
                    className="transition-transform duration-200 group-hover:scale-110"
                  />
                  <span>{t("common.addToCart", "Add to basket")}</span>
                </>
              )}
            </button>
          </div>
        </Container>
      </motion.div>
    </div>
  );
}
