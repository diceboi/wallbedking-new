"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Mousewheel, FreeMode } from "swiper/modules";

// Swiper CSS
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";

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
  IconBell,
  IconFileText,
  IconDownload,
  IconExternalLink,
  IconClock,
  IconBrandYoutube,
} from "@tabler/icons-react";
import {
  findProductBySlug,
  getProductVariants,
  getFallbackProduct,
  GLOBAL_GALLERY_TEMPLATES,
} from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useLocale } from "@/context/LocaleContext";
import { useProductCatalog } from "@/context/ProductCatalogContext";
import { getProductPrice, formatPrice } from "@/lib/i18n";
import { resolveCategory } from "@/data/slugs";
import { getTagMeta, getLocalizedTagName } from "@/lib/tags";
import { TagBadge } from "@/components/ui/TagBadge";
import { ProductReviewsSection } from "@/components/product/ProductReviewsSection";
import { WaitlistModal } from "@/components/product/WaitlistModal";
import {
  getLocalizedProductName,
  getLocalizedProductGtin,
  parseYouTubeVideo,
} from "@/lib/products";
import { getMorphyFaqs } from "@/data/morphyFaq";

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
  const { locale, t, localizedHref } = useLocale();
  const { findProductBySlug: catalogFindBySlug, getProductVariants: catalogGetVariants } =
    useProductCatalog();
  const params = useParams();
  const router = useRouter();
  const rawCategory = params?.category || "beds";
  const categorySlug = resolveCategory(rawCategory, params?.locale);
  const productSlug = params?.product || "integrated-bed";

  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);

  // Imperial vs Metric measurement helpers
  const isUS = locale === "us";
  const formatWeight = (kg) =>
    !kg ? "" : isUS ? `${Math.round(kg * 2.20462)} lbs` : `${kg} kg`;
  const formatMm = (mm) => {
    if (!mm) return "";
    if (isUS) {
      const inches = (mm / 25.4).toFixed(1);
      return `${inches}" (${mm} mm)`;
    }
    return `${mm} mm`;
  };
  const formatCm = (cm) => {
    if (!cm) return "";
    if (isUS) {
      const inches = (cm / 2.54).toFixed(1);
      return `${inches}" (${cm} cm)`;
    }
    return `${cm} cm`;
  };
  const formatSizeLabel = (label) => {
    if (!label || !isUS) return label;
    if (label.includes('"')) return label;

    if (/\(\s*\d+\s*[xX×]\s*\d+\s*cm\s*\)/i.test(label)) {
      return label.replace(
        /\(\s*(\d+)\s*[xX×]\s*(\d+)\s*cm\s*\)/gi,
        (match, w, l) => {
          const wIn = Math.round(Number(w) / 2.54);
          const lIn = Math.round(Number(l) / 2.54);
          return `(${w}x${l} cm / ${wIn}" x ${lIn}")`;
        },
      );
    }

    if (/\b\d+\s*[xX×]\s*\d+\s*cm\b/i.test(label)) {
      return label.replace(
        /\b(\d+)\s*[xX×]\s*(\d+)\s*cm\b/gi,
        (match, w, l) => {
          const wIn = Math.round(Number(w) / 2.54);
          const lIn = Math.round(Number(l) / 2.54);
          return `${w}x${l} cm (${wIn}" x ${lIn}")`;
        },
      );
    }

    if (/\b(\d{2,3})\s*[xX×]\s*(\d{2,3})\b/.test(label)) {
      return label.replace(
        /\b(\d{2,3})\s*[xX×]\s*(\d{2,3})\b/g,
        (match, w, l) => {
          const wIn = Math.round(Number(w) / 2.54);
          const lIn = Math.round(Number(l) / 2.54);
          return `${w}x${l} (${wIn}" x ${lIn}")`;
        },
      );
    }

    if (/\b(\d{3,4})\s*mm\b/i.test(label)) {
      return label.replace(/\b(\d{3,4})\s*mm\b/gi, (match, mm) => {
        const inches = (Number(mm) / 25.4).toFixed(1);
        return `${mm} mm (${inches}")`;
      });
    }

    return label;
  };

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
  const [colorOpen, setColorOpen] = useState(false);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [activeTab, setActiveTab] = useState("description");
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);

  // Desktop Add to Cart ref & visibility state for floating bar
  const desktopAddToCartRef = useRef(null);
  const [isDesktopAddToCartVisible, setIsDesktopAddToCartVisible] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);

  // Ref to close open customizer dropdowns on outside click
  const dropdownsRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownsRef.current && !dropdownsRef.current.contains(e.target)) {
        setFormatOpen(false);
        setStyleOpen(false);
        setSizeOpen(false);
        setColorOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Left column height tracking to lock gallery & center image height
  const leftColRef = useRef(null);
  const [leftColHeight, setLeftColHeight] = useState(null);

  // Vertical gallery step-scrolling state & refs
  const galleryContainerRef = useRef(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(true);

  // Mobile horizontal gallery Swiper state
  const [mobileGallerySwiper, setMobileGallerySwiper] = useState(null);
  const [isMobileGalleryBeginning, setIsMobileGalleryBeginning] =
    useState(true);
  const [isMobileGalleryEnd, setIsMobileGalleryEnd] = useState(false);

  // Tabs Swiper state for mobile
  const [tabsSwiper, setTabsSwiper] = useState(null);
  const [isTabsBeginning, setIsTabsBeginning] = useState(true);
  const [isTabsEnd, setIsTabsEnd] = useState(false);

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

  // Track window resize for desktop detection
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Track left column height dynamically with ResizeObserver
  useEffect(() => {
    const el = leftColRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const h = Math.round(entry.contentRect.height);
        if (h > 0) {
          setLeftColHeight(h);
        }
      }
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, [mounted, productFormat, productStyle, productSize, sofaIncluded]);

  // Track desktop Add to Cart button intersection to trigger floating bar
  useEffect(() => {
    const el = desktopAddToCartRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsDesktopAddToCartVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [mounted]);

  // Update gallery step scroll buttons whenever leftColHeight changes
  useEffect(() => {
    updateScrollButtons();
  }, [leftColHeight, updateScrollButtons]);

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

  // Auto-switch to reviews tab if URL requests review dialog
  useEffect(() => {
    const isReviewParam =
      searchParams?.get("review") === "true" ||
      searchParams?.get("review") === "open" ||
      Boolean(searchParams?.get("rating"));

    if (isReviewParam) {
      setActiveTab("reviews");
    }
  }, [searchParams]);
  // Helper to map category, style, and orientation to flagship slugs
  const getFlagshipSlug = useCallback((category, style, orientation) => {
    const cat = (category || "beds").toLowerCase();
    const s = (style || "").toLowerCase();
    const o = (orientation || "Vertical").toLowerCase();

    if (cat === "beds") {
      const isMorphy = Boolean(
        activeProduct?.isMorphy ??
        ((activeProduct?.name || "").includes("MORPHY") ||
          (activeProduct?.title || "").includes("MORPHY")),
      );
      if (isMorphy) {
        if (s === "integrated") return `integrated-${o}-wall-bed`;
        if (s === "studio") return `studio-${o}-wall-bed`;
        return `classic-${o}-wall-bed`;
      } else {
        if (s === "studio") return `studio-${o}-traditional-bed`;
        return `classic-${o}-traditional-bed`;
      }
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
      if (s.includes("side") || s.includes("unit"))
        return "side-storage-wardrobe-cabinet";
      if (s.includes("ext") || s.includes("overhead") || s.includes("bridge"))
        return "overhead-storage-extension-cabinet";
      if (s.includes("horiz") || o === "horizontal")
        return "horizontal-wall-bed-cabinet";
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
      (v) => (v.sizeSlug || "").replace(/[^a-z0-9]/g, "") === clean,
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
    const lookup = catalogFindBySlug || findProductBySlug;
    return (
      lookup(categorySlug, productSlug) ||
      findProductBySlug(categorySlug, productSlug) ||
      getFallbackProduct(categorySlug, productSlug)
    );
  }, [catalogFindBySlug, categorySlug, productSlug]);

  // Available variants for the family / category (all sizes for this flagship model)
  const familyVariants = useMemo(() => {
    const getVariants = catalogGetVariants || getProductVariants;
    return getVariants(activeProduct);
  }, [catalogGetVariants, activeProduct]);

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
      const isMorphy = Boolean(
        activeProduct?.isMorphy ??
        ((activeProduct?.name || "").includes("MORPHY") ||
          (activeProduct?.title || "").includes("MORPHY")),
      );
      return isMorphy
        ? ["Classic", "Studio", "Integrated"]
        : ["Classic", "Studio"];
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
      return [
        {
          label: activeProduct.sizeLabel || "Standard",
          product: activeProduct,
        },
      ];
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

  const availableColors = useMemo(() => {
    if (!familyVariants || familyVariants.length === 0) {
      return activeProduct?.color ? [activeProduct.color] : [];
    }
    const colors = Array.from(
      new Set(familyVariants.map((v) => v.color).filter(Boolean)),
    );
    const order = ["Oak", "Beech", "Pine", "White", "Black", "Grey", "Beige"];
    colors.sort((a, b) => {
      const ia = order.indexOf(a);
      const ib = order.indexOf(b);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.localeCompare(b);
    });
    return colors;
  }, [familyVariants, activeProduct?.color]);

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
      const colorQuery = searchParams?.get("color");

      if (colorQuery && sizeQuery) {
        targetVariant = familyVariants.find(
          (v) =>
            v.color?.toLowerCase() === colorQuery.toLowerCase() &&
            (v.sizeSlug === sizeQuery || v.slug === sizeQuery || v.sizeLabel === sizeQuery)
        );
      }
      if (!targetVariant && sizeQuery) {
        targetVariant = findMatchingVariant(familyVariants, sizeQuery);
      }
      if (!targetVariant && colorQuery) {
        targetVariant = familyVariants.find(
          (v) => v.color?.toLowerCase() === colorQuery.toLowerCase()
        );
      }
      if (!targetVariant && activeProduct.defaultSizeSlug) {
        targetVariant = findMatchingVariant(
          familyVariants,
          activeProduct.defaultSizeSlug,
        );
      }
      if (!targetVariant && activeProduct) {
        const activeSizeSlug =
          activeProduct.sizeSlug ||
          (activeProduct.width && activeProduct.length
            ? `${Math.round(Math.min(activeProduct.width, activeProduct.length) / 10)}x${Math.round(Math.max(activeProduct.width, activeProduct.length) / 10)}`
            : null);
        if (activeSizeSlug) {
          targetVariant = findMatchingVariant(familyVariants, activeSizeSlug);
        }
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
            "Standard",
        );
      } else {
        setSelectedVariant(activeProduct);
        setProductSize(
          activeProduct.sizeLabel ||
            activeProduct.size ||
            activeProduct.name ||
            "Standard",
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

  // Canonical bed URL normalization:
  // If the visitor opens a variant slug directly (e.g. european-double-long-vertical-classic-bed-140x200),
  // silently replace the browser URL with the canonical flagship page + ?size=${sizeSlug}
  useEffect(() => {
    if (!mounted || !activeProduct || categorySlug !== "beds") return;

    const isMorphy = Boolean(
      activeProduct?.isMorphy ??
      ((activeProduct?.name || "").includes("MORPHY") || (activeProduct?.category || "").includes("MORPHY"))
    );
    const o = (activeProduct.orientation || "Vertical").toLowerCase();
    const style = (activeProduct.sub_category || activeProduct.type || "Classic").toLowerCase();

    let canonicalSlug = "classic-vertical-wall-bed";
    if (isMorphy) {
      if (style.includes("integrated")) canonicalSlug = `integrated-${o}-wall-bed`;
      else if (style.includes("studio")) canonicalSlug = `studio-${o}-wall-bed`;
      else canonicalSlug = `classic-${o}-wall-bed`;
    } else {
      if (style.includes("studio")) canonicalSlug = `studio-${o}-traditional-bed`;
      else canonicalSlug = `classic-${o}-traditional-bed`;
    }

    if (productSlug && productSlug !== canonicalSlug) {
      const minDim = Math.min(Number(activeProduct.width) || 0, Number(activeProduct.length) || 0);
      const maxDim = Math.max(Number(activeProduct.width) || 0, Number(activeProduct.length) || 0);
      const sizeSlug = (minDim && maxDim)
        ? `${Math.round(minDim / 10)}x${Math.round(maxDim / 10)}`
        : (activeProduct.sizeSlug || searchParams?.get("size") || "");
      const query = sizeSlug ? `?size=${sizeSlug}` : "";
      const canonicalPath = `/${locale || "en"}/products/beds/${canonicalSlug}${query}`;
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", canonicalPath);
      }
    }
  }, [mounted, activeProduct, productSlug, categorySlug, locale, searchParams]);

  // Review auto-open trigger from post-purchase emails or direct rating links
  useEffect(() => {
    const isReview = searchParams?.get("review");
    const ratingParam = searchParams?.get("rating");
    if (isReview === "true" || isReview === "open" || ratingParam) {
      setActiveTab("reviews");
      if (tabsSwiper) {
        tabsSwiper.slideTo(3);
      }
      const timer = setTimeout(() => {
        const el =
          document.getElementById("reviews-section") ||
          document.getElementById("product-tabs");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [searchParams, tabsSwiper]);

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
          (v.size && v.size === selectedVariant?.size),
      );
      const nextVariant = sameSize || candidates[0];
      if (nextVariant) {
        setSelectedVariant(nextVariant);
        setProductSize(
          nextVariant.sizeLabel ||
            nextVariant.size ||
            nextVariant.name ||
            "Standard",
        );
      }
    }

    if (newSizeLabel !== undefined) {
      setProductSize(newSizeLabel);
      const currentColor = selectedVariant?.color || activeProduct?.color;
      const match =
        familyVariants.find((v) => {
          const matchSize =
            v.sizeLabel === newSizeLabel ||
            v.name === newSizeLabel ||
            v.size === newSizeLabel;
          const matchColor =
            !currentColor ||
            v.color?.toLowerCase() === currentColor.toLowerCase();
          return matchSize && matchColor;
        }) ||
        familyVariants.find(
          (v) => v.sizeLabel === newSizeLabel || v.name === newSizeLabel,
        ) ||
        familyVariants.find((v) => v.size === newSizeLabel);
      if (match) {
        setSelectedVariant(match);
        if (match.sizeLabel) setProductSize(match.sizeLabel);

        // Update URL shallowly without reloading page
        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
          if (match.sizeSlug) {
            url.searchParams.set("size", match.sizeSlug);
          }
          if (match.color) {
            url.searchParams.set("color", match.color.toLowerCase());
          }
          window.history.replaceState(null, "", url.toString());
        }
      }
    }
  };

  const handleColorChange = (newColor) => {
    if (!newColor) return;
    setSelectedImageIndex(0);
    const currentSize = productSize;
    const match =
      familyVariants.find((v) => {
        const matchColor = v.color?.toLowerCase() === newColor.toLowerCase();
        const matchSize =
          v.sizeLabel === currentSize ||
          v.size === currentSize ||
          v.sizeSlug === selectedVariant?.sizeSlug;
        return matchColor && matchSize;
      }) ||
      familyVariants.find(
        (v) => v.color?.toLowerCase() === newColor.toLowerCase(),
      );

    if (match) {
      setSelectedVariant(match);
      if (match.sizeLabel) setProductSize(match.sizeLabel);

      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        if (match.sizeSlug) url.searchParams.set("size", match.sizeSlug);
        if (match.color) url.searchParams.set("color", match.color.toLowerCase());
        window.history.replaceState(null, "", url.toString());
      }
    }
  };

  // Current display product is selectedVariant or activeProduct
  const displayProduct = selectedVariant || activeProduct;
  const isOutOfStock =
    (displayProduct?.stock !== undefined &&
      displayProduct?.stock !== null &&
      Number(displayProduct.stock) <= 0) ||
    displayProduct?.in_stock === false;
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

  const localizedProductName = getLocalizedProductName(displayProduct, locale);
  const currentEan = getLocalizedProductGtin(displayProduct, locale);

  // Dynamic product features / specs bullets based on active product category & model
  const productFeatures = useMemo(() => {
    if (displayProduct.features && displayProduct.features.length > 0) {
      return displayProduct.features;
    }
    if (activeProduct?.features && activeProduct.features.length > 0) {
      return activeProduct.features;
    }
    const cat = (displayProduct.parent_category || categorySlug || "").toLowerCase();
    const subCat = (displayProduct.sub_category || displayProduct.type || "").toLowerCase();

    if (cat === "cabinets") {
      if (subCat.includes("horiz")) {
        return [
          "Doors: 90 degrees opening",
          "Material: Melamine-faced furniture board",
          "Suitable for horizontal Classic Double and King wall bed frames",
          "Flat-packed for easy assembly",
          "Warranty: 1 year for manufacturing defects",
        ];
      }
      if (subCat.includes("ext")) {
        return [
          "Specifically developed for the horizontal Double and King cabinets",
          "Makes up the height difference to align perfectly with side units",
          "Material: Melamine-faced furniture board",
          "Flat-packed for easy assembly",
          "Warranty: 1 year for manufacturing defects",
        ];
      }
      if (subCat.includes("side")) {
        return [
          "Height: Matches vertical Double/King cabinets and horizontal cabinets with extension",
          "Width: 50cm, Depth: 52cm",
          "Style choices: Wardrobe door with hanging rail (90° opening) or open shelving",
          "Material: Melamine-faced furniture board",
          "Flat-packed for easy assembly",
          "Warranty: 1 year for manufacturing defects",
        ];
      }
      return [
        "Doors: 170 degrees opening for wide, easy access",
        "Material: Melamine-faced furniture board",
        "Suitable for Classic Vertical Single, Small Double, Double and King wall beds",
        "Flat-packed for easy assembly",
        "Warranty: 1 year for manufacturing defects",
      ];
    }

    if (cat === "mattresses") {
      if (subCat.includes("supreme")) {
        return [
          '10" (25cm) thickness profile',
          "1,500 individually wrapped pocket springs combined with memory foam",
          "Motion Isolation Technology™ to eliminate partner disturbance",
          "Cloud-like luxury contouring and targeted pressure relief",
          "30-day complete money back guarantee",
          "Warranty: 1 year for manufacturing defects",
        ];
      }
      if (subCat.includes("luxury")) {
        return [
          '10" (25cm) thickness profile',
          '3" layer of memory foam for deep pressure-relieving comfort',
          "Thick memory foam combined with a high-resilience reflex foam base",
          "Medium-firm orthopaedic support for spinal alignment",
          "30-day complete money back guarantee",
          "Warranty: 1 year for manufacturing defects",
        ];
      }
      return [
        '8" (20cm) thickness profile for seamless wall bed folding',
        '2" layer of memory foam for pressure-relieving comfort',
        "High-density foam base for durable spinal support",
        "Engineered for everyday restful sleep in wall beds",
        "30-day complete money back guarantee",
        "Warranty: 1 year for manufacturing defects",
      ];
    }

    // Default for wall beds
    return [
      t("product.bulletSteel", "Premium solid carbon steel metal framework"),
      t("product.bulletMechanism", "Heavy duty counter-balance mechanism (10,000+ cycle test)"),
      t("product.bulletLegs", "Automatic self-folding leg system for safety and ease"),
    ];
  }, [displayProduct, activeProduct, categorySlug, t]);

  // ── CART INTEGRATION ──
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    const itemToAdd = {
      id: `${displayProduct?.slug || displayProduct?.id || productSlug}-${productSize || "standard"}-${productFormat}-${productStyle}-${sofaIncluded ? "sofa" : "nosofa"}`,
      productId: displayProduct?.slug || displayProduct?.id || productSlug,
      title: localizedProductName,
      image:
        currentMainImage?.src ||
        displayProduct?.image ||
        "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
      price: totalDecimal,
      options: {
        size: formatSizeLabel(productSize, locale) || "Standard",
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
            alt: `${localizedProductName} Primary View`,
          },
          {
            src: displayProduct.hover_image || displayProduct.hoverImage,
            alt: `${localizedProductName} Open View`,
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
    e?.stopPropagation?.();
    setLightboxIndex((prev) =>
      prev === 0 ? galleryImages.length - 1 : prev - 1,
    );
  };

  const handleNextImage = (e) => {
    e?.stopPropagation?.();
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

  const showFloatingBar = !isDesktop || !isDesktopAddToCartVisible;

  return (
    <div className="relative min-h-screen flex flex-col bg-white pt-4 sm:pt-8 pb-32 sm:pb-36">
      {/* ── MAIN PRODUCT SECTION ── */}
      <section className="relative z-10 w-full min-h-0 flex items-start lg:items-center pb-8 lg:pb-6">
        <Container
          size="xl"
          className="w-full relative z-10 flex flex-col justify-start py-1"
        >
          {/* Mobile Top Header (Breadcrumbs + Title) visible only on < lg */}
          <div className="lg:hidden mb-4 space-y-2">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-1.5 text-[11px] font-poppins text-wbk-brown/80">
              <Link
                href={localizedHref ? localizedHref("/products") : "/products"}
                className="hover:text-wbk-black transition-colors"
              >
                {t("nav.allWallBeds", "Products")}
              </Link>
              <span>/</span>
              <Link
                href={localizedHref ? localizedHref(`/products/${categorySlug}`) : `/products/${categorySlug}`}
                className="capitalize hover:text-wbk-black transition-colors"
              >
                {categorySlug.replace("-", " ")}
              </Link>
            </nav>

            {/* Title */}
            <div className="space-y-1">
              <h1 className="font-new-york text-2xl sm:text-3xl text-wbk-black leading-tight tracking-tight">
                {localizedProductName}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs font-poppins text-wbk-brown">
                <span>{formatSizeLabel(productSize)}</span>
                {displayProduct?.sku && (
                  <span className="inline-flex items-center px-1.5 py-0.5 font-mono text-[11px] bg-[#F4F2F0] text-wbk-black border border-wbk-lightgrey/60">
                    SKU: {displayProduct.sku}
                  </span>
                )}
                {displayProduct?.weight && (
                  <span className="inline-flex items-center px-1.5 py-0.5 text-[11px] bg-[#F4F2F0] text-wbk-black border border-wbk-lightgrey/60">
                    {formatWeight(displayProduct.weight)}
                  </span>
                )}
                {has3D && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-wbk-green/30 text-wbk-black font-semibold text-[10px]">
                    3D View
                  </span>
                )}
              </div>

              {/* Product Tags */}
              {Array.isArray(displayProduct?.tags) &&
                displayProduct.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 pt-1.5 flex-wrap">
                    {displayProduct.tags.map((tId) => (
                      <TagBadge
                        key={tId}
                        tagIdOrSlug={tId}
                        locale={locale}
                        variant="micro"
                      />
                    ))}
                  </div>
                )}
              {isOutOfStock ? (
                <div className="flex flex-wrap items-center gap-2 pt-1.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-wbk-gold/15 border border-wbk-gold/50 text-wbk-gold text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-wbk-gold animate-pulse" />
                    {t("waitlist.outOfStock", "Out of Stock")}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsWaitlistModalOpen(true)}
                    className="text-xs text-wbk-black hover:text-wbk-gold underline font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <IconBell size={13} className="text-wbk-gold" />
                    {t("waitlist.joinWaitlist", "Join Waitlist")}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 pt-1.5">
                  <span className="w-2 h-2 rounded-full bg-wbk-green shrink-0" />
                  <span className="text-xs font-semibold text-wbk-green tracking-tight">
                    {t("common.inStock", "In Stock • Fast Dispatch")}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start w-full">
            {/* ── LEFT COLUMN: PRODUCT CUSTOMIZATION CONTROLS (Order 2 on mobile, Column 1 on desktop) ── */}
            <div
              ref={leftColRef}
              className="order-2 lg:order-1 lg:col-span-3 flex flex-col justify-start space-y-5 lg:space-y-6 pr-1 pointer-events-auto"
            >
              {/* Desktop Breadcrumbs & Title (hidden on mobile) */}
              <div className="hidden lg:block space-y-3">
                <nav className="flex items-center gap-1.5 text-[11px] font-poppins text-wbk-brown/80">
                  <Link
                    href={localizedHref ? localizedHref("/products") : "/products"}
                    className="hover:text-wbk-black transition-colors"
                  >
                    {t("nav.allWallBeds", "Products")}
                  </Link>
                  <span>/</span>
                  <Link
                    href={localizedHref ? localizedHref(`/products/${categorySlug}`) : `/products/${categorySlug}`}
                    className="capitalize hover:text-wbk-black transition-colors"
                  >
                    {categorySlug.replace("-", " ")}
                  </Link>
                </nav>

                <div className="space-y-1">
                  <h1 className="font-new-york text-3xl xl:text-4xl text-wbk-black leading-tight tracking-tight">
                    {localizedProductName}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-poppins text-wbk-brown">
                    <span>{formatSizeLabel(productSize)}</span>
                    {displayProduct?.sku && (
                      <span className="inline-flex items-center px-1.5 py-0.5 font-mono text-[11px] bg-[#F4F2F0] text-wbk-black border border-wbk-lightgrey/60">
                        SKU: {displayProduct.sku}
                      </span>
                    )}
                    {displayProduct?.weight && (
                      <span className="inline-flex items-center px-1.5 py-0.5 text-[11px] bg-[#F4F2F0] text-wbk-black border border-wbk-lightgrey/60">
                        {formatWeight(displayProduct.weight)}
                      </span>
                    )}
                    {has3D && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-wbk-green/30 text-wbk-black font-semibold text-[10px]">
                        3D View
                      </span>
                    )}
                  </div>

                  {/* Product Tags (Desktop) */}
                  {Array.isArray(displayProduct?.tags) &&
                    displayProduct.tags.length > 0 && (
                      <div className="flex items-center gap-2 pt-2 flex-wrap">
                        {displayProduct.tags.map((tId) => (
                          <TagBadge
                            key={tId}
                            tagIdOrSlug={tId}
                            locale={locale}
                            variant="pdp"
                          />
                        ))}
                      </div>
                    )}
                  {isOutOfStock ? (
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-wbk-gold/15 border border-wbk-gold/50 text-wbk-gold text-xs font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-wbk-gold animate-pulse" />
                        {t(
                          "waitlist.currentlyOutOfStock",
                          "Currently Out of Stock",
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsWaitlistModalOpen(true)}
                        className="text-xs text-wbk-black hover:text-wbk-gold underline font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <IconBell size={13} className="text-wbk-gold" />
                        {t(
                          "waitlist.joinWaitlistBtn",
                          "Join Waitlist / Notify Me",
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 pt-2">
                      <span className="w-2 h-2 rounded-full bg-wbk-green shrink-0" />
                      <span className="text-xs font-semibold text-wbk-green tracking-tight">
                        {t("common.inStock", "In Stock • Fast Dispatch")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Dropdowns */}
              <div className="space-y-3" ref={dropdownsRef}>
                {/* Format / Orientation */}
                {availableFormats.length > 0 && (
                  <div className="relative">
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-wbk-brown mb-1 font-poppins">
                      {t("product.formatLabel", "Format:")}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setFormatOpen(!formatOpen);
                        setStyleOpen(false);
                        setSizeOpen(false);
                        setColorOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 border border-wbk-black/40 rounded-full text-xs font-semibold text-wbk-black bg-white/70 hover:bg-white backdrop-blur-xs transition-all duration-200 cursor-pointer"
                    >
                      <span>{productFormat}</span>
                      <IconChevronDown size={14} className="text-wbk-brown" />
                    </button>
                    {formatOpen && (
                      <div className="absolute left-0 right-0 mt-1 bg-white/95 backdrop-blur-md border border-wbk-lightgrey rounded-xl lg:rounded-none  z-50 overflow-hidden text-xs py-1">
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
                      {activeProduct?.parent_category === "cabinets"
                        ? t("product.cabinetType", "Cabinet Type:")
                        : t("product.styleLabel", "Style:")}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setStyleOpen(!styleOpen);
                        setFormatOpen(false);
                        setSizeOpen(false);
                        setColorOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 border border-wbk-black/40 rounded-full text-xs font-semibold text-wbk-black bg-white/70 hover:bg-white backdrop-blur-xs transition-all duration-200 cursor-pointer"
                    >
                      <span>{productStyle}</span>
                      <IconChevronDown size={14} className="text-wbk-brown" />
                    </button>
                    {styleOpen && (
                      <div className="absolute left-0 right-0 mt-1 bg-white/95 backdrop-blur-md border border-wbk-lightgrey rounded-xl lg:rounded-none shadow-lg z-50 overflow-hidden text-xs py-1">
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

                {/* Color / Finish Selector */}
                {availableColors.length > 1 && (
                  <div className="relative">
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-wbk-brown mb-1 font-poppins">
                      {t("product.colorLabel", "Finish / Colour:")}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setColorOpen(!colorOpen);
                        setFormatOpen(false);
                        setStyleOpen(false);
                        setSizeOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 border border-wbk-black/40 rounded-full text-xs font-semibold text-wbk-black bg-white/70 hover:bg-white backdrop-blur-xs transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 truncate">
                        {(() => {
                          const currentColor =
                            selectedVariant?.color ||
                            activeProduct?.color ||
                            availableColors[0];
                          const colorHexMap = {
                            Oak: "#BCA37F",
                            Beech: "#D8AC78",
                            Pine: "#E8CE9B",
                            White: "#FFFFFF",
                            Black: "#090A0A",
                            Beige: "#D2AA7C",
                            Grey: "#A5988E",
                          };
                          const hex = colorHexMap[currentColor] || "#BCA37F";
                          return (
                            <>
                              <span
                                className={`w-3.5 h-3.5 rounded-full border shrink-0 ${
                                  currentColor === "White"
                                    ? "border-black/30"
                                    : "border-black/20"
                                }`}
                                style={{ backgroundColor: hex }}
                              />
                              <span className="truncate">{currentColor}</span>
                            </>
                          );
                        })()}
                      </div>
                      <IconChevronDown size={14} className="text-wbk-brown shrink-0 ml-1" />
                    </button>
                    {colorOpen && (
                      <div className="absolute left-0 right-0 mt-1 bg-white/95 backdrop-blur-md border border-wbk-lightgrey rounded-xl lg:rounded-none shadow-lg z-50 overflow-hidden text-xs py-1">
                        {availableColors.map((colorName) => {
                          const currentColor =
                            selectedVariant?.color ||
                            activeProduct?.color ||
                            availableColors[0];
                          const isSelected =
                            currentColor?.toLowerCase() === colorName.toLowerCase();
                          const colorHexMap = {
                            Oak: "#BCA37F",
                            Beech: "#D8AC78",
                            Pine: "#E8CE9B",
                            White: "#FFFFFF",
                            Black: "#090A0A",
                            Beige: "#D2AA7C",
                            Grey: "#A5988E",
                          };
                          const hex = colorHexMap[colorName] || "#BCA37F";
                          return (
                            <button
                              key={colorName}
                              type="button"
                              onClick={() => {
                                handleColorChange(colorName);
                                setColorOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2 hover:bg-wbk-lightgrey/30 font-medium transition-colors flex items-center justify-between cursor-pointer ${
                                isSelected
                                  ? "text-wbk-gold font-semibold bg-[#F4F2F0]/60"
                                  : "text-wbk-black"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span
                                  className={`w-3.5 h-3.5 rounded-full border shrink-0 ${
                                    colorName === "White"
                                      ? "border-black/30"
                                      : "border-black/20"
                                  }`}
                                  style={{ backgroundColor: hex }}
                                />
                                <span>{colorName}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Size */}
                {availableSizes.length > 0 && (
                  <div className="relative">
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-wbk-brown mb-1 font-poppins">
                      {t("product.sizeLabel", "Size:")}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setSizeOpen(!sizeOpen);
                        setFormatOpen(false);
                        setStyleOpen(false);
                        setColorOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 border border-wbk-black/40 rounded-full text-xs font-semibold text-wbk-black bg-white/70 hover:bg-white backdrop-blur-xs transition-all duration-200 cursor-pointer"
                    >
                      <span className="truncate">
                        {formatSizeLabel(productSize) ||
                          formatSizeLabel(availableSizes[0]?.label)}
                      </span>
                      <IconChevronDown
                        size={14}
                        className="text-wbk-brown shrink-0 ml-1"
                      />
                    </button>
                    {sizeOpen && (
                      <div className="absolute left-0 right-0 mt-1 bg-white/95 backdrop-blur-md border border-wbk-lightgrey rounded-xl lg:rounded-none shadow-lg z-50 overflow-y-auto max-h-56 text-xs py-1">
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
                            className={`w-full text-left px-3 py-2 text-xs hover:bg-[#F4F2F0] transition-colors flex items-center justify-between cursor-pointer ${
                              productSize === item.label
                                ? "font-semibold text-wbk-black bg-[#F4F2F0]/60"
                                : "text-wbk-brown"
                            }`}
                          >
                            <span>{formatSizeLabel(item.label)}</span>
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
                      {t("common.frontSofa", "+ Sofa")}:
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

              {/* ── DESKTOP ADD TO CART & PRICING BLOCK (Desktop only, hidden on mobile) ── */}
              <div
                ref={desktopAddToCartRef}
                className="hidden lg:block pt-3 pb-2 border-y border-wbk-lightgrey/50 space-y-3 font-poppins"
              >
                {/* Total Price Display */}
                <div className="flex items-baseline justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-wbk-brown font-semibold block">
                      {t("common.price", "Price")}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl xl:text-3xl font-bold text-wbk-black tracking-tight">
                        {formatPrice(totalDecimal, locale)}
                      </span>
                      {productPricing.isOnSale && (
                        <span className="text-xs text-wbk-brown/70 line-through font-normal">
                          {formatPrice(
                            productPricing.regularRaw + sofaSurcharge,
                            locale,
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {productPricing.isOnSale && (
                    <span className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold uppercase tracking-wider rounded">
                      {t("product.sale", "Sale")}
                    </span>
                  )}
                </div>

                {/* Desktop CTA Button */}
                {isOutOfStock ? (
                  <button
                    type="button"
                    onClick={() => setIsWaitlistModalOpen(true)}
                    className="w-full py-3 px-5 bg-wbk-gold hover:bg-wbk-black text-wbk-black hover:text-white border border-wbk-gold hover:border-wbk-black text-xs font-semibold uppercase tracking-widest rounded-full transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer group"
                  >
                    <IconBell
                      size={16}
                      className="animate-bounce text-wbk-black group-hover:text-white transition-colors"
                    />
                    <span>
                      {t("waitlist.joinWaitlistBtn", "Join Waitlist / Notify Me")}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    title={
                      isAdded
                        ? t("common.addedToCart", "Added to Cart!")
                        : t("common.addToCart", "Add to Cart")
                    }
                    className={`w-full py-3.5 px-6 border text-xs font-semibold uppercase tracking-widest rounded-full transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                      isAdded
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "bg-wbk-black hover:bg-wbk-green hover:text-wbk-black text-white border-wbk-black hover:border-wbk-green"
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <IconCheck size={18} className="text-white" />
                        <span>{t("common.addedToCart", "Added to Cart!")}</span>
                      </>
                    ) : (
                      <>
                        <IconShoppingCart
                          size={18}
                          className="transition-transform duration-200 group-hover:scale-110"
                        />
                        <span>{t("common.addToCart", "Add to Cart")}</span>
                      </>
                    )}
                  </button>
                )}

                {/* Micro Guarantee / Delivery Note */}
                <div className="flex items-center justify-between text-[11px] text-wbk-brown pt-0.5">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-wbk-green shrink-0" />
                    <span>
                      {isOutOfStock
                        ? t("common.restockSoon", "Restock in progress")
                        : t("common.freeDelivery", "Free UK/EU Delivery")}
                    </span>
                  </span>
                  <span className="text-[11px] font-medium text-wbk-brown/80">
                    {displayProduct?.warranty || "5-Year Guarantee"}
                  </span>
                </div>
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
            <div
              style={{
                height: isDesktop && leftColHeight ? `${leftColHeight}px` : undefined,
                maxHeight: isDesktop && leftColHeight ? `${leftColHeight}px` : undefined,
              }}
              className="order-1 lg:order-2 lg:col-span-7 flex flex-col items-center justify-center w-full relative pointer-events-none self-center"
            >
              {has3D ? (
                /* 3D Mode Canvas Container - Mobilon keretes kártya, Asztalin keret nélküli tiszta háttér */
                <div
                  style={{
                    height: isDesktop && leftColHeight ? `${leftColHeight}px` : undefined,
                  }}
                  className="relative w-full h-[360px] sm:h-[450px] lg:h-full bg-[#F8F7F5] lg:bg-transparent border border-wbk-lightgrey/50 lg:border-none rounded-2xl lg:rounded-none overflow-hidden lg:overflow-visible flex items-center justify-center shadow-xs lg:shadow-none pointer-events-auto"
                >
                  {mounted && ready && (
                    <ConfiguratorCanvas
                      key={`${categorySlug}-${productSlug}-${displayProduct.slug}`}
                      isFolded={isFolded}
                      sofaIncluded={sofaIncluded}
                    />
                  )}

                  {/* 3D Mode Top Controls */}
                  <div className="absolute top-4 lg:top-2 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 pointer-events-auto">
                    <button
                      type="button"
                      onClick={() => setIsFolded(!isFolded)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-wbk-black text-wbk-white hover:bg-wbk-green hover:text-wbk-black text-[10px] font-semibold uppercase tracking-wider rounded-full shadow-lg transition-all duration-300 cursor-pointer"
                    >
                      <IconArrowsUpDown size={13} className="animate-pulse" />
                      {isFolded
                        ? t("home.openBed", "Open Bed")
                        : t("home.closeBed", "Close Bed")}
                    </button>
                    <p className="text-[10px] text-wbk-brown/70 font-poppins select-none pointer-events-none">
                      {t("home.dragToRotate", "← Drag to rotate 3D view →")}
                    </p>
                  </div>
                </div>
              ) : (
                /* Non-3D Mode: High-Impact Center Main Image */
                <div className="relative w-full h-full flex flex-col items-center justify-center p-0 lg:p-2 sm:p-4 pointer-events-auto">
                  <div
                    onClick={() => setLightboxIndex(selectedImageIndex)}
                    className="relative group w-full lg:h-full aspect-[4/3] lg:aspect-auto sm:aspect-[16/11] lg:bg-transparent bg-[#F4F2F0]/80 lg:border-0 border border-wbk-lightgrey/60 overflow-hidden flex items-center justify-center p-2 sm:p-4 cursor-zoom-in transition-all duration-300"
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
                        className={`max-h-full max-w-full object-contain filter drop-shadow-xs select-none transition-transform duration-300 ${
                          currentMainImage?.src?.includes("MORPHY")
                            ? "scale-[1.2] group-hover:scale-[1.3]"
                            : "scale-100 group-hover:scale-105"
                        }`}
                      />
                    </AnimatePresence>

                    <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-wbk-black/80 text-white rounded-full text-[10px] font-poppins font-medium uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-xs lg:shadow-none shadow-md">
                      <IconZoomIn size={13} />
                      <span>{t("product.clickToZoom", "Click to zoom")}</span>
                    </div>

                    <div className="absolute top-4 left-4 flex items-center gap-1 px-2.5 py-1 bg-white/80 text-wbk-black rounded-full text-[10px] font-poppins font-semibold border border-wbk-lightgrey/60 backdrop-blur-xs shadow-2xs lg:shadow-none shadow-md">
                      <IconPhoto size={12} className="text-wbk-brown" />
                      <span>
                        {selectedImageIndex + 1} / {galleryImages.length}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── MOBILE GALLERY HORIZONTAL ROW (visible on < lg) ── */}
              <div className="w-full lg:hidden mt-3 pointer-events-auto">
                <div className="flex items-center justify-between pb-1.5">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-wbk-brown font-poppins">
                    {t("product.gallery", "Gallery")} ({galleryImages.length})
                  </p>
                  <span className="text-[10px] text-wbk-brown/70 font-poppins">
                    {has3D
                      ? t("product.clickToZoom", "Tap photo to zoom")
                      : t("product.selectView", "Select view")}
                  </span>
                </div>

                <div className="relative w-full">
                  {/* Left Arrow Button */}
                  <div
                    className={`absolute -left-2 sm:left-0 top-1/2 -translate-y-1/2 z-30 transition-all duration-200 ${
                      isMobileGalleryBeginning
                        ? "opacity-0 pointer-events-none scale-90"
                        : "opacity-100 scale-100"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        mobileGallerySwiper?.slidePrev();
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-wbk-green text-wbk-black shadow-md hover:bg-wbk-black hover:text-wbk-white transition-all duration-200 cursor-pointer"
                      aria-label="Previous gallery image"
                    >
                      <IconChevronLeft size={15} stroke={2.5} />
                    </button>
                  </div>

                  {/* Left gradient fade - extends to screen edge */}
                  <div
                    style={{
                      background:
                        "linear-gradient(to right, #FFFFFF 0%, #FFFFFF 40%, rgba(255, 255, 255, 0.85) 70%, rgba(255, 255, 255, 0) 100%)",
                    }}
                    className={`absolute -left-4 sm:-left-6 lg:-left-8 -top-1 -bottom-1 w-24 sm:w-28 pointer-events-none z-20 transition-opacity duration-200 ${
                      isMobileGalleryBeginning ? "opacity-0" : "opacity-100"
                    }`}
                  />

                  <Swiper
                    modules={[FreeMode]}
                    slidesPerView="auto"
                    spaceBetween={10}
                    freeMode={{ enabled: true, momentumRatio: 0.75 }}
                    onSwiper={(swiper) => {
                      setMobileGallerySwiper(swiper);
                      setIsMobileGalleryBeginning(swiper.isBeginning);
                      setIsMobileGalleryEnd(swiper.isEnd);
                    }}
                    onSlideChange={(swiper) => {
                      setIsMobileGalleryBeginning(swiper.isBeginning);
                      setIsMobileGalleryEnd(swiper.isEnd);
                    }}
                    onReachBeginning={() => setIsMobileGalleryBeginning(true)}
                    onReachEnd={() => setIsMobileGalleryEnd(true)}
                    onFromEdge={() => {
                      if (mobileGallerySwiper) {
                        setIsMobileGalleryBeginning(
                          mobileGallerySwiper.isBeginning,
                        );
                        setIsMobileGalleryEnd(mobileGallerySwiper.isEnd);
                      }
                    }}
                    className="w-full !overflow-visible py-1"
                  >
                    {galleryImages.map((img, idx) => {
                      const isSelected = !has3D && idx === selectedImageIndex;
                      return (
                        <SwiperSlide key={idx} className="!w-auto">
                          <button
                            type="button"
                            onClick={() => {
                              if (has3D) {
                                setLightboxIndex(idx);
                              } else {
                                setSelectedImageIndex(idx);
                              }
                            }}
                            className={`relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 overflow-hidden bg-[#F4F2F0] border transition-all duration-200 cursor-pointer p-1 block ${
                              isSelected
                                ? "border-wbk-black ring-2 ring-wbk-black/80 shadow-xs scale-[0.98]"
                                : "border-wbk-lightgrey/80 hover:border-wbk-black/60 opacity-85 hover:opacity-100"
                            }`}
                          >
                            <img
                              src={img.src}
                              alt={img.alt}
                              className={`w-full h-full object-contain object-center rounded-none ${
                                img.src?.includes("MORPHY")
                                  ? "scale-[1.22]"
                                  : "scale-100"
                              }`}
                            />
                            {isSelected && (
                              <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-wbk-green ring-2 ring-white" />
                            )}
                          </button>
                        </SwiperSlide>
                      );
                    })}
                  </Swiper>

                  {/* Right gradient fade - extends to screen edge */}
                  <div
                    style={{
                      background:
                        "linear-gradient(to left, #FFFFFF 0%, #FFFFFF 40%, rgba(255, 255, 255, 0.85) 70%, rgba(255, 255, 255, 0) 100%)",
                    }}
                    className={`absolute -right-4 sm:-right-6 lg:-right-8 -top-1 -bottom-1 w-24 sm:w-28 pointer-events-none z-20 transition-opacity duration-200 ${
                      isMobileGalleryEnd ? "opacity-0" : "opacity-100"
                    }`}
                  />

                  {/* Right Arrow Button */}
                  <div
                    className={`absolute -right-2 sm:right-0 top-1/2 -translate-y-1/2 z-30 transition-all duration-200 ${
                      isMobileGalleryEnd
                        ? "opacity-0 pointer-events-none scale-90"
                        : "opacity-100 scale-100"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        mobileGallerySwiper?.slideNext();
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-wbk-green text-wbk-black shadow-md hover:bg-wbk-black hover:text-wbk-white transition-all duration-200 cursor-pointer"
                      aria-label="Next gallery image"
                    >
                      <IconChevronRight size={15} stroke={2.5} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT COLUMN: VERTICAL STEP-SCROLLING GALLERY (Desktop Only, hidden on mobile) ── */}
            <div
              style={{
                height: isDesktop && leftColHeight ? `${leftColHeight}px` : undefined,
                maxHeight: isDesktop && leftColHeight ? `${leftColHeight}px` : undefined,
              }}
              className="hidden lg:flex lg:col-span-2 lg:order-3 flex-col justify-between overflow-hidden pointer-events-auto"
            >
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
                  <div
                    className={`transition-all duration-200 py-1 shrink-0 flex items-center justify-center w-full ${
                      !canScrollUp
                        ? "opacity-0 pointer-events-none scale-90"
                        : "opacity-100 scale-100"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleScrollGallery("up")}
                      disabled={!canScrollUp}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-wbk-green text-wbk-black shadow-md hover:bg-wbk-black hover:text-wbk-white transition-all duration-200 cursor-pointer disabled:opacity-0 disabled:pointer-events-none"
                      aria-label="Previous gallery image"
                    >
                      <IconChevronUp size={15} stroke={2.5} />
                    </button>
                  </div>

                  {/* Vertical Scroll Container with top & bottom fade gradients */}
                  <div className="relative w-full flex-1 min-h-0 overflow-hidden">
                    {/* Top gradient fade */}
                    <div
                      style={{
                        background:
                          "linear-gradient(to bottom, #FFFFFF 0%, #FFFFFF 35%, rgba(255, 255, 255, 0) 100%)",
                      }}
                      className={`absolute left-0 right-0 top-0 h-6 pointer-events-none z-10 transition-opacity duration-200 ${
                        canScrollUp ? "opacity-100" : "opacity-0"
                      }`}
                    />

                    <div
                      ref={galleryContainerRef}
                      onScroll={updateScrollButtons}
                      className="w-full h-full overflow-y-auto custom-scrollbar flex flex-col items-center gap-2.5 py-1 pr-0.5"
                    >
                      {galleryImages.map((img, idx) => {
                        const isSelected = !has3D && idx === selectedImageIndex;
                        return (
                          <div
                            key={idx}
                            data-gallery-card
                            className="w-full max-w-[130px] xl:max-w-[140px] aspect-square shrink-0 mx-auto"
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
                              className={`relative w-full h-full aspect-square rounded-none overflow-hidden bg-[#F4F2F0] border transition-all duration-200 group cursor-pointer focus:outline-none flex items-center justify-center p-1.5 ${
                                isSelected
                                  ? "border-wbk-black ring-2 ring-wbk-black/80 shadow-xs opacity-100 scale-[0.98]"
                                  : "border-wbk-lightgrey/80 hover:border-wbk-black/60 opacity-85 hover:opacity-100"
                              }`}
                            >
                              <img
                                src={img.src}
                                alt={img.alt}
                                className={`w-full h-full object-contain object-center rounded-none group-hover:scale-110 transition-transform duration-300 ${
                                  img.src?.includes("MORPHY")
                                    ? "scale-[1.22]"
                                    : "scale-100"
                                }`}
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

                    {/* Bottom gradient fade */}
                    <div
                      style={{
                        background:
                          "linear-gradient(to top, #FFFFFF 0%, #FFFFFF 35%, rgba(255, 255, 255, 0) 100%)",
                      }}
                      className={`absolute left-0 right-0 bottom-0 h-6 pointer-events-none z-10 transition-opacity duration-200 ${
                        canScrollDown ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </div>

                  {/* Down Arrow */}
                  <div
                    className={`transition-all duration-200 py-1 shrink-0 flex items-center justify-center w-full ${
                      !canScrollDown
                        ? "opacity-0 pointer-events-none scale-90"
                        : "opacity-100 scale-100"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleScrollGallery("down")}
                      disabled={!canScrollDown}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-wbk-green text-wbk-black shadow-md hover:bg-wbk-black hover:text-wbk-white transition-all duration-200 cursor-pointer disabled:opacity-0 disabled:pointer-events-none"
                      aria-label="Next gallery image"
                    >
                      <IconChevronDown size={15} stroke={2.5} />
                    </button>
                  </div>
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
              {locale === "en" || locale === "us" ? "4.9" : "4,9"}
            </div>
            <div className="space-y-1">
              <div className="text-[#D2AA7C] text-xl tracking-wider select-none">
                ★★★★★
              </div>
              <div className="text-[11px] text-wbk-brown font-poppins">
                {t("reviews.ratedByCount", "Rated by")}{" "}
                <span className="font-semibold text-wbk-black">
                  742 {t("reviews.buyers", "buyers")}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("reviews")}
              className="px-5 py-2.5 bg-[#9A9A8C] hover:bg-wbk-black text-white text-[10px] font-semibold uppercase tracking-widest rounded-full transition-all duration-300 shadow-sm cursor-pointer"
            >
              {t("reviews.writeReview", "Write a review")}
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
                  {t("reviews.recommendedRate", "proportion recommended by our users")}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-none bg-[#A3A48C]/10 text-[#A3A48C] flex items-center justify-center text-xs shrink-0 mt-0.5 select-none font-bold">
                ⚙
              </div>
              <div>
                <div className="font-semibold text-wbk-black text-sm">
                  {locale === "en" || locale === "us" ? "0.06%" : "0,06%"}
                </div>
                <div className="text-wbk-brown text-[11px] leading-relaxed">
                  {t("reviews.warrantyClaimRate", "extremely low warranty claim rate")}
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
                  {t("reviews.writtenEvaluations", "written customer evaluations")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ── TABS NAVIGATION SECTION ── */}
      <section id="product-tabs" className="relative z-20 bg-white py-16">
        <Container size="xl">
          <div className="relative border-b border-wbk-lightgrey/40 mb-12">
            {/* Left Arrow (visible on mobile when scrolled) */}
            <div
              className={`md:hidden absolute -left-2 sm:left-0 top-1/2 -translate-y-1/2 z-30 transition-all duration-200 ${
                isTabsBeginning
                  ? "opacity-0 pointer-events-none scale-90"
                  : "opacity-100 scale-100"
              }`}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  tabsSwiper?.slidePrev();
                }}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-wbk-green text-wbk-black shadow-md hover:bg-wbk-black hover:text-wbk-white transition-all duration-200 cursor-pointer"
                aria-label="Scroll tabs left"
              >
                <IconChevronLeft size={15} stroke={2.5} />
              </button>
            </div>

            {/* Left gradient fade (mobile) - extends to screen edge */}
            <div
              style={{
                background:
                  "linear-gradient(to right, #FFFFFF 0%, #FFFFFF 40%, rgba(255, 255, 255, 0.85) 70%, rgba(255, 255, 255, 0) 100%)",
              }}
              className={`md:hidden absolute -left-4 sm:-left-6 top-0 bottom-0 w-12 sm:w-12 pointer-events-none z-20 transition-opacity duration-200 ${
                isTabsBeginning ? "opacity-0" : "opacity-100"
              }`}
            />

            <Swiper
              modules={[FreeMode]}
              slidesPerView="auto"
              freeMode={{ enabled: true, momentumRatio: 0.75 }}
              onSwiper={(swiper) => {
                setTabsSwiper(swiper);
                setIsTabsBeginning(swiper.isBeginning);
                setIsTabsEnd(swiper.isEnd);
              }}
              onSlideChange={(swiper) => {
                setIsTabsBeginning(swiper.isBeginning);
                setIsTabsEnd(swiper.isEnd);
              }}
              onReachBeginning={() => setIsTabsBeginning(true)}
              onReachEnd={() => setIsTabsEnd(true)}
              onFromEdge={() => {
                if (tabsSwiper) {
                  setIsTabsBeginning(tabsSwiper.isBeginning);
                  setIsTabsEnd(tabsSwiper.isEnd);
                }
              }}
              className="tabs-swiper w-full !overflow-visible flex items-center"
            >
              {[
                {
                  id: "description",
                  label: t("product.tab_description", "Description"),
                },
                {
                  id: "media",
                  label: t("product.tab_media", "Photos & Videos"),
                },
                {
                  id: "support",
                  label: t("product.tab_support", "Support & Guides"),
                },
                { id: "reviews", label: t("product.tab_reviews", "Reviews") },
              ].map((tab) => (
                <SwiperSlide key={tab.id} className="!w-auto">
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative py-4 px-4 sm:px-6 font-poppins text-xs sm:text-sm font-medium tracking-wide uppercase transition-all duration-300 cursor-pointer whitespace-nowrap ${
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
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                  </button>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Right gradient fade (mobile) - extends to screen edge */}
            <div
              style={{
                background:
                  "linear-gradient(to left, #FFFFFF 0%, #FFFFFF 40%, rgba(255, 255, 255, 0.85) 70%, rgba(255, 255, 255, 0) 100%)",
              }}
              className={`md:hidden absolute -right-4 sm:-right-6 top-0 bottom-0 w-12 sm:w-12 pointer-events-none z-20 transition-opacity duration-200 ${
                isTabsEnd ? "opacity-0" : "opacity-100"
              }`}
            />

            {/* Right Arrow (visible on mobile when not at end) */}
            <div
              className={`md:hidden absolute -right-2 sm:right-0 top-1/2 -translate-y-1/2 z-30 w-12 sm:w-12 transition-all duration-200 ${
                isTabsEnd
                  ? "opacity-0 pointer-events-none scale-90"
                  : "opacity-100 scale-100"
              }`}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  tabsSwiper?.slideNext();
                }}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-wbk-green text-wbk-black shadow-md hover:bg-wbk-black hover:text-wbk-white transition-all duration-200 cursor-pointer"
                aria-label="Scroll tabs right"
              >
                <IconChevronRight size={15} stroke={2.5} />
              </button>
            </div>
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
                    {t("product.aboutProduct", "About")} {localizedProductName}
                  </h3>
                  <p className="font-poppins text-sm leading-relaxed text-wbk-black/80">
                    {displayProduct.description ||
                      "The Morphy Wall Bed is a flexible modular sleeping system designed to adapt to changing spaces and needs."}
                  </p>
                  {displayProduct.extended_description && (
                    <p className="font-poppins text-sm leading-relaxed text-wbk-black/75">
                      {displayProduct.extended_description}
                    </p>
                  )}
                  <ul className="space-y-3 font-poppins text-xs text-wbk-brown">
                    {productFeatures.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-none bg-wbk-gold shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-[#F4F2F0]/60 p-8 rounded-none border border-wbk-lightgrey/40">
                  <h4 className="font-poppins font-semibold text-xs uppercase tracking-wider text-wbk-black mb-6">
                    {t("product.specifications", "Technical Specifications")}
                  </h4>
                  <table className="w-full text-xs font-poppins text-wbk-black/80 space-y-3">
                    <tbody>
                      {displayProduct.sku && (
                        <tr className="border-b border-wbk-lightgrey/40">
                          <td className="py-2.5 font-medium">
                            {t("product.sku", "SKU / Model")}
                          </td>
                          <td className="py-2.5 text-right font-mono font-medium text-wbk-black">
                            {displayProduct.sku}
                          </td>
                        </tr>
                      )}
                      {currentEan && (
                        <tr className="border-b border-wbk-lightgrey/40">
                          <td className="py-2.5 font-medium">
                            {locale === "us"
                              ? t("product.barcodeUs", "GTIN / UPC")
                              : t("product.barcode", "Barcode (GTIN / EAN)")}
                          </td>
                          <td className="py-2.5 text-right font-mono text-wbk-brown">
                            {currentEan}
                          </td>
                        </tr>
                      )}
                      {displayProduct.weight && (
                        <tr className="border-b border-wbk-lightgrey/40">
                          <td className="py-2.5 font-medium">
                            {t("product.weight", "Net Weight")}
                          </td>
                          <td className="py-2.5 text-right text-wbk-brown">
                            {formatWeight(displayProduct.weight)}
                          </td>
                        </tr>
                      )}
                      {(displayProduct.pack_1 ||
                        displayProduct.package_dimensions) && (
                        <tr className="border-b border-wbk-lightgrey/40">
                          <td className="py-2.5 font-medium align-top">
                            {t("product.packaging", "Packaging (Boxes)")}
                          </td>
                          <td className="py-2.5 text-right text-wbk-brown">
                            {displayProduct.pack_1 ? (
                              <div className="space-y-0.5 text-xs font-mono">
                                <div>
                                  {t("product.box", "Box")} 1:{" "}
                                  {formatSizeLabel(
                                    displayProduct.pack_1,
                                    locale,
                                  )}
                                </div>
                                {displayProduct.pack_2 && (
                                  <div>
                                    {t("product.box", "Box")} 2:{" "}
                                    {formatSizeLabel(
                                      displayProduct.pack_2,
                                      locale,
                                    )}
                                  </div>
                                )}
                                {displayProduct.pack_3 && (
                                  <div>
                                    {t("product.box", "Box")} 3:{" "}
                                    {formatSizeLabel(
                                      displayProduct.pack_3,
                                      locale,
                                    )}
                                  </div>
                                )}
                                {displayProduct.pack_4 && (
                                  <div>
                                    {t("product.box", "Box")} 4:{" "}
                                    {formatSizeLabel(
                                      displayProduct.pack_4,
                                      locale,
                                    )}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span>
                                {formatSizeLabel(
                                  displayProduct.package_dimensions,
                                  locale,
                                )}
                              </span>
                            )}
                          </td>
                        </tr>
                      )}

                      {/* Bed-Specific: Mechanism */}
                      {displayProduct.parent_category === "beds" && (
                        <tr className="border-b border-wbk-lightgrey/40">
                          <td className="py-2.5 font-medium">
                            {t("product.mechanism", "Mechanism")}
                          </td>
                          <td className="py-2.5 text-right text-wbk-brown">
                            {t("product.gasPistonVal", "Gas Piston Cylinder System")}
                          </td>
                        </tr>
                      )}

                      {/* Cabinet-Specific: Material, Door Opening, Assembly */}
                      {displayProduct.parent_category === "cabinets" && (
                        <>
                          <tr className="border-b border-wbk-lightgrey/40">
                            <td className="py-2.5 font-medium">Material</td>
                            <td className="py-2.5 text-right text-wbk-brown">
                              {displayProduct.material || "Melamine-faced furniture board"}
                            </td>
                          </tr>
                          <tr className="border-b border-wbk-lightgrey/40">
                            <td className="py-2.5 font-medium">Door Opening</td>
                            <td className="py-2.5 text-right text-wbk-brown">
                              {displayProduct.door_opening ||
                                (displayProduct.sub_category === "Vertical"
                                  ? "170 degrees opening"
                                  : displayProduct.sub_category === "Horizontal"
                                  ? "90 degrees opening"
                                  : displayProduct.sub_category === "Side Units"
                                  ? "90 degrees opening / Open shelving"
                                  : "Top overhead clearance")}
                            </td>
                          </tr>
                          <tr className="border-b border-wbk-lightgrey/40">
                            <td className="py-2.5 font-medium">Assembly</td>
                            <td className="py-2.5 text-right text-wbk-brown">
                              {displayProduct.assembly || "Flat-packed for easy assembly"}
                            </td>
                          </tr>
                        </>
                      )}

                      {/* Mattress-Specific: Thickness, Construction, Comfort Layer, Trial */}
                      {displayProduct.parent_category === "mattresses" && (
                        <>
                          <tr className="border-b border-wbk-lightgrey/40">
                            <td className="py-2.5 font-medium">Mattress Depth / Profile</td>
                            <td className="py-2.5 text-right text-wbk-brown">
                              {displayProduct.thickness ||
                                (displayProduct.sub_category === "Comfort"
                                  ? "8” (20cm)"
                                  : "10” (25cm)")}
                            </td>
                          </tr>
                          <tr className="border-b border-wbk-lightgrey/40">
                            <td className="py-2.5 font-medium">Comfort Layer</td>
                            <td className="py-2.5 text-right text-wbk-brown">
                              {displayProduct.sub_category === "Comfort"
                                ? "2” Memory Foam Layer"
                                : displayProduct.sub_category === "Luxury"
                                ? "3” Memory Foam Layer"
                                : "Memory Foam + Motion Isolation Technology™"}
                            </td>
                          </tr>
                          <tr className="border-b border-wbk-lightgrey/40">
                            <td className="py-2.5 font-medium">Core Construction</td>
                            <td className="py-2.5 text-right text-wbk-brown">
                              {displayProduct.sub_category === "Comfort"
                                ? "High-Density Foam Support Base"
                                : displayProduct.sub_category === "Luxury"
                                ? "High-Resilience Reflex Foam Base"
                                : "1,500 Individual Pocket Springs"}
                            </td>
                          </tr>
                          <tr className="border-b border-wbk-lightgrey/40">
                            <td className="py-2.5 font-medium">Trial Period</td>
                            <td className="py-2.5 text-right text-wbk-brown">
                              30-Day Money Back Guarantee
                            </td>
                          </tr>
                        </>
                      )}

                      {/* Dimensions for Beds and Mattresses */}
                      {displayProduct.width && displayProduct.parent_category !== "cabinets" && (
                        <tr className="border-b border-wbk-lightgrey/40">
                          <td className="py-2.5 font-medium">
                            {t("product.mattressSize", "Mattress Size (W x L)")}
                          </td>
                          <td className="py-2.5 text-right text-wbk-brown">
                            {isUS
                              ? `${Math.round(displayProduct.width / 25.4)}" x ${Math.round((displayProduct.length || 2000) / 25.4)}" (${displayProduct.width / 10} x ${displayProduct.length ? displayProduct.length / 10 : 200} cm)`
                              : `${displayProduct.width / 10} x ${displayProduct.length ? displayProduct.length / 10 : 200} cm`}
                          </td>
                        </tr>
                      )}

                      {/* Cabinet Dimensions */}
                      {displayProduct.parent_category === "cabinets" && displayProduct.width && (
                        <tr className="border-b border-wbk-lightgrey/40">
                          <td className="py-2.5 font-medium">Cabinet Dimensions (H x W x D)</td>
                          <td className="py-2.5 text-right text-wbk-brown">
                            {displayProduct.height && displayProduct.length
                              ? `H${displayProduct.height / 10}cm x W${displayProduct.width / 10}cm x D${displayProduct.length / 10}cm`
                              : `${formatCm(displayProduct.width / 10)}`}
                          </td>
                        </tr>
                      )}

                      {/* Bed Frame Specifications (only for beds) */}
                      {displayProduct.parent_category === "beds" && (
                        <>
                          {displayProduct.frame_width && (
                            <tr className="border-b border-wbk-lightgrey/40">
                              <td className="py-2.5 font-medium">
                                {t("product.frameWidth", "Frame width")}
                              </td>
                              <td className="py-2.5 text-right text-wbk-brown">
                                {formatMm(displayProduct.frame_width)}
                              </td>
                            </tr>
                          )}
                          {displayProduct.folded_up_height && (
                            <tr className="border-b border-wbk-lightgrey/40">
                              <td className="py-2.5 font-medium">
                                {t("product.foldedUpHeight", "Folded up height")}
                              </td>
                              <td className="py-2.5 text-right text-wbk-brown">
                                {formatMm(displayProduct.folded_up_height)}
                              </td>
                            </tr>
                          )}
                          {displayProduct.folded_up_projection && (
                            <tr className="border-b border-wbk-lightgrey/40">
                              <td className="py-2.5 font-medium">
                                {t("product.bedDepthFolded", "Bed depth (Folded)")}
                              </td>
                              <td className="py-2.5 text-right text-wbk-brown">
                                {formatMm(displayProduct.folded_up_projection)}
                              </td>
                            </tr>
                          )}
                          {displayProduct.folded_down_projection && (
                            <tr className="border-b border-wbk-lightgrey/40">
                              <td className="py-2.5 font-medium">
                                {t("product.bedDepthOpen", "Bed depth (Open)")}
                              </td>
                              <td className="py-2.5 text-right text-wbk-brown">
                                {formatMm(displayProduct.folded_down_projection)}
                              </td>
                            </tr>
                          )}
                          {displayProduct.mounting_frame_height && (
                            <tr className="border-b border-wbk-lightgrey/40">
                              <td className="py-2.5 font-medium">
                                {t("product.mountingFrameHeight", "Mounting frame height")}
                              </td>
                              <td className="py-2.5 text-right text-wbk-brown">
                                {formatMm(displayProduct.mounting_frame_height)}
                              </td>
                            </tr>
                          )}
                          {displayProduct.maximum_mattress_depth && (
                            <tr className="border-b border-wbk-lightgrey/40">
                              <td className="py-2.5 font-medium">
                                {t("product.maxMattressThickness", "Max mattress thickness")}
                              </td>
                              <td className="py-2.5 text-right text-wbk-brown">
                                {isUS
                                  ? `${t("product.upTo", "Up to")} ${(displayProduct.maximum_mattress_depth / 25.4).toFixed(1)}" (${displayProduct.maximum_mattress_depth / 10} cm)`
                                  : `${t("product.upTo", "Up to")} ${displayProduct.maximum_mattress_depth / 10} cm`}
                              </td>
                            </tr>
                          )}
                        </>
                      )}

                      <tr>
                        <td className="py-2.5 font-medium">
                          {t("product.warranty", "Warranty")}
                        </td>
                        <td className="py-2.5 text-right text-wbk-brown">
                          {displayProduct.warranty ||
                            (displayProduct.parent_category === "beds"
                              ? t("product.lifetimeMechanism", "Lifetime mechanism warranty")
                              : "1 year for manufacturing defects")}
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
                    {t("product.officialGallery", "Official Product Gallery")}
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
                            {t("product.view", "View")}
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
                        {t("product.customerGallery", "Customer Setup Gallery")}
                      </h3>
                      <p className="text-xs text-wbk-brown font-poppins">
                        {t(
                          "product.customerGallerySub",
                          "See how other customers styled their WallBedKing product in their homes.",
                        )}
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
                        {t("product.shareSetupPhoto", "Share your setup photo")}
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
                        {t("product.uploadSetupPhoto", "Upload Setup Photo")}
                      </span>
                      <span className="text-[10px] text-wbk-brown font-poppins mt-1">
                        {t("product.showOffDesign", "Show off your room design")}
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
                {(() => {
                  const mediaVideoInput =
                    displayProduct?.installation_video ||
                    selectedVariant?.installation_video ||
                    activeProduct?.installation_video ||
                    null;
                  const parsedMediaVideo = parseYouTubeVideo(mediaVideoInput);

                  if (parsedMediaVideo) {
                    return (
                      <div className="bg-[#F4F2F0]/60 p-6 sm:p-8 rounded-none border border-wbk-lightgrey/40 text-center space-y-4 max-w-3xl mx-auto">
                        <div className="space-y-1">
                          <span className="text-[10px] font-semibold text-red-600 uppercase tracking-wider font-poppins bg-red-50 px-2 py-0.5 border border-red-200/80 rounded-xs">
                            {t("product.officialVideoBadge", "Official Video Walkthrough")}
                          </span>
                          <h4 className="font-new-york text-xl sm:text-2xl text-wbk-black">
                            {t("product.watchSetupGuide", "Watch Setup & Assembly Guide")}
                          </h4>
                          <p className="text-xs font-poppins text-wbk-brown leading-relaxed max-w-lg mx-auto">
                            {t(
                              "product.watchSetupSub",
                              "See how easily you can customize, assemble, and operate the WallBedKing system.",
                            )}
                          </p>
                        </div>
                        <div className="relative aspect-video bg-black rounded-none overflow-hidden border border-wbk-lightgrey shadow-md max-w-2xl mx-auto">
                          <iframe
                            src={parsedMediaVideo.embedUrl}
                            title="Product Setup Guide"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="absolute inset-0 w-full h-full border-0"
                            loading="lazy"
                          />
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={() => setActiveTab("support")}
                            className="inline-flex items-center gap-1.5 text-xs text-wbk-brown hover:text-wbk-black underline cursor-pointer font-medium"
                          >
                            <span>
                              {t(
                                "product.downloadMatchingPdf",
                                "Download matching PDF installation manuals in Support & Guides →",
                              )}
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="bg-[#F4F2F0]/60 p-8 rounded-none border border-wbk-lightgrey/40 text-center space-y-4 max-w-2xl mx-auto">
                      <h4 className="font-new-york text-xl text-wbk-black">
                        {t("product.watchSetupPlaceholder", "Watch setup guide")}
                      </h4>
                      <p className="text-xs font-poppins text-wbk-brown leading-relaxed">
                        {t(
                          "product.watchSetupPlaceholderSub",
                          "Follow our official guides under the Support & Guides tab to view full technical assembly videos and PDF manuals.",
                        )}
                      </p>
                    </div>
                  );
                })()}
              </motion.div>
            )}

            {/* Support & Guides Tab */}
            {activeTab === "support" && (() => {
              const currentManualUrl =
                displayProduct?.installation_manual ||
                selectedVariant?.installation_manual ||
                activeProduct?.installation_manual ||
                (() => {
                  if (!familyVariants || !familyVariants.length) return null;
                  const matchInFamily = familyVariants.find(
                    (v) => (v.id === displayProduct?.id || v.id === selectedVariant?.id) && v.installation_manual
                  );
                  if (matchInFamily?.installation_manual) return matchInFamily.installation_manual;
                  const activeW = Math.min(
                    Number(displayProduct?.width || selectedVariant?.width || 0),
                    Number(displayProduct?.length || selectedVariant?.length || 0)
                  );
                  if (activeW > 0) {
                    const matchSize = familyVariants.find(
                      (v) =>
                        Math.min(Number(v.width || 0), Number(v.length || 0)) === activeW &&
                        v.installation_manual
                    );
                    if (matchSize?.installation_manual) return matchSize.installation_manual;
                  }
                  return null;
                })() ||
                null;

              const currentVideoInput =
                displayProduct?.installation_video ||
                selectedVariant?.installation_video ||
                activeProduct?.installation_video ||
                (() => {
                  if (!familyVariants || !familyVariants.length) return null;
                  const matchInFamily = familyVariants.find(
                    (v) => (v.id === displayProduct?.id || v.id === selectedVariant?.id) && v.installation_video
                  );
                  if (matchInFamily?.installation_video) return matchInFamily.installation_video;
                  const matchAnyInFamily = familyVariants.find((v) => v.installation_video);
                  if (matchAnyInFamily?.installation_video) return matchAnyInFamily.installation_video;
                  return null;
                })() ||
                null;

              const parsedVideo = parseYouTubeVideo(currentVideoInput);

              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  <div className="space-y-2">
                    <h3 className="font-new-york text-2xl sm:text-3xl text-wbk-black">
                      {t("product.supportHeading", "Support & Installation Guides")}
                    </h3>
                    <p className="font-poppins text-xs sm:text-sm text-wbk-brown max-w-2xl leading-relaxed">
                      {t(
                        "product.supportSubheading",
                        "Follow our official step-by-step video walkthroughs and download precision PDF assembly manuals to ensure seamless and safe installation.",
                      )}
                    </p>
                  </div>

                  {/* Section 1: Official YouTube Installation Video */}
                  <div className="max-w-3xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconBrandYoutube size={20} className="text-red-600" />
                        <h4 className="font-poppins font-semibold text-sm uppercase tracking-wider text-wbk-black">
                          {t("product.videoWalkthrough", "Video Walkthrough")}
                        </h4>
                      </div>
                      {parsedVideo && (
                        <a
                          href={parsedVideo.watchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-wbk-brown hover:text-red-600 transition-colors font-medium"
                        >
                          <span>{t("product.watchOnYoutube", "Watch on YouTube")}</span>
                          <IconExternalLink size={14} />
                        </a>
                      )}
                    </div>

                    {parsedVideo ? (
                      <div className="bg-white border border-wbk-lightgrey/70 shadow-sm overflow-hidden">
                        {/* 16:9 Responsive Video Player */}
                        <div className="relative aspect-video w-full bg-black">
                          <iframe
                            src={parsedVideo.embedUrl}
                            title="WallBedKing Installation Guide"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            className="absolute inset-0 w-full h-full border-0"
                            loading="lazy"
                          />
                        </div>

                        {/* Video Meta Bar */}
                        <div className="p-4 sm:p-5 bg-[#FAF9F8] border-t border-wbk-lightgrey/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-semibold text-red-600 uppercase tracking-wider font-poppins bg-red-50 px-2 py-0.5 border border-red-200/80 rounded-xs">
                                {t("product.youtubeTutorial", "YouTube Tutorial")}
                              </span>
                              <span className="text-[11px] text-wbk-brown font-mono">
                                {t("product.officialAssemblyGuide", "Official Assembly Guide")}
                              </span>
                            </div>
                            <p className="text-xs text-wbk-brown leading-relaxed">
                              {t(
                                "product.videoMetaDesc",
                                "Watch the step-by-step frame assembly, wall fixing anchors, and counterbalance piston calibration.",
                              )}
                            </p>
                          </div>

                          <a
                            href={parsedVideo.watchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-wbk-black text-wbk-black hover:text-white border border-wbk-lightgrey text-xs font-medium uppercase tracking-wider transition-colors shrink-0 cursor-pointer shadow-2xs"
                          >
                            <IconBrandYoutube size={16} className="text-red-600" />
                            <span>{t("product.openInApp", "Open in App")}</span>
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 bg-[#FAF9F8] border border-dashed border-wbk-lightgrey/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <div className="w-10 h-10 rounded-sm bg-[#EDE8E3] text-wbk-brown flex items-center justify-center shrink-0 border border-wbk-lightgrey/40">
                            <IconBrandYoutube size={22} stroke={1.6} />
                          </div>
                          <div>
                            <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider font-poppins bg-amber-50 px-2 py-0.5 border border-amber-200 rounded-xs">
                              {t("product.comingSoon", "Coming soon")}
                            </span>
                            <h5 className="font-poppins font-medium text-sm text-wbk-black mt-1">
                              {t("product.videoComingSoonTitle", "Video walkthrough for this model")}
                            </h5>
                            <p className="text-xs text-wbk-brown mt-0.5">
                              {t(
                                "product.videoComingSoonDesc",
                                "Our engineering team is producing an updated video guide for this configuration. In the meantime, please refer to the PDF assembly manual below.",
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section 2: PDF Download Manual */}
                  <div className="max-w-3xl space-y-3 pt-2">
                    <div className="flex items-center gap-2">
                      <IconFileText size={20} className="text-wbk-gold" />
                      <h4 className="font-poppins font-semibold text-sm uppercase tracking-wider text-wbk-black">
                        {t("product.pdfManualHeading", "PDF Assembly Manual")}
                      </h4>
                    </div>

                    {currentManualUrl ? (
                      <div className="p-6 sm:p-7 bg-white border border-wbk-lightgrey/60 hover:border-wbk-gold transition-all duration-300 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 group">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-sm bg-[#F5F2EF] text-wbk-gold flex items-center justify-center shrink-0 border border-wbk-lightgrey/50 group-hover:bg-wbk-gold group-hover:text-wbk-black transition-colors">
                            <IconFileText size={26} stroke={1.6} />
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-semibold text-wbk-gold uppercase tracking-wider font-poppins bg-[#FAF8F5] px-2 py-0.5 border border-wbk-gold/30 rounded-xs">
                                {t("product.pdfDocument", "PDF Document")}
                              </span>
                              <span className="text-[11px] text-wbk-brown/70 font-mono">
                                {t("product.officialAssemblyGuide", "Official Assembly Guide")}
                              </span>
                            </div>
                            <h4 className="font-poppins font-medium text-base text-wbk-black">
                              {t("product.pdfManualTitle", "Wall Bed Installation & Assembly Manual")}
                            </h4>
                            <p className="text-xs text-wbk-brown font-poppins leading-relaxed max-w-xl">
                              {t(
                                "product.pdfManualDesc",
                                "Complete illustrated guide covering wall fixation, frame assembly, gas piston calibration, and safety precautions.",
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-wbk-lightgrey/40">
                          <a
                            href={currentManualUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-wbk-black hover:bg-wbk-gold text-white hover:text-wbk-black text-xs font-semibold uppercase tracking-wider rounded-full transition-all duration-300 shadow-xs cursor-pointer"
                          >
                            <IconDownload size={15} />
                            <span>{t("product.downloadPdf", "Download PDF")}</span>
                          </a>
                          <a
                            href={currentManualUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 border border-wbk-lightgrey/80 text-wbk-brown hover:text-wbk-black hover:border-wbk-black rounded-full transition-colors cursor-pointer"
                            title={t("product.openInNewTab", "Open in new tab")}
                          >
                            <IconExternalLink size={16} />
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 sm:p-7 bg-[#FAF9F8] border border-dashed border-wbk-lightgrey/80 rounded-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-sm bg-[#EDE8E3] text-wbk-brown flex items-center justify-center shrink-0 border border-wbk-lightgrey/40">
                            <IconClock size={24} stroke={1.6} />
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider font-poppins bg-amber-50 px-2 py-0.5 border border-amber-200 rounded-xs">
                                {t("product.inProgress", "In progress")}
                              </span>
                              <span className="text-[11px] text-wbk-brown font-poppins">
                                {t("product.preparationUnderWay", "Preparation under way")}
                              </span>
                            </div>
                            <h4 className="font-poppins font-medium text-base text-wbk-black">
                              {t("product.pdfManualTitle", "Wall Bed Installation & Assembly Manual")}
                            </h4>
                            <p className="text-xs text-wbk-brown font-poppins leading-relaxed max-w-xl">
                              {t(
                                "product.manualInProgressDesc",
                                "The official assembly guide for this specific model and size is currently in progress and will be available for download here shortly. If you need immediate assistance or assembly advice, please reach out to our team.",
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 pt-2 sm:pt-0">
                          <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-wbk-lightgrey/40 text-wbk-brown text-xs font-medium rounded-full">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            <span>{t("product.inProgress", "In progress")}</span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })()}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <motion.div
                id="reviews-section"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <ProductReviewsSection
                  productSlug={productSlug}
                  productName={
                    activeProduct?.name || "Wall Bed King Murphy Bed"
                  }
                  initialOpen={
                    searchParams?.get("review") === "true" ||
                    searchParams?.get("review") === "open" ||
                    Boolean(searchParams?.get("rating"))
                  }
                  initialRating={
                    searchParams?.get("rating")
                      ? parseInt(searchParams.get("rating"), 10)
                      : 5
                  }
                  initialCustomerName={searchParams?.get("name") || ""}
                  initialCustomerEmail={searchParams?.get("email") || ""}
                />
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
                {t("morphy.featuresBadge", "System Innovations & Features")}
              </span>
              <h2 className="font-new-york text-4xl sm:text-5xl lg:text-6xl text-wbk-black leading-tight tracking-tight">
                {t("morphy.heroTitle", "Say hello to Morphy")}
              </h2>
              <p className="font-poppins text-sm text-wbk-brown leading-relaxed">
                {t(
                  "morphy.heroSubtitle",
                  "The next generation of modular and adaptable wall bed systems by Wall Bed King.",
                )}
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
                      {t("morphy.twoWaysBadge", "Flexibility")}
                    </span>
                    <h3 className="font-new-york text-3xl sm:text-5xl lg:text-6xl text-white leading-tight tracking-tight max-w-3xl drop-shadow-md text-center">
                      {t("morphy.twoWaysTitle", "Two ways to flex your space")}
                    </h3>
                  </div>
                </div>

                {/* Subtitle / Paragraph Description below the video in container width */}
                <p className="font-poppins text-sm sm:text-sm text-wbk-black/85 leading-relaxed text-center">
                  {t(
                    "morphy.twoWaysDesc",
                    "Morphy isn’t just a bed — it’s a complete, next-generation modular sleeping system designed to adapt to your life. With our SizeFlex™ and TypeFlex™ innovations, one frame can transform, resize, and reimagine itself. Whether you move homes, grow your family, or simply want a new look, your Morphy evolves with you — without compromise.",
                  )}
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
                    {t("morphy.sizeFlexBadge", "SizeFlex™ Innovation")}
                  </span>
                  <h3 className="font-new-york text-2xl sm:text-3xl text-wbk-black">
                    {t(
                      "morphy.sizeFlexTitle",
                      "SizeFlex™ — your bed that grows with you",
                    )}
                  </h3>
                  <p className="font-poppins text-sm leading-relaxed text-wbk-black/80">
                    {t(
                      "morphy.sizeFlexDesc",
                      "Why buy a new bed every time your needs change? With SizeFlex™, your Morphy can grow from Single to Double, Queen, or even King size — all using the same base components. Our modular frame system features universal parts that connect and expand easily. When you’re ready for a bigger bed, simply order the additional modules you need and reconfigure your existing frame — no need to replace the whole system. Morphy currently supports 16 different size configurations.",
                    )}
                  </p>
                </div>
              </div>

              {/* Card 3: TypeFlex™ */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pb-16 border-b border-wbk-lightgrey/40">
                <div className="lg:col-span-5 space-y-4">
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-wbk-gold font-poppins">
                    {t("morphy.typeFlexBadge", "TypeFlex™ Adaptability")}
                  </span>
                  <h3 className="font-new-york text-2xl sm:text-3xl text-wbk-black">
                    {t(
                      "morphy.typeFlexTitle",
                      "TypeFlex™ — reimagine your space, your way",
                    )}
                  </h3>
                  <p className="font-poppins text-sm leading-relaxed text-wbk-black/80">
                    {t(
                      "morphy.typeFlexDesc",
                      "Your Morphy isn’t limited to one purpose. With TypeFlex™, the same base can be transformed into a wall bed, storage bed, ottoman bed, or even a bunk bed. Start simple — then upgrade at your own pace. Add panels to turn it into a Morphy Studio wall bed, or add modules such as desks, cabinets, or sofas. Every component connects seamlessly, giving you complete freedom to design your perfect setup.",
                    )}
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
                    {t("morphy.orientationBadge", "Orientation")}
                  </span>
                  <h3 className="font-new-york text-2xl sm:text-3xl text-wbk-black">
                    {t(
                      "morphy.orientationTitle",
                      "Endless possibilities with Flexible Orientation",
                    )}
                  </h3>
                  <p className="font-poppins text-sm leading-relaxed text-wbk-black/80">
                    {t(
                      "morphy.orientationDesc",
                      "Change your mind, not your furniture. Morphy’s universal base lets you install the same bed vertically or horizontally—even years after your purchase. Avoid costly exchanges, adapt your bed with ease, and make any room truly yours.",
                    )}
                  </p>
                </div>
              </div>

              {/* Card 5: Modular and Upgradeable */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pb-16 border-b border-wbk-lightgrey/40">
                <div className="lg:col-span-5 space-y-4">
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-wbk-gold font-poppins">
                    {t("morphy.upgradeableBadge", "Upgradeable")}
                  </span>
                  <h3 className="font-new-york text-2xl sm:text-3xl text-wbk-black">
                    {t(
                      "morphy.upgradeableTitle",
                      "Modular & Upgradeable System",
                    )}
                  </h3>
                  <p className="font-poppins text-sm leading-relaxed text-wbk-black/80">
                    {t(
                      "morphy.upgradeableDesc",
                      "Start with a simple Classic and upgrade anytime: add a cabinet, switch to Studio, or integrate side units, sofas, or desks (module options launching soon!). With Morphy, your bed isn’t fixed—it evolves alongside your needs, giving you total control and lasting value.",
                    )}
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
                    {t("morphy.warrantyBadge", "Quality")}
                  </span>
                  <h3 className="font-new-york text-2xl sm:text-3xl text-wbk-black">
                    {t(
                      "morphy.warrantyTitle",
                      "Lifetime Warranty & Sustainable Quality",
                    )}
                  </h3>
                  <p className="font-poppins text-sm leading-relaxed text-wbk-black/80">
                    {t(
                      "morphy.warrantyDesc",
                      "Morphy isn’t locked into one purpose. Transform it from a wall bed to an ottoman, bunk, or traditional frame as life changes. Lifetime warranty means long-lasting quality, and modular reuse means you’ll never need to discard your bed when styles or needs change. Choose sustainability, choose Morphy.",
                    )}
                  </p>
                </div>
              </div>

              {/* Card 7: Modules Coming Soon */}
              <div className="py-8 space-y-3">
                <span className="text-[10px] uppercase tracking-widest font-semibold text-wbk-gold font-poppins">
                  {t("morphy.modulesSoonBadge", "Modules Coming Soon")}
                </span>
                <h3 className="font-new-york text-2xl sm:text-3xl text-wbk-black">
                  {t(
                    "morphy.modulesSoonTitle",
                    "Elevate Your Morphy Experience",
                  )}
                </h3>
                <p className="font-poppins text-sm leading-relaxed text-wbk-brown max-w-3xl">
                  {t(
                    "morphy.modulesSoonDesc",
                    "Get ready to personalize your space like never before! Our sleek new sofa module, versatile desk module, and smart storage units are designed to perfectly complement and expand your Morphy bed—effortlessly transforming your space for work, rest, and play.",
                  )}
                </p>
              </div>
            </div>

            {/* Morphy FAQ Accordion Section (Clean background-less) */}
            <div className="pt-8 border-t border-wbk-lightgrey/40 space-y-8">
              <div className="space-y-2 text-center mx-auto">
                <span className="text-[10px] uppercase tracking-widest font-semibold text-wbk-gold font-poppins">
                  {t("morphy.faqBadge", "Got Questions?")}
                </span>
                <h3 className="font-new-york text-2xl sm:text-3xl text-wbk-black">
                  {t("morphy.faqTitle", "Frequently Asked Questions")}
                </h3>
              </div>

              <div className="divide-y divide-wbk-lightgrey/40 mx-auto">
                {getMorphyFaqs(locale).map((faq, idx) => {
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
      <AnimatePresence>
        {lightboxIndex !== -1 && (
          <motion.div
            key="product-lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setLightboxIndex(-1)}
            className="fixed inset-0 z-[999] bg-wbk-black/20 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-6"
          >
            {/* Close button */}
            <button
              onClick={() => setLightboxIndex(-1)}
              className="absolute top-3 sm:top-6 right-3 sm:right-6 text-wbk-black hover:text-white bg-white/90 hover:bg-wbk-black border border-wbk-lightgrey/80 h-10 w-10 sm:h-11 sm:w-11 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer z-30"
              aria-label="Close lightbox"
            >
              <IconX size={20} />
            </button>

            {/* Navigation buttons */}
            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 sm:left-6 md:left-8 top-1/2 -translate-y-1/2 text-wbk-black hover:text-white bg-white/90 hover:bg-wbk-black border border-wbk-lightgrey/80 h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer z-30"
                  aria-label="Previous image"
                >
                  <IconChevronLeft size={24} />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 text-wbk-black hover:text-white bg-white/90 hover:bg-wbk-black border border-wbk-lightgrey/80 h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer z-30"
                  aria-label="Next image"
                >
                  <IconChevronRight size={24} />
                </button>
              </>
            )}

            {/* Modal Image Card with White Background */}
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl max-h-[88vh] w-full bg-white border border-wbk-lightgrey shadow-2xl p-4 sm:p-8 flex flex-col items-center justify-center"
            >
              <div className="relative w-full flex-1 flex items-center justify-center min-h-0 bg-white">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={galleryImages[lightboxIndex]?.src || lightboxIndex}
                    src={galleryImages[lightboxIndex]?.src}
                    alt={galleryImages[lightboxIndex]?.alt}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="max-w-full max-h-[66vh] sm:max-h-[72vh] object-contain bg-white select-none"
                  />
                </AnimatePresence>
              </div>

              {(galleryImages[lightboxIndex]?.alt ||
                galleryImages.length > 1) && (
                <div className="mt-3 pt-3 border-t border-wbk-lightgrey/60 w-full flex items-center justify-between text-xs text-wbk-brown font-poppins px-1">
                  <p className="font-medium text-wbk-black truncate pr-4 text-xs">
                    {galleryImages[lightboxIndex]?.alt}
                  </p>
                  <span className="font-semibold text-wbk-black/70 shrink-0 text-[11px] tracking-wider">
                    {lightboxIndex + 1} / {galleryImages.length}
                  </span>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PERSISTENT STICKY BOTTOM BAR: PRODUCT TITLE, SIZE, TOTAL PRICE & ADD TO CART ── */}
      <AnimatePresence>
        {showFloatingBar && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="fixed bottom-3 sm:bottom-6 left-0 right-0 z-50 pointer-events-none px-2.5 sm:px-6"
          >
            <Container
              size="xl"
              className="flex items-center justify-between gap-3 sm:gap-6 bg-[#A3A48C]/95 backdrop-blur-md shadow-xl px-3.5 sm:px-8 py-2.5 sm:py-3 transition-all duration-300 pointer-events-auto border border-white/20"
            >
              {/* Left: Product Name & Selected Size */}
              <div className="flex flex-col flex-1 min-w-0 sm:max-w-xs md:max-w-sm pr-2">
                <span className="font-poppins text-xs sm:text-base md:text-lg text-wbk-black font-semibold truncate leading-tight">
                  {localizedProductName}
                </span>
                <span className="font-poppins text-[10px] sm:text-xs text-wbk-black/75 font-light truncate">
                  {formatSizeLabel(productSize || "Standard", locale)}
                </span>
              </div>

              {/* Right: Total Price & Add to Cart Button */}
              <div className="flex items-center gap-2 sm:gap-6 shrink-0">
                <div className="flex flex-col items-end font-poppins">
                  <span className="text-[9px] uppercase tracking-widest text-wbk-black/80 font-semibold">
                    {t("common.total", "Total")}
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-wbk-black text-sm sm:text-xl md:text-2xl leading-none">
                      {formatPrice(totalDecimal, locale)}
                    </span>
                    {productPricing.isOnSale && (
                      <span className="text-[10px] sm:text-xs text-wbk-black/60 line-through font-normal hidden sm:inline">
                        {formatPrice(
                          productPricing.regularRaw + sofaSurcharge,
                          locale,
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {isOutOfStock ? (
                  <button
                    type="button"
                    onClick={() => setIsWaitlistModalOpen(true)}
                    title={t(
                      "waitlist.joinWaitlistBtn",
                      "Join Waitlist / Notify Me",
                    )}
                    className="flex items-center justify-center w-10 h-10 sm:w-auto sm:h-auto sm:gap-2 sm:px-6 sm:py-3 bg-wbk-gold hover:bg-wbk-black text-wbk-black hover:text-white border border-wbk-gold hover:border-wbk-black text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest rounded-full transition-all duration-300 shadow-md hover:shadow-lg group cursor-pointer shrink-0"
                  >
                    <IconBell
                      size={16}
                      className="animate-bounce text-wbk-black group-hover:text-white transition-colors"
                    />
                    <span className="hidden sm:inline">
                      {t("waitlist.joinWaitlistBtn", "Join Waitlist / Notify Me")}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    title={
                      isAdded
                        ? t("common.addedToCart", "Added to Cart!")
                        : t("common.addToCart", "Add to Cart")
                    }
                    className={`flex items-center justify-center w-10 h-10 sm:w-auto sm:h-auto sm:gap-2 sm:px-6 sm:py-3 border text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest rounded-full transition-all duration-300 shadow-md hover:shadow-lg group cursor-pointer shrink-0 ${
                      isAdded
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "bg-wbk-black hover:bg-white hover:text-wbk-black text-white border-wbk-black hover:border-white"
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <IconCheck size={16} className="text-white" />
                        <span className="text-white hidden sm:inline">
                          {t("common.addedToCart", "Added to Cart!")}
                        </span>
                      </>
                    ) : (
                      <>
                        <IconShoppingCart
                          size={16}
                          className="transition-transform duration-200 group-hover:scale-110"
                        />
                        <span className="hidden sm:inline">
                          {t("common.addToCart", "Add to Cart")}
                        </span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Waitlist Modal */}
      <WaitlistModal
        isOpen={isWaitlistModalOpen}
        onClose={() => setIsWaitlistModalOpen(false)}
        product={displayProduct}
        selectedVariant={selectedVariant}
        productSize={productSize}
      />
    </div>
  );
}
