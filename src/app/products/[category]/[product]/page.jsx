"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
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
  const [activeTab, setActiveTab] = useState("description");
  const [customerPhotos, setCustomerPhotos] = useState([
    {
      src: "/sofa1.webp",
      author: "Roz M.",
      comment: "Looks amazing in our small apartment living room! Easy to pull down.",
      stars: "★★★★★",
    },
    {
      src: "/sofa2.webp",
      author: "Iain D.",
      comment: "The mechanism is solid and the framing fits nicely into our cabinets.",
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
    <div className="relative min-h-screen flex flex-col bg-white pt-20">
      {/* ── MAIN PRODUCT LAYOUT: FULL-SECTION CANVAS WITH TRANSPARENT SIDE PANELS ── */}
      <section className="relative z-10 w-full h-[85vh] min-h-[550px] flex items-center overflow-hidden pb-2">
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

      {/* ── TABS NAVIGATION SECTION ── */}
      <section className="relative z-20 bg-white border-t border-wbk-lightgrey/60 py-16">
        <Container size="lg">
          {/* Tab buttons header */}
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

          {/* Tab contents wrapper */}
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
                    About {activeProduct.title}
                  </h3>
                  <p className="font-poppins text-sm leading-relaxed text-wbk-black/80">
                    Crafted with premium materials and absolute precision, the {activeProduct.title} is designed to be the ultimate space-saving solution for modern, multi-functional homes. Leveraging our signature SizeFlex™ & TypeFlex™ innovation, it transitions seamlessly from a clean cabinetry design to a luxurious bed setup.
                  </p>
                  <ul className="space-y-3 font-poppins text-xs text-wbk-brown">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-wbk-gold" />
                      Premium solid carbon steel metal framework
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-wbk-gold" />
                      Heavy duty counter-balance mechanism (10,000+ cycle test)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-wbk-gold" />
                      Automatic self-folding leg system for safety and ease
                    </li>
                  </ul>
                </div>
                <div className="bg-[#F4F2F0]/60 p-8 rounded-2xl border border-wbk-lightgrey/40">
                  <h4 className="font-poppins font-semibold text-xs uppercase tracking-wider text-wbk-black mb-6">
                    Specifications
                  </h4>
                  <table className="w-full text-xs font-poppins text-wbk-black/80 space-y-3">
                    <tbody>
                      <tr className="border-b border-wbk-lightgrey/40">
                        <td className="py-2.5 font-medium">Mechanism</td>
                        <td className="py-2.5 text-right text-wbk-brown">Gas Piston Cylinder System</td>
                      </tr>
                      <tr className="border-b border-wbk-lightgrey/40">
                        <td className="py-2.5 font-medium">Bed depth (Folded)</td>
                        <td className="py-2.5 text-right text-wbk-brown">40 cm</td>
                      </tr>
                      <tr className="border-b border-wbk-lightgrey/40">
                        <td className="py-2.5 font-medium">Mattress height limit</td>
                        <td className="py-2.5 text-right text-wbk-brown">Up to 25 cm thickness</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-medium">Warranty</td>
                        <td className="py-2.5 text-right text-wbk-brown">5 Years mechanism warranty</td>
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
                {/* Official Gallery */}
                <div className="space-y-6">
                  <h3 className="font-new-york text-xl text-wbk-black">
                    Official Product Gallery
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {galleryImages.map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() => setLightboxIndex(idx)}
                        className="group relative aspect-square bg-[#F4F2F0] border border-wbk-lightgrey/40 overflow-hidden rounded-xl cursor-pointer"
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

                {/* Customer Shared Setups Gallery */}
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-new-york text-xl text-wbk-black">
                        Customer Setup Gallery
                      </h3>
                      <p className="text-xs text-wbk-brown font-poppins">
                        See how other customers styled their WallBedKing product in their homes.
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
                    {/* Share setup upload placeholder card */}
                    <div
                      onClick={() => fileInputRef.current.click()}
                      className="border-2 border-dashed border-wbk-lightgrey hover:border-wbk-gold rounded-xl aspect-square flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors group bg-[#F4F2F0]/20"
                    >
                      <span className="text-2xl text-wbk-brown group-hover:scale-110 transition-transform mb-2">📸</span>
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
                        className="bg-white border border-wbk-lightgrey/50 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between group"
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
                            <span className="font-semibold text-wbk-black">{photo.author}</span>
                            <span className="text-wbk-gold font-bold">{photo.stars}</span>
                          </div>
                          <p className="text-[11px] font-poppins text-wbk-brown italic leading-relaxed">
                            "{photo.comment}"
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Simulated Video Section */}
                <div className="bg-[#F4F2F0]/60 p-8 rounded-2xl border border-wbk-lightgrey/40 text-center space-y-4 max-w-2xl mx-auto">
                  <h4 className="font-new-york text-xl text-wbk-black">
                    Watch setup guide
                  </h4>
                  <p className="text-xs font-poppins text-wbk-brown leading-relaxed">
                    See how easily you can customize, open, and close the WallBedKing system in real-time.
                  </p>
                  <div className="relative aspect-video bg-[#E4E0DE] rounded-xl flex items-center justify-center overflow-hidden border border-wbk-lightgrey group cursor-pointer shadow-sm max-w-lg mx-auto">
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
                    Download official step-by-step manuals, structural guidelines, and requirements in PDF format.
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
                      className="flex items-start justify-between p-6 bg-[#F4F2F0]/50 rounded-xl border border-wbk-lightgrey/40 hover:border-wbk-gold transition-colors group"
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
                {/* ── HIGH FIDELITY RATING BREAKDOWN BLOCK (ALZA-STYLE) ── */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-white border border-wbk-lightgrey/50 p-8 rounded-2xl shadow-xs">
                  {/* Left Column: Big score and star display */}
                  <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left justify-center space-y-4 border-b md:border-b-0 md:border-r border-wbk-lightgrey/30 pb-6 md:pb-0 md:pr-8">
                    <div className="text-5xl font-semibold font-poppins text-wbk-black tracking-tight">
                      4,9
                    </div>
                    <div className="space-y-1">
                      <div className="text-[#D2AA7C] text-xl tracking-wider select-none">
                        ★★★★★
                      </div>
                      <div className="text-[11px] text-wbk-brown font-poppins">
                        Rated by <span className="font-semibold text-wbk-black">742 buyers</span>
                      </div>
                    </div>
                    <button className="px-5 py-2.5 bg-[#9A9A8C] hover:bg-wbk-black text-white text-[10px] font-semibold uppercase tracking-widest rounded-full transition-all duration-300 shadow-sm cursor-pointer">
                      Write a review
                    </button>
                  </div>

                  {/* Middle Column: Star bar breakdown */}
                  <div className="md:col-span-4 flex flex-col justify-center space-y-2">
                    {[
                      { stars: 5, count: 674, percent: 90 },
                      { stars: 4, count: 50, percent: 7 },
                      { stars: 3, count: 4, percent: 1 },
                      { stars: 2, count: 5, percent: 1 },
                      { stars: 1, count: 9, percent: 1 },
                    ].map((row) => (
                      <div key={row.stars} className="flex items-center gap-3 text-xs font-poppins">
                        <span className="w-3 text-right font-medium text-wbk-black">{row.stars}</span>
                        <span className="text-[#D2AA7C] text-[10px]">★</span>
                        <div className="flex-1 h-2 bg-[#F4F2F0] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#A3A48C] rounded-full"
                            style={{ width: `${row.percent}%` }}
                          />
                        </div>
                        <span className="w-10 text-right text-wbk-brown">{row.count}x</span>
                      </div>
                    ))}
                  </div>

                  {/* Right Column: Key purchase feedback metrics */}
                  <div className="md:col-span-4 flex flex-col justify-center gap-4 pl-0 md:pl-8 text-xs font-poppins">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#A3A48C]/10 text-[#A3A48C] flex items-center justify-center text-xs shrink-0 mt-0.5 select-none font-bold">
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
                      <div className="w-5 h-5 rounded-full bg-[#A3A48C]/10 text-[#A3A48C] flex items-center justify-center text-xs shrink-0 mt-0.5 select-none font-bold">
                        ⚙
                      </div>
                      <div>
                        <div className="font-semibold text-wbk-black text-sm">0,06%</div>
                        <div className="text-wbk-brown text-[11px] leading-relaxed">
                          extremely low warranty claim rate
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#A3A48C]/10 text-[#A3A48C] flex items-center justify-center text-xs shrink-0 mt-0.5 select-none font-bold">
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

                {/* List of Reviews */}
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
                      className="bg-white p-6 rounded-xl border border-wbk-lightgrey/50 shadow-xs flex flex-col justify-between"
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
