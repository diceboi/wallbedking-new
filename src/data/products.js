// Central Product & Category Catalog for WallBedKing
import catalog from './products-catalog.json';

export const RAW_CATALOG = catalog;

export const GLOBAL_GALLERY_TEMPLATES = [
  { src: "/product-images/morphy-integrated/160x200.jpg", alt: "MORPHY Bed Integrated 160x200 - Main view" },
  { src: "/product-images/morphy-integrated/160x200-2.jpg", alt: "MORPHY Bed Integrated 160x200 - Angle view" },
  { src: "/product-images/morphy-integrated/160x200-3.jpg", alt: "MORPHY Bed Integrated 160x200 - Open view" },
  { src: "/product-images/morphy-integrated/160x200-4.jpg", alt: "MORPHY Bed Integrated 160x200 - Frame detail" },
  { src: "/product-images/morphy-integrated/160x200-5.jpg", alt: "MORPHY Bed Integrated 160x200 - Side perspective" },
  { src: "/product-images/morphy-integrated/160x200-6.jpg", alt: "MORPHY Bed Integrated 160x200 - Mechanism detail" },
  { src: "/product-images/morphy-integrated/160x200-7.jpg", alt: "MORPHY Bed Integrated 160x200 - Headboard view" },
  { src: "/product-images/morphy-integrated/160x200-8.jpg", alt: "MORPHY Bed Integrated 160x200 - Room setting" },
  { src: "/product-images/morphy-integrated/160x200-9.jpg", alt: "MORPHY Bed Integrated 160x200 - Closed position" },
  { src: "/product-images/morphy-integrated/160x200-10.jpg", alt: "MORPHY Bed Integrated 160x200 - Lifestyle view" },
  { src: "/product-images/morphy-integrated/160x200-11.jpg", alt: "MORPHY Bed Integrated 160x200 - Compact view" },
  { src: "/product-images/morphy-integrated/160x200-12.jpg", alt: "MORPHY Bed Integrated 160x200 - Full setup" },
];

export const CATEGORIES_INFO = {
  beds: {
    label: "Murphy Beds",
    title: "Murphy Beds",
    slug: "beds",
    description: "Premium space-saving fold-away beds in Classic, Studio, and Integrated styles.",
    image: "/product-images/morphy-integrated/160x200.jpg",
    subcategories: ["Classic", "Studio", "Integrated"]
  },
  sofas: {
    label: "Sofas",
    title: "Sofas & Seating Modules",
    slug: "sofas",
    description: "Modular seating systems engineered for bed front integration and free-standing living comfort.",
    image: "/sofa1.webp",
    subcategories: ["Bed Front", "Free Standing"]
  },
  mattresses: {
    label: "Mattresses",
    title: "Comfort, Luxury & Supreme Mattresses",
    slug: "mattresses",
    description: "Specially engineered mattresses designed for standard beds and fold-away wall bed mechanisms.",
    image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    subcategories: ["Comfort", "Luxury", "Supreme"]
  },
  cabinets: {
    label: "Cabinets",
    title: "Cabinets & Storage Units",
    slug: "cabinets",
    description: "Coordinated timber cabinetry, vertical and horizontal enclosures, extensions and side wardrobe units.",
    image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
    subcategories: ["Vertical", "Horizontal", "Extensions", "Side Units"]
  },
  extras: {
    label: "Extras",
    title: "Extras & Accessories",
    slug: "extras",
    description: "Lighting systems, tension accessories, and modular hardware.",
    image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
    subcategories: ["Lighting", "Hardware"]
  },
};

export const OTHER_CATEGORIES_LIST = [
  { slug: "beds", label: "Murphy Beds", image: "/product-images/morphy-integrated/160x200.jpg" },
  { slug: "sofas", label: "Sofas", image: "/sofa1.webp" },
  { slug: "mattresses", label: "Mattresses", image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp" },
  { slug: "cabinets", label: "Cabinets", image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp" },
  { slug: "extras", label: "Extras", image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp" },
];

// Helpers to derive clean dimensions, size labels and slugs across all product categories
export const getCleanBedDimensions = (item) => {
  if (!item || item.parent_category !== "beds") {
    return {
      widthCm: item?.width ? Math.round(item.width / 10) : 0,
      lengthCm: item?.length ? Math.round(item.length / 10) : 0,
    };
  }
  const w = Math.min(item.width || 0, item.length || 0) / 10;
  const l = Math.max(item.width || 0, item.length || 0) / 10;
  return { widthCm: Math.round(w), lengthCm: Math.round(l) };
};

export const getProductSizeInfo = (item) => {
  if (!item) return { size: "Standard", sizeLabel: "Standard", sizeSlug: "" };

  // 1. Murphy Beds
  if (item.parent_category === "beds") {
    const { widthCm, lengthCm } = getCleanBedDimensions(item);
    let baseName = (item.name || "")
      .replace(/Horizontal.*Bed/i, "")
      .replace(/Vertical.*Bed/i, "")
      .replace(/Classic.*Bed/i, "")
      .replace(/Studio.*Bed/i, "")
      .replace(/Integrated.*Bed/i, "")
      .replace(/MORPHY™.*Bed/i, "")
      .replace(/MORPHY.*Bed/i, "")
      .trim();

    if (!baseName) {
      baseName = item.size_category || "Standard";
    }

    const isMorphy = (item.name || "").includes("MORPHY");
    const label = `${baseName}${isMorphy ? " MORPHY™" : ""} (${widthCm}x${lengthCm} cm)`;
    const slug = `${widthCm}x${lengthCm}`;
    return { size: baseName, sizeLabel: label, sizeSlug: slug };
  }

  // 2. Mattresses
  if (item.parent_category === "mattresses") {
    let mattressSize = "Standard";
    const name = item.name || "";
    if (/small\s*double/i.test(name)) mattressSize = "Small Double";
    else if (/super\s*king/i.test(name)) mattressSize = "Super King";
    else if (/single/i.test(name)) mattressSize = "Single";
    else if (/king/i.test(name)) mattressSize = "King";
    else if (/double/i.test(name)) mattressSize = "Double";

    const wCm = item.width ? Math.round(item.width / 10) : 0;
    const lCm = item.length ? Math.round(item.length / 10) : 0;
    const dim = wCm && lCm ? ` (${wCm}x${lCm} cm)` : "";
    const label = `${mattressSize}${dim}`;
    const slug = wCm && lCm ? `${wCm}x${lCm}` : (item.slug || String(item.id));
    return { size: mattressSize, sizeLabel: label, sizeSlug: slug };
  }

  // 3. Cabinets
  if (item.parent_category === "cabinets") {
    let cabSize = "";
    const name = item.name || "";
    if (/small\s*double/i.test(name)) cabSize = "Small Double";
    else if (/super\s*king/i.test(name)) cabSize = "Super King";
    else if (/single/i.test(name)) cabSize = "Single";
    else if (/king/i.test(name)) cabSize = "King";
    else if (/double/i.test(name)) cabSize = "Double";
    else if (/side\s*unit/i.test(name)) {
      if (/door/i.test(name)) cabSize = "Side Unit (Door)";
      else if (/shelves/i.test(name)) cabSize = "Side Unit (Shelves)";
      else cabSize = "Side Unit";
    } else {
      cabSize = item.sub_category || "Cabinet";
    }

    if (/extension/i.test(name) && !cabSize.includes("Extension")) {
      cabSize = `${cabSize} Extension`;
    }

    const wCm = item.width ? Math.round(item.width / 10) : 0;
    const lCm = item.length ? Math.round(item.length / 10) : 0;
    const dim = wCm && lCm ? ` (${wCm}x${lCm} cm)` : "";
    const label = `${cabSize}${dim}`;
    const slug = wCm && lCm ? `${wCm}x${lCm}` : (item.slug || String(item.id));
    return { size: cabSize, sizeLabel: label, sizeSlug: slug };
  }

  // 4. Sofas
  if (item.parent_category === "sofas") {
    const name = item.name || "";
    const numMatch = name.match(/\b(600|800|1000|1200|1400|1600|1800|2000)\b/);
    const sofaNum = numMatch ? numMatch[1] : null;
    let sofaSize = "";
    if (/corner\s*seat/i.test(name)) sofaSize = "Corner Seat";
    else if (/armrest/i.test(name)) sofaSize = "Armrest";
    else if (/base\s*module/i.test(name)) sofaSize = sofaNum ? `Base Module ${sofaNum}` : "Base Module";
    else if (sofaNum) sofaSize = `${sofaNum} mm`;
    else sofaSize = item.size_category || "Standard";

    const wCm = item.width ? Number((item.width / 10).toFixed(1)) : 0;
    const lCm = item.length ? Number((item.length / 10).toFixed(1)) : 0;
    const dim = wCm && lCm ? ` (${wCm}x${lCm} cm)` : "";
    const label = `${sofaSize}${dim}`;
    const slug = wCm && lCm ? `${wCm}x${lCm}` : (item.slug || String(item.id));
    return { size: sofaSize, sizeLabel: label, sizeSlug: slug };
  }

  // 5. Fallback for extras and other categories
  const fallbackLabel = item.size_label || item.size_category || item.name || "Standard";
  const fallbackSize = item.size_category || "Standard";
  return {
    size: fallbackSize,
    sizeLabel: fallbackLabel,
    sizeSlug: item.slug || String(item.id),
  };
};

export const getCleanBedSizeLabel = (item) => {
  return getProductSizeInfo(item).sizeLabel;
};

export const getCleanBedSizeSlug = (item) => {
  return getProductSizeInfo(item).sizeSlug;
};

// Helper to convert catalog item to uniform UI product
export const formatCatalogItem = (item) => {
  const isIntegrated = item.type === "Integrated" || item.has_3d;
  const gallery =
    item.product_images && item.product_images.length > 0
      ? item.product_images.map((src, i) => ({
          src,
          alt: `${item.name} View ${i + 1}`,
        }))
      : isIntegrated
      ? GLOBAL_GALLERY_TEMPLATES
      : [
          { src: item.image, alt: item.name },
          { src: item.hover_image, alt: `${item.name} Open` },
        ];

  const sizeInfo = getProductSizeInfo(item);

  return {
    ...item,
    id: `wbk-${item.id}`,
    rawId: item.id,
    title: item.name,
    price: `£${item.price_gbp}`,
    numericPrice: item.price_gbp,
    salePrice: item.sale_price_gbp ? `£${item.sale_price_gbp}` : null,
    size: sizeInfo.size,
    sizeLabel: sizeInfo.sizeLabel,
    sizeSlug: sizeInfo.sizeSlug,
    colors:
      item.color === "Beige"
        ? ["#D2AA7C"]
        : item.color === "Grey"
        ? ["#A5988E"]
        : item.color === "White"
        ? ["#FFFFFF"]
        : ["#090A0A"],
    gallery,
    has3D: Boolean(item.has_3d),
  };
};

// ── 6 FLAGSHIP BED MODELS (STARS OF THE CATALOG) ──
export const FLAGSHIP_BEDS = [
  {
    id: "flagship-classic-vertical",
    rawId: "flagship-classic-vertical",
    slug: "classic-vertical-wall-bed",
    name: "Classic Vertical Wall Bed",
    title: "Classic Vertical Wall Bed",
    type: "Classic",
    sub_category: "Classic",
    orientation: "Vertical",
    parent_category: "beds",
    description:
      "The Classic Vertical Wall Bed is a heavy-duty, space-saving fold-away mechanism engineered for everyday durability. Designed with counterbalanced gas pistons and an all-steel frame.",
    tagline: "Core mechanism, vertical fold",
    badge: "Best Value",
    image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
    hover_image:
      "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    hoverImage:
      "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    price_gbp: 599,
    price_euro: 599,
    price_usd: 599,
    sale_percent: 30,
    sale_price_gbp: 419,
    sale_price_euro: 419,
    sale_price_usd: 419,
    price: "from £419",
    numericPrice: 419,
    size: "19 Sizes",
    sizeLabel: "19 Available Sizes (76x190 - 200x200 cm)",
    defaultSizeSlug: "135x190",
    has_3d: false,
    has3D: false,
    colors: ["#090A0A"],
    link: "/products/beds/classic-vertical-wall-bed",
  },
  {
    id: "flagship-classic-horizontal",
    rawId: "flagship-classic-horizontal",
    slug: "classic-horizontal-wall-bed",
    name: "Classic Horizontal Wall Bed",
    title: "Classic Horizontal Wall Bed",
    type: "Classic",
    sub_category: "Classic",
    orientation: "Horizontal",
    parent_category: "beds",
    description:
      "Ideal for rooms with low ceilings, lofts, or narrow floor plans. Folds down along its long side to minimise ceiling height requirements.",
    tagline: "Low ceiling solution",
    badge: "Low Ceiling",
    image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
    hover_image:
      "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    hoverImage:
      "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    price_gbp: 599,
    price_euro: 599,
    price_usd: 599,
    sale_percent: 30,
    sale_price_gbp: 419,
    sale_price_euro: 419,
    sale_price_usd: 419,
    price: "from £419",
    numericPrice: 419,
    size: "19 Sizes",
    sizeLabel: "19 Available Sizes (76x190 - 200x200 cm)",
    defaultSizeSlug: "135x190",
    has_3d: false,
    has3D: false,
    colors: ["#090A0A"],
    link: "/products/beds/classic-horizontal-wall-bed",
  },
  {
    id: "flagship-studio-vertical",
    rawId: "flagship-studio-vertical",
    slug: "studio-vertical-wall-bed",
    name: "Studio Vertical Wall Bed",
    title: "Studio Vertical Wall Bed",
    type: "Studio",
    sub_category: "Studio",
    orientation: "Vertical",
    parent_category: "beds",
    description:
      "Features front decorative panels, modern aesthetics, and smooth gas-assisted lifting. Perfect as a standalone statement wall bed.",
    tagline: "With decorative front panel",
    badge: "Popular",
    image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
    hover_image:
      "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    hoverImage:
      "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    price_gbp: 749,
    price_euro: 749,
    price_usd: 749,
    sale_percent: 30,
    sale_price_gbp: 524,
    sale_price_euro: 524,
    sale_price_usd: 524,
    price: "from £524",
    numericPrice: 524,
    size: "19 Sizes",
    sizeLabel: "19 Available Sizes (76x190 - 200x200 cm)",
    defaultSizeSlug: "135x190",
    has_3d: false,
    has3D: false,
    colors: ["#090A0A"],
    link: "/products/beds/studio-vertical-wall-bed",
  },
  {
    id: "flagship-studio-horizontal",
    rawId: "flagship-studio-horizontal",
    slug: "studio-horizontal-wall-bed",
    name: "Studio Horizontal Wall Bed",
    title: "Studio Horizontal Wall Bed",
    type: "Studio",
    sub_category: "Studio",
    orientation: "Horizontal",
    parent_category: "beds",
    description:
      "Horizontal fold-down design fitted with front decorative panels for contemporary studio apartments and home offices.",
    tagline: "Horizontal studio design",
    badge: "Compact Living",
    image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
    hover_image:
      "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    hoverImage:
      "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    price_gbp: 749,
    price_euro: 749,
    price_usd: 749,
    sale_percent: 30,
    sale_price_gbp: 524,
    sale_price_euro: 524,
    sale_price_usd: 524,
    price: "from £524",
    numericPrice: 524,
    size: "19 Sizes",
    sizeLabel: "19 Available Sizes (76x190 - 200x200 cm)",
    defaultSizeSlug: "135x190",
    has_3d: false,
    has3D: false,
    colors: ["#090A0A"],
    link: "/products/beds/studio-horizontal-wall-bed",
  },
  {
    id: "flagship-integrated-vertical",
    rawId: "flagship-integrated-vertical",
    slug: "integrated-vertical-wall-bed",
    name: "Integrated Vertical Murphy Bed",
    title: "Integrated Vertical Murphy Bed",
    type: "Integrated",
    sub_category: "Integrated",
    orientation: "Vertical",
    parent_category: "beds",
    description:
      "Engineered specifically to seamlessly fit inside custom cabinetry, bespoke wardrobes, and modular storage systems. Supports full 3D interactive customization.",
    tagline: "Cabinetry & wardrobe ready",
    badge: "3D Configurator",
    image: "/product-images/morphy-integrated/160x200.jpg",
    hover_image: "/product-images/morphy-integrated/160x200-3.jpg",
    hoverImage: "/product-images/morphy-integrated/160x200-3.jpg",
    price_gbp: 999,
    price_euro: 999,
    price_usd: 999,
    sale_percent: 30,
    sale_price_gbp: 699,
    sale_price_euro: 699,
    sale_price_usd: 699,
    price: "from £699",
    numericPrice: 699,
    size: "19 Sizes",
    sizeLabel: "19 Available Sizes (76x190 - 200x200 cm)",
    defaultSizeSlug: "160x200",
    has_3d: true,
    has3D: true,
    colors: ["#090A0A", "#A5988E", "#D2AA7C"],
    gallery: GLOBAL_GALLERY_TEMPLATES,
    link: "/products/beds/integrated-vertical-wall-bed",
  },
  {
    id: "flagship-integrated-horizontal",
    rawId: "flagship-integrated-horizontal",
    slug: "integrated-horizontal-wall-bed",
    name: "Integrated Horizontal Murphy Bed",
    title: "Integrated Horizontal Murphy Bed",
    type: "Integrated",
    sub_category: "Integrated",
    orientation: "Horizontal",
    parent_category: "beds",
    description:
      "Side-folding mechanism engineered for low-profile horizontal cabinetry, bookshelf integration, and low-ceiling built-ins.",
    tagline: "Horizontal cabinetry integration",
    badge: "Custom Fit",
    image: "/product-images/morphy-integrated/160x200.jpg",
    hover_image: "/product-images/morphy-integrated/160x200-3.jpg",
    hoverImage: "/product-images/morphy-integrated/160x200-3.jpg",
    price_gbp: 999,
    price_euro: 999,
    price_usd: 999,
    sale_percent: 30,
    sale_price_gbp: 699,
    sale_price_euro: 699,
    sale_price_usd: 699,
    price: "from £699",
    numericPrice: 699,
    size: "19 Sizes",
    sizeLabel: "19 Available Sizes (76x190 - 200x200 cm)",
    defaultSizeSlug: "140x200",
    has_3d: true,
    has3D: true,
    colors: ["#090A0A", "#A5988E", "#D2AA7C"],
    gallery: GLOBAL_GALLERY_TEMPLATES,
    link: "/products/beds/integrated-horizontal-wall-bed",
  },
];

// ── FLAGSHIP SOFAS (BED FRONT & FREE STANDING) ──
export const FLAGSHIP_SOFAS = [
  {
    id: "flagship-sofa-bed-front",
    rawId: "flagship-sofa-bed-front",
    slug: "bed-front-modular-sofa",
    aliases: ["bed-front-sofa"],
    name: "Bed Front Modular Sofa",
    title: "Bed Front Modular Sofa",
    type: "Bed Front",
    sub_category: "Bed Front",
    orientation: "Modular",
    parent_category: "sofas",
    description:
      "Engineered specifically to sit directly in front of your WallBedKing Murphy bed without blocking the fold-down mechanism. Modular seat and base sections allow complete living space customisation.",
    tagline: "Engineered for Murphy bed integration",
    badge: "Bed Front",
    image: "/sofa1.webp",
    hover_image: "/sofa2.webp",
    hoverImage: "/sofa2.webp",
    price_gbp: 499,
    price_euro: 499,
    price_usd: 499,
    sale_percent: 0,
    price: "from £499",
    numericPrice: 499,
    size: "8 Modules",
    sizeLabel: "8 Modular Sizes (80 - 140 cm + Corner)",
    defaultSizeSlug: "sofa-1000-bed-front-100-8x86-7",
    has_3d: false,
    has3D: false,
    colors: ["#D2AA7C", "#A5988E"],
    link: "/products/sofas/bed-front-modular-sofa",
  },
  {
    id: "flagship-sofa-free-standing",
    rawId: "flagship-sofa-free-standing",
    slug: "free-standing-modular-sofa",
    aliases: ["free-standing-sofa"],
    name: "Free Standing Modular Sofa",
    title: "Free Standing Modular Sofa",
    type: "Free Standing",
    sub_category: "Free Standing",
    orientation: "Modular",
    parent_category: "sofas",
    description:
      "A luxurious stand-alone modular sofa system offering maximum relaxation and modular versatility. Perfect for living rooms, guest suites, or placed alongside your wall bed.",
    tagline: "Free-standing luxury seating",
    badge: "Free Standing",
    image: "/sofa2.webp",
    hover_image: "/sofa3.webp",
    hoverImage: "/sofa3.webp",
    price_gbp: 499,
    price_euro: 499,
    price_usd: 499,
    sale_percent: 0,
    price: "from £499",
    numericPrice: 499,
    size: "8 Modules",
    sizeLabel: "8 Modular Sizes (80 - 140 cm + Corner)",
    defaultSizeSlug: "sofa-1000-free-standing-107-2x83-4",
    has_3d: false,
    has3D: false,
    colors: ["#D2AA7C", "#A5988E"],
    link: "/products/sofas/free-standing-modular-sofa",
  },
];

// ── FLAGSHIP MATTRESSES (COMFORT, LUXURY, SUPREME) ──
export const FLAGSHIP_MATTRESSES = [
  {
    id: "flagship-comfort-mattress",
    rawId: "flagship-comfort-mattress",
    slug: "comfort-mattress",
    aliases: ["comfort-pocket-sprung-mattress"],
    name: "Comfort Pocket Sprung Mattress",
    title: "Comfort Pocket Sprung Mattress",
    type: "Comfort",
    sub_category: "Comfort",
    orientation: "Universal",
    parent_category: "mattresses",
    description:
      "Engineered specifically for everyday restful sleep and optimal weight balance in Murphy beds. Features a 20cm depth profile with individually wrapped pocket springs and soft-touch damask ticking.",
    tagline: "20cm depth profile, essential comfort",
    badge: "Best Value",
    image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    hover_image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
    hoverImage: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
    price_gbp: 399,
    price_euro: 399,
    price_usd: 399,
    sale_percent: 0,
    price: "from £399",
    numericPrice: 399,
    size: "4 Sizes",
    sizeLabel: "4 Available Sizes (Single to King)",
    defaultSizeSlug: "double-comfort-mattress-135x190x20",
    has_3d: false,
    has3D: false,
    colors: ["#FFFFFF"],
    link: "/products/mattresses/comfort-mattress",
  },
  {
    id: "flagship-luxury-mattress",
    rawId: "flagship-luxury-mattress",
    slug: "luxury-mattress",
    aliases: ["luxury-orthopaedic-mattress"],
    name: "Luxury Orthopaedic Mattress",
    title: "Luxury Orthopaedic Mattress",
    type: "Luxury",
    sub_category: "Luxury",
    orientation: "Universal",
    parent_category: "mattresses",
    description:
      "Medium-firm orthopaedic pocket sprung mattress featuring a 25cm deep profile with pressure-relieving memory foam layer and reinforced edge support. Ideal for daily restorative sleep.",
    tagline: "25cm depth profile, memory foam topper",
    badge: "Most Popular",
    image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    hover_image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
    hoverImage: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
    price_gbp: 499,
    price_euro: 499,
    price_usd: 499,
    sale_percent: 0,
    price: "from £499",
    numericPrice: 499,
    size: "4 Sizes",
    sizeLabel: "4 Available Sizes (Single to King)",
    defaultSizeSlug: "double-luxury-mattress-135x190x25",
    has_3d: false,
    has3D: false,
    colors: ["#FFFFFF"],
    link: "/products/mattresses/luxury-mattress",
  },
  {
    id: "flagship-supreme-mattress",
    rawId: "flagship-supreme-mattress",
    slug: "supreme-mattress",
    aliases: ["supreme-hybrid-mattress"],
    name: "Supreme Hybrid Mattress",
    title: "Supreme Hybrid Mattress",
    type: "Supreme",
    sub_category: "Supreme",
    orientation: "Universal",
    parent_category: "mattresses",
    description:
      "Our pinnacle sleep experience. Multi-zone pocket springs paired with high-resilience breathable cooling foam and natural tufted fibers. 25cm profile delivering cloud-like luxury contouring.",
    tagline: "25cm depth profile, multi-zone hybrid",
    badge: "Premium Flagship",
    image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    hover_image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
    hoverImage: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
    price_gbp: 599,
    price_euro: 599,
    price_usd: 599,
    sale_percent: 0,
    price: "from £599",
    numericPrice: 599,
    size: "4 Sizes",
    sizeLabel: "4 Available Sizes (Single to King)",
    defaultSizeSlug: "double-supreme-mattress-135x190x25",
    has_3d: false,
    has3D: false,
    colors: ["#FFFFFF"],
    link: "/products/mattresses/supreme-mattress",
  },
];

// ── FLAGSHIP CABINETS (VERTICAL, HORIZONTAL, SIDE UNITS, EXTENSIONS) ──
export const FLAGSHIP_CABINETS = [
  {
    id: "flagship-vertical-cabinet",
    rawId: "flagship-vertical-cabinet",
    slug: "vertical-wall-bed-cabinet",
    name: "Vertical Wall Bed Enclosure Cabinet",
    title: "Vertical Wall Bed Enclosure Cabinet",
    type: "Cabinet",
    sub_category: "Vertical",
    orientation: "Vertical",
    parent_category: "cabinets",
    description:
      "Precision-crafted wooden surround enclosure tailored specifically for vertical fold Murphy beds. Features smooth opening clearance and premium timber finishes.",
    tagline: "Surround enclosure for vertical wall beds",
    badge: "Vertical Beds",
    image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
    hover_image: "/product-images/morphy-integrated/160x200-8.jpg",
    hoverImage: "/product-images/morphy-integrated/160x200-8.jpg",
    price_gbp: 649,
    price_euro: 649,
    price_usd: 649,
    sale_percent: 0,
    price: "from £649",
    numericPrice: 649,
    size: "4 Sizes / 4 Finishes",
    sizeLabel: "Single to King in Pine, Beech, Oak & White",
    defaultSizeSlug: "double-vertical-cabinet-pine-160x52x215",
    has_3d: false,
    has3D: false,
    colors: ["#A5988E", "#D2AA7C", "#E4E0DE", "#FFFFFF"],
    link: "/products/cabinets/vertical-wall-bed-cabinet",
  },
  {
    id: "flagship-horizontal-cabinet",
    rawId: "flagship-horizontal-cabinet",
    slug: "horizontal-wall-bed-cabinet",
    name: "Horizontal Wall Bed Enclosure Cabinet",
    title: "Horizontal Wall Bed Enclosure Cabinet",
    type: "Cabinet",
    sub_category: "Horizontal",
    orientation: "Horizontal",
    parent_category: "cabinets",
    description:
      "Low-profile wooden enclosure cabinetry designed for horizontal fold wall beds. Ideal for lofts and low ceiling spaces.",
    tagline: "Low ceiling enclosure for horizontal beds",
    badge: "Horizontal Beds",
    image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
    hover_image: "/product-images/morphy-integrated/160x200-8.jpg",
    hoverImage: "/product-images/morphy-integrated/160x200-8.jpg",
    price_gbp: 829,
    price_euro: 829,
    price_usd: 829,
    sale_percent: 0,
    price: "from £829",
    numericPrice: 829,
    size: "2 Sizes / 4 Finishes",
    sizeLabel: "Double & King in Pine, Beech, Oak & White",
    defaultSizeSlug: "double-horizontal-cabinet-pine-215x52x180",
    has_3d: false,
    has3D: false,
    colors: ["#A5988E", "#D2AA7C", "#E4E0DE", "#FFFFFF"],
    link: "/products/cabinets/horizontal-wall-bed-cabinet",
  },
  {
    id: "flagship-side-unit-cabinet",
    rawId: "flagship-side-unit-cabinet",
    slug: "side-storage-wardrobe-cabinet",
    name: "Modular Side Storage & Wardrobe Unit",
    title: "Modular Side Storage & Wardrobe Unit",
    type: "Side Unit",
    sub_category: "Side Units",
    orientation: "Vertical",
    parent_category: "cabinets",
    description:
      "Versatile side storage towers available with hanging wardrobe doors or open shelving to frame and extend your wall bed installation.",
    tagline: "Door + hanger or open shelving options",
    badge: "Side Storage",
    image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
    hover_image: "/product-images/morphy-integrated/160x200-8.jpg",
    hoverImage: "/product-images/morphy-integrated/160x200-8.jpg",
    price_gbp: 459,
    price_euro: 459,
    price_usd: 459,
    sale_percent: 0,
    price: "from £459",
    numericPrice: 459,
    size: "2 Styles / 4 Finishes",
    sizeLabel: "Door + Hanger or Shelves in 4 Finishes",
    defaultSizeSlug: "vertical-cabinet-side-unit-with-shelves-pine-50x52x215",
    has_3d: false,
    has3D: false,
    colors: ["#A5988E", "#D2AA7C", "#E4E0DE", "#FFFFFF"],
    link: "/products/cabinets/side-storage-wardrobe-cabinet",
  },
  {
    id: "flagship-extension-cabinet",
    rawId: "flagship-extension-cabinet",
    slug: "overhead-storage-extension-cabinet",
    name: "Overhead Storage Extension Cabinet",
    title: "Overhead Storage Extension Cabinet",
    type: "Cabinet Extension",
    sub_category: "Extensions",
    orientation: "Horizontal",
    parent_category: "cabinets",
    description:
      "Top-bridge modular extension cabinet designed to fit directly above your horizontal Murphy bed enclosure to maximize vertical ceiling storage.",
    tagline: "Overhead bridge storage extension",
    badge: "Top Bridge",
    image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
    hover_image: "/product-images/morphy-integrated/160x200-8.jpg",
    hoverImage: "/product-images/morphy-integrated/160x200-8.jpg",
    price_gbp: 499,
    price_euro: 499,
    price_usd: 499,
    sale_percent: 0,
    price: "from £499",
    numericPrice: 499,
    size: "2 Sizes / 4 Finishes",
    sizeLabel: "Double & King in Pine, Beech, Oak & White",
    defaultSizeSlug: "double-horizontal-cabinet-extension-pine-215x52x35",
    has_3d: false,
    has3D: false,
    colors: ["#A5988E", "#D2AA7C", "#E4E0DE", "#FFFFFF"],
    link: "/products/cabinets/overhead-storage-extension-cabinet",
  },
];

/**
 * Computes starting prices ("from") dynamically for flagship models
 * based on the cheapest matching product variant in Supabase / catalog.
 */
export function getDynamicFlagships(templates, rawItems, category) {
  const catItems = rawItems.filter((p) => p.parent_category === category);

  return templates.map((template) => {
    const matching = catItems.filter((item) => {
      if (category === "beds") {
        return (
          item.type?.toLowerCase() === template.type?.toLowerCase() &&
          item.orientation?.toLowerCase() === template.orientation?.toLowerCase()
        );
      }
      return (
        item.sub_category?.toLowerCase() === template.sub_category?.toLowerCase() ||
        item.type?.toLowerCase() === template.type?.toLowerCase()
      );
    });

    if (matching.length === 0) return template;

    const gbpList = matching.map((m) => m.price_gbp).filter((v) => v != null && !isNaN(v));
    const euroList = matching.map((m) => m.price_euro ?? m.price_gbp).filter((v) => v != null && !isNaN(v));
    const usdList = matching.map((m) => m.price_usd ?? m.price_gbp).filter((v) => v != null && !isNaN(v));

    const minGbp = gbpList.length > 0 ? Math.min(...gbpList) : template.price_gbp;
    const minEuro = euroList.length > 0 ? Math.min(...euroList) : template.price_euro;
    const minUsd = usdList.length > 0 ? Math.min(...usdList) : template.price_usd;

    // Sale prices
    const saleGbpList = matching.map((m) => m.sale_price_gbp).filter((v) => v != null && !isNaN(v));
    const saleEuroList = matching.map((m) => m.sale_price_euro ?? m.sale_price_gbp).filter((v) => v != null && !isNaN(v));
    const saleUsdList = matching.map((m) => m.sale_price_usd ?? m.sale_price_gbp).filter((v) => v != null && !isNaN(v));

    const minSaleGbp = saleGbpList.length > 0 ? Math.min(...saleGbpList) : null;
    const minSaleEuro = saleEuroList.length > 0 ? Math.min(...saleEuroList) : null;
    const minSaleUsd = saleUsdList.length > 0 ? Math.min(...saleUsdList) : null;

    const bestPrice = minSaleGbp || minGbp;

    return {
      ...template,
      price_gbp: minGbp,
      price_euro: minEuro,
      price_usd: minUsd,
      sale_price_gbp: minSaleGbp,
      sale_price_euro: minSaleEuro,
      sale_price_usd: minSaleUsd,
      numericPrice: bestPrice,
      price: `from £${bestPrice}`,
      sale_percent: template.sale_percent,
    };
  });
}

export function getDynamicFlagshipBeds(rawItems = RAW_CATALOG) {
  return getDynamicFlagships(FLAGSHIP_BEDS, rawItems, "beds");
}
export function getDynamicFlagshipSofas(rawItems = RAW_CATALOG) {
  return getDynamicFlagships(FLAGSHIP_SOFAS, rawItems, "sofas");
}
export function getDynamicFlagshipMattresses(rawItems = RAW_CATALOG) {
  return getDynamicFlagships(FLAGSHIP_MATTRESSES, rawItems, "mattresses");
}
export function getDynamicFlagshipCabinets(rawItems = RAW_CATALOG) {
  return getDynamicFlagships(FLAGSHIP_CABINETS, rawItems, "cabinets");
}

export const DYNAMIC_FLAGSHIP_BEDS = getDynamicFlagshipBeds(RAW_CATALOG);
export const DYNAMIC_FLAGSHIP_SOFAS = getDynamicFlagshipSofas(RAW_CATALOG);
export const DYNAMIC_FLAGSHIP_MATTRESSES = getDynamicFlagshipMattresses(RAW_CATALOG);
export const DYNAMIC_FLAGSHIP_CABINETS = getDynamicFlagshipCabinets(RAW_CATALOG);

export const ALL_FLAGSHIP_PRODUCTS = [
  ...DYNAMIC_FLAGSHIP_BEDS,
  ...DYNAMIC_FLAGSHIP_SOFAS,
  ...DYNAMIC_FLAGSHIP_MATTRESSES,
  ...DYNAMIC_FLAGSHIP_CABINETS,
];

// All bed variants for internal lookups and configurator sizing
export const ALL_BED_VARIANTS = RAW_CATALOG.filter(
  (p) => p.parent_category === "beds"
).map(formatCatalogItem);

// Categorized product arrays
export const ALL_PRODUCTS = {
  beds: DYNAMIC_FLAGSHIP_BEDS,
  sofas: DYNAMIC_FLAGSHIP_SOFAS,
  mattresses: DYNAMIC_FLAGSHIP_MATTRESSES,
  cabinets: DYNAMIC_FLAGSHIP_CABINETS,
  extras: RAW_CATALOG.filter((p) => p.parent_category === "extras").map(formatCatalogItem),
};

// Representative popular product models for the overview / home sliders
export const POPULAR_PRODUCTS_OVERVIEW = [
  {
    id: "popular-integrated",
    title: "Integrated Vertical Murphy Bed",
    orientation: "Vertical & Horizontal",
    size: "76x190 to 200x200",
    colors: ["#090A0A", "#A5988E", "#D2AA7C"],
    price: "from £699",
    numericPrice: 699,
    image: "/product-images/morphy-integrated/160x200.jpg",
    hoverImage: "/product-images/morphy-integrated/160x200-3.jpg",
    link: "/products/beds/integrated-vertical-wall-bed",
    categoryKey: "beds",
    has3D: true,
  },
  {
    id: "popular-classic-vertical",
    title: "Classic Vertical Wall Bed",
    orientation: "Vertical",
    size: "76x190 to 200x200",
    colors: ["#090A0A"],
    price: "from £419",
    numericPrice: 419,
    image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
    hoverImage: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    link: "/products/beds/classic-vertical-wall-bed",
    categoryKey: "beds",
    has3D: false,
  },
  {
    id: "popular-studio-vertical",
    title: "Studio Vertical Wall Bed",
    orientation: "Vertical",
    size: "76x190 to 200x200",
    colors: ["#090A0A"],
    price: "from £524",
    numericPrice: 524,
    image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
    hoverImage: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    link: "/products/beds/studio-vertical-wall-bed",
    categoryKey: "beds",
    has3D: false,
  },
  {
    id: "popular-classic-horizontal",
    title: "Classic Horizontal Wall Bed",
    orientation: "Horizontal",
    size: "76x190 to 200x200",
    colors: ["#090A0A"],
    price: "from £419",
    numericPrice: 419,
    image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
    hoverImage: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    link: "/products/beds/classic-horizontal-wall-bed",
    categoryKey: "beds",
    has3D: false,
  },
  {
    id: "popular-sofa-bed-front",
    title: "Bed Front Modular Sofa",
    orientation: "Modular",
    size: "80cm to 140cm",
    colors: ["#D2AA7C", "#A5988E"],
    price: "from £499",
    numericPrice: 499,
    image: "/sofa1.webp",
    hoverImage: "/sofa2.webp",
    link: "/products/sofas/bed-front-modular-sofa",
    categoryKey: "sofas",
    has3D: false,
  },
  {
    id: "popular-sofa-freestanding",
    title: "Free Standing Modular Sofa",
    orientation: "Modular",
    size: "80cm to 140cm",
    colors: ["#D2AA7C", "#A5988E"],
    price: "from £499",
    numericPrice: 499,
    image: "/sofa2.webp",
    hoverImage: "/sofa3.webp",
    link: "/products/sofas/free-standing-modular-sofa",
    categoryKey: "sofas",
    has3D: false,
  },
  {
    id: "popular-comfort-mattress",
    title: "Comfort Pocket Sprung Mattress",
    orientation: "Universal",
    size: "90x190 to 150x200",
    colors: ["#FFFFFF"],
    price: "from £399",
    numericPrice: 399,
    image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    hoverImage: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
    link: "/products/mattresses/comfort-mattress",
    categoryKey: "mattresses",
    has3D: false,
  },
  {
    id: "popular-cabinets",
    title: "Vertical Wall Bed Enclosure Cabinet",
    orientation: "Vertical",
    size: "Pine, Beech, Oak, White",
    colors: ["#A5988E", "#E4E0DE", "#FFFFFF"],
    price: "from £649",
    numericPrice: 649,
    image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
    hoverImage: "/product-images/morphy-integrated/160x200-8.jpg",
    link: "/products/cabinets/vertical-wall-bed-cabinet",
    categoryKey: "cabinets",
    has3D: false,
  },
];

// Helper to find flagship bed from a slug or variant
export const getFlagshipBed = (type = "Classic", orientation = "Vertical") => {
  const normType = String(type).toLowerCase();
  const normOrient = String(orientation).toLowerCase();

  return (
    FLAGSHIP_BEDS.find(
      (f) =>
        f.type.toLowerCase() === normType &&
        f.orientation.toLowerCase() === normOrient
    ) || FLAGSHIP_BEDS[0]
  );
};

// Look up a product by slug or ID
export const findProductBySlug = (categorySlug, productSlug) => {
  if (!productSlug) return null;
  const cleanSlug = productSlug.toLowerCase();

  // 1. Exact match or alias match against ALL Flagship products (beds, sofas, mattresses, cabinets)
  const flagshipMatch = ALL_FLAGSHIP_PRODUCTS.find(
    (f) =>
      f.slug === cleanSlug ||
      (f.aliases && f.aliases.some((a) => a.toLowerCase() === cleanSlug))
  );
  if (flagshipMatch) {
    return { ...flagshipMatch };
  }

  // 2. Special backward compatibility alias for integrated-bed
  if (cleanSlug === "integrated-bed") {
    const integratedFlagship = ALL_FLAGSHIP_PRODUCTS.find(
      (f) => f.slug === "integrated-vertical-wall-bed"
    );
    return { ...integratedFlagship, slug: "integrated-bed" };
  }

  // 3. Search by exact slug or match in RAW_CATALOG
  const rawItem = RAW_CATALOG.find(
    (p) =>
      p.slug === cleanSlug ||
      String(p.id) === cleanSlug ||
      `wbk-${p.id}` === cleanSlug
  );

  if (rawItem) {
    return formatCatalogItem(rawItem);
  }

  // 4. Substring match
  const subMatch = RAW_CATALOG.find(
    (p) => p.slug.includes(cleanSlug) || cleanSlug.includes(p.slug)
  );
  if (subMatch) {
    return formatCatalogItem(subMatch);
  }

  return getFallbackProduct(categorySlug, productSlug);
};

// Get all matching variant items for the same family/model
export const getProductVariants = (currentProduct) => {
  if (!currentProduct) return [];
  const parentCat = currentProduct.parent_category || "beds";
  const type = currentProduct.type || "Classic";
  const subCategory = currentProduct.sub_category || type;
  const orientation = currentProduct.orientation || "Vertical";

  if (parentCat === "beds") {
    // Return all size variants for this specific flagship (type + orientation)
    const matching = RAW_CATALOG.filter(
      (p) =>
        p.parent_category === "beds" &&
        p.type?.toLowerCase() === type.toLowerCase() &&
        p.orientation?.toLowerCase() === orientation.toLowerCase()
    );

    // Sort logically by width, then length
    matching.sort((a, b) => {
      const wa = Math.min(a.width || 0, a.length || 0);
      const wb = Math.min(b.width || 0, b.length || 0);
      if (wa !== wb) return wa - wb;
      return (
        Math.max(a.width || 0, a.length || 0) -
        Math.max(b.width || 0, b.length || 0)
      );
    });

    return matching.map(formatCatalogItem);
  }

  if (parentCat === "sofas") {
    const matching = RAW_CATALOG.filter(
      (p) =>
        p.parent_category === "sofas" &&
        (p.sub_category?.toLowerCase() === subCategory.toLowerCase() ||
         p.type?.toLowerCase() === type.toLowerCase())
    );
    matching.sort((a, b) => (a.id || 0) - (b.id || 0));
    return matching.map(formatCatalogItem);
  }

  if (parentCat === "mattresses") {
    const matching = RAW_CATALOG.filter(
      (p) =>
        p.parent_category === "mattresses" &&
        (p.sub_category?.toLowerCase() === subCategory.toLowerCase() ||
         p.type?.toLowerCase() === type.toLowerCase())
    );
    matching.sort((a, b) => (a.width || 0) - (b.width || 0));
    return matching.map(formatCatalogItem);
  }

  if (parentCat === "cabinets") {
    const matching = RAW_CATALOG.filter(
      (p) =>
        p.parent_category === "cabinets" &&
        (p.sub_category?.toLowerCase() === subCategory.toLowerCase() ||
         p.type?.toLowerCase() === type.toLowerCase())
    );
    matching.sort((a, b) => (a.price_gbp || 0) - (b.price_gbp || 0));
    return matching.map(formatCatalogItem);
  }

  return RAW_CATALOG.filter((p) => p.parent_category === parentCat).map(
    formatCatalogItem
  );
};

// Fallback generator for unknown product slugs
export const getFallbackProduct = (categorySlug, productSlug) => {
  const cleanSlug = productSlug || "classic-vertical-wall-bed";
  const title = cleanSlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  const isSofa =
    cleanSlug.toLowerCase().includes("sofa") ||
    (categorySlug && categorySlug.toLowerCase().includes("sofa"));
  const isIntegrated = cleanSlug.toLowerCase().includes("integrated");

  return {
    id: cleanSlug,
    rawId: 1,
    slug: cleanSlug,
    title: title,
    name: title,
    price: "£799",
    numericPrice: 799,
    has3D: isIntegrated,
    image: isIntegrated
      ? "/product-images/morphy-integrated/160x200.jpg"
      : isSofa
      ? "/sofa1.webp"
      : "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
    hoverImage: isIntegrated
      ? "/product-images/morphy-integrated/160x200-3.jpg"
      : "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    orientation: "Vertical",
    size: "King",
    sizeLabel: "King 160 x 200",
    categoryKey: categorySlug || "beds",
    parent_category: categorySlug || "beds",
    type: isIntegrated ? "Integrated" : "Classic",
    gallery: isIntegrated
      ? GLOBAL_GALLERY_TEMPLATES
      : [
          {
            src: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
            alt: title,
          },
          {
            src: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
            alt: `${title} Open`,
          },
        ],
  };
};
