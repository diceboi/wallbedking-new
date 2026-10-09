// Central Product & Category Catalog for WallBedKing
import catalog from './products-catalog.json';

export const RAW_CATALOG = catalog;

export const SUPABASE_PRODUCT_IMAGES_BASE =
  "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/wallbeds";

export const SUPABASE_CABINET_IMAGES_BASE =
  "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/cabinets";

export const getMorphyGallery2K = (
  sizeKey = "160x200",
  typeCode = "IV",
  title = "MORPHY™ Bed"
) => {
  const base = `${SUPABASE_PRODUCT_IMAGES_BASE}/2K/${sizeKey}-${typeCode}-MORPHY`;
  const gallery = [
    { src: `${base}_1.webp`, alt: `${title} - Front View` },
    { src: `${base}_1-m.webp`, alt: `${title} - With Mattress` },
  ];
  for (let i = 2; i <= 12; i++) {
    gallery.push({ src: `${base}_${i}.webp`, alt: `${title} - View ${i}` });
  }
  return gallery;
};

export const getTraditionalGallery1K = (
  sizeKey = "160x200",
  typeCode = "CV",
  title = "Traditional Wall Bed",
  count = 9
) => {
  const base = `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/${sizeKey}-${typeCode}-TRADITIONAL`;
  const gallery = [];
  for (let i = 1; i <= count; i++) {
    gallery.push({ src: `${base}_${i}.webp`, alt: `${title} - View ${i}` });
  }
  return gallery;
};

export const GLOBAL_GALLERY_TEMPLATES = getMorphyGallery2K(
  "160x200",
  "IV",
  "MORPHY Bed Integrated 160x200"
);

export const CATEGORIES_INFO = {
  beds: {
    label: "Wall Beds",
    title: "Wall Beds",
    slug: "beds",
    description: "Premium space-saving fold-away beds featuring our next-generation MORPHY™ series and Traditional mechanism collections.",
    image: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-CV-MORPHY_1.webp`,
    hoverImage: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-CV-MORPHY_1-m.webp`,
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
  tables: {
    label: "Tables & Desks",
    title: "Smart & Transforming Tables",
    slug: "tables",
    description: "Multifunctional, height-adjustable, wall-mounted and transforming tables engineered for compact spaces.",
    image: "/sofa1.webp",
    subcategories: ["Transforming", "Wall-Mounted", "Extending", "Coffee & Side"]
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
    image: `${SUPABASE_CABINET_IMAGES_BASE}/1K/160x200-KV-WHITE-CABINET_ANGLE_1.webp`,
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
  { slug: "beds", label: "Wall Beds", image: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-CV-MORPHY_1.webp` },
  { slug: "sofas", label: "Sofas", image: "/sofa1.webp" },
  { slug: "tables", label: "Smart Tables", image: "/sofa1.webp" },
  { slug: "mattresses", label: "Mattresses", image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp" },
  { slug: "cabinets", label: "Cabinets", image: `${SUPABASE_CABINET_IMAGES_BASE}/1K/160x200-KV-WHITE-CABINET_ANGLE_1.webp` },
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
  const isMorphy = (item.name || "").includes("MORPHY") || (item.category || "").includes("MORPHY");

  const gallery =
    item.product_images && item.product_images.length > 0
      ? item.product_images.map((src, i) => ({
          src,
          alt: i === 1 ? `${item.name} - With Mattress` : `${item.name} View ${i + 1}`,
        }))
      : isIntegrated
      ? GLOBAL_GALLERY_TEMPLATES
      : [
          { src: item.image, alt: item.name },
          { src: item.hover_image || item.hoverImage, alt: `${item.name} Open` },
        ];

  const sizeInfo = getProductSizeInfo(item);

  return {
    ...item,
    id: `wbk-${item.id}`,
    rawId: item.id,
    title: item.name,
    image: item.image,
    hoverImage: item.hover_image || item.hoverImage,
    hover_image: item.hover_image || item.hoverImage,
    isMorphy,
    badge: isMorphy ? "MORPHY™" : item.badge,
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

// ── FLAGSHIP BED MODELS (MORPHY™ & TRADITIONAL) ──
export const FLAGSHIP_BEDS = [
  // ── MORPHY™ FLAGSHIP MODELS (1K CARDS, 2K GALLERIES) ──
  {
    id: "flagship-classic-vertical",
    rawId: "flagship-classic-vertical",
    slug: "classic-vertical-wall-bed",
    aliases: ["classic-vertical-morphy-bed"],
    name: "Classic Vertical MORPHY™ Bed",
    title: "Classic Vertical MORPHY™ Bed",
    type: "Classic",
    sub_category: "Classic",
    orientation: "Vertical",
    parent_category: "beds",
    isMorphy: true,
    description:
      "The Classic Vertical MORPHY™ Bed is our next-generation fold-away mechanism engineered for everyday durability. Designed with high-performance counterbalanced gas pistons and an all-steel reinforced frame.",
    tagline: "Core mechanism, vertical fold",
    badge: "MORPHY™",
    image: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-CV-MORPHY_1.webp`,
    hover_image: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-CV-MORPHY_1-m.webp`,
    hoverImage: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-CV-MORPHY_1-m.webp`,
    gallery: getMorphyGallery2K("160x200", "CV", "Classic Vertical MORPHY™ Bed"),
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
    defaultSizeSlug: "160x200",
    has_3d: false,
    has3D: false,
    colors: ["#090A0A"],
    link: "/products/beds/classic-vertical-wall-bed",
  },
  {
    id: "flagship-classic-horizontal",
    rawId: "flagship-classic-horizontal",
    slug: "classic-horizontal-wall-bed",
    aliases: ["classic-horizontal-morphy-bed"],
    name: "Classic Horizontal MORPHY™ Bed",
    title: "Classic Horizontal MORPHY™ Bed",
    type: "Classic",
    sub_category: "Classic",
    orientation: "Horizontal",
    parent_category: "beds",
    isMorphy: true,
    description:
      "Ideal for rooms with low ceilings, lofts, or narrow floor plans. Folds down along its long side to minimise ceiling height requirements with whisper-quiet MORPHY™ gas assistance.",
    tagline: "Low ceiling solution",
    badge: "MORPHY™",
    image: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-CH-MORPHY_1.webp`,
    hover_image: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-CH-MORPHY_1-m.webp`,
    hoverImage: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-CH-MORPHY_1-m.webp`,
    gallery: getMorphyGallery2K("160x200", "CH", "Classic Horizontal MORPHY™ Bed"),
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
    defaultSizeSlug: "160x200",
    has_3d: false,
    has3D: false,
    colors: ["#090A0A"],
    link: "/products/beds/classic-horizontal-wall-bed",
  },
  {
    id: "flagship-studio-vertical",
    rawId: "flagship-studio-vertical",
    slug: "studio-vertical-wall-bed",
    aliases: ["studio-vertical-morphy-bed"],
    name: "Studio Vertical MORPHY™ Bed",
    title: "Studio Vertical MORPHY™ Bed",
    type: "Studio",
    sub_category: "Studio",
    orientation: "Vertical",
    parent_category: "beds",
    isMorphy: true,
    description:
      "Features front decorative panels, modern aesthetics, and smooth gas-assisted lifting. Perfect as a standalone statement wall bed with contemporary MORPHY™ styling.",
    tagline: "With decorative front panel",
    badge: "MORPHY™",
    image: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-SV-MORPHY_1.webp`,
    hover_image: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-SV-MORPHY_1-m.webp`,
    hoverImage: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-SV-MORPHY_1-m.webp`,
    gallery: getMorphyGallery2K("160x200", "SV", "Studio Vertical MORPHY™ Bed"),
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
    defaultSizeSlug: "160x200",
    has_3d: false,
    has3D: false,
    colors: ["#090A0A"],
    link: "/products/beds/studio-vertical-wall-bed",
  },
  {
    id: "flagship-studio-horizontal",
    rawId: "flagship-studio-horizontal",
    slug: "studio-horizontal-wall-bed",
    aliases: ["studio-horizontal-morphy-bed"],
    name: "Studio Horizontal MORPHY™ Bed",
    title: "Studio Horizontal MORPHY™ Bed",
    type: "Studio",
    sub_category: "Studio",
    orientation: "Horizontal",
    parent_category: "beds",
    isMorphy: true,
    description:
      "Horizontal fold-down design fitted with front decorative panels for contemporary studio apartments and home offices.",
    tagline: "Horizontal studio design",
    badge: "MORPHY™",
    image: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-SH-MORPHY_1.webp`,
    hover_image: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-SH-MORPHY_1-m.webp`,
    hoverImage: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-SH-MORPHY_1-m.webp`,
    gallery: getMorphyGallery2K("160x200", "SH", "Studio Horizontal MORPHY™ Bed"),
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
    defaultSizeSlug: "160x200",
    has_3d: false,
    has3D: false,
    colors: ["#090A0A"],
    link: "/products/beds/studio-horizontal-wall-bed",
  },
  {
    id: "flagship-integrated-vertical",
    rawId: "flagship-integrated-vertical",
    slug: "integrated-vertical-wall-bed",
    aliases: ["integrated-vertical-morphy-bed", "integrated-bed"],
    name: "Integrated Vertical MORPHY™ Bed",
    title: "Integrated Vertical MORPHY™ Bed",
    type: "Integrated",
    sub_category: "Integrated",
    orientation: "Vertical",
    parent_category: "beds",
    isMorphy: true,
    description:
      "Engineered specifically to seamlessly fit inside custom cabinetry, bespoke wardrobes, and modular storage systems. Supports full 3D interactive customization.",
    tagline: "Cabinetry & wardrobe ready",
    badge: "MORPHY™ 3D",
    image: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-IV-MORPHY_1.webp`,
    hover_image: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-IV-MORPHY_1-m.webp`,
    hoverImage: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-IV-MORPHY_1-m.webp`,
    gallery: getMorphyGallery2K("160x200", "IV", "Integrated Vertical MORPHY™ Bed"),
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
    link: "/products/beds/integrated-vertical-wall-bed",
  },
  {
    id: "flagship-integrated-horizontal",
    rawId: "flagship-integrated-horizontal",
    slug: "integrated-horizontal-wall-bed",
    aliases: ["integrated-horizontal-morphy-bed"],
    name: "Integrated Horizontal MORPHY™ Bed",
    title: "Integrated Horizontal MORPHY™ Bed",
    type: "Integrated",
    sub_category: "Integrated",
    orientation: "Horizontal",
    parent_category: "beds",
    isMorphy: true,
    description:
      "Side-folding mechanism engineered for low-profile horizontal cabinetry, bookshelf integration, and low-ceiling built-ins.",
    tagline: "Horizontal cabinetry integration",
    badge: "MORPHY™ 3D",
    image: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-IH-MORPHY_1.webp`,
    hover_image: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-IH-MORPHY_1-m.webp`,
    hoverImage: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-IH-MORPHY_1-m.webp`,
    gallery: getMorphyGallery2K("160x200", "IH", "Integrated Horizontal MORPHY™ Bed"),
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
    link: "/products/beds/integrated-horizontal-wall-bed",
  },

  // ── TRADITIONAL WALL BED FLAGSHIP MODELS ──
  {
    id: "flagship-traditional-classic-vertical",
    rawId: "flagship-traditional-classic-vertical",
    slug: "classic-vertical-traditional-bed",
    aliases: ["classic-vertical-bed"],
    name: "Classic Vertical Wall Bed",
    title: "Classic Vertical Wall Bed (Traditional)",
    type: "Classic",
    sub_category: "Classic",
    orientation: "Vertical",
    parent_category: "beds",
    isMorphy: false,
    description:
      "The time-tested Traditional Classic Vertical Wall Bed. Proven counterbalanced gas pistons and solid construction for dependable everyday use.",
    tagline: "Original mechanism, vertical fold",
    badge: "Traditional",
    image: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-CV-TRADITIONAL_1.webp`,
    hover_image: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-CV-TRADITIONAL_2.webp`,
    hoverImage: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-CV-TRADITIONAL_2.webp`,
    gallery: getTraditionalGallery1K("160x200", "CV", "Classic Vertical Wall Bed (Traditional)", 9),
    price_gbp: 570,
    price_euro: 570,
    price_usd: 570,
    sale_percent: 30,
    sale_price_gbp: 399,
    sale_price_euro: 399,
    sale_price_usd: 399,
    price: "from £399",
    numericPrice: 399,
    size: "13 Sizes",
    sizeLabel: "13 Available Sizes (76x190 - 180x200 cm)",
    defaultSizeSlug: "135x190",
    has_3d: false,
    has3D: false,
    colors: ["#090A0A"],
    link: "/products/beds/classic-vertical-traditional-bed",
  },
  {
    id: "flagship-traditional-classic-horizontal",
    rawId: "flagship-traditional-classic-horizontal",
    slug: "classic-horizontal-traditional-bed",
    aliases: ["classic-horizontal-bed"],
    name: "Classic Horizontal Wall Bed",
    title: "Classic Horizontal Wall Bed (Traditional)",
    type: "Classic",
    sub_category: "Classic",
    orientation: "Horizontal",
    parent_category: "beds",
    isMorphy: false,
    description:
      "Traditional side-folding fold-away wall bed mechanism designed for lower ceilings and compact rooms.",
    tagline: "Original mechanism, horizontal fold",
    badge: "Traditional",
    image: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-CH-TRADITIONAL_1.webp`,
    hover_image: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-CH-TRADITIONAL_2.webp`,
    hoverImage: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-CH-TRADITIONAL_2.webp`,
    gallery: getTraditionalGallery1K("160x200", "CH", "Classic Horizontal Wall Bed (Traditional)", 9),
    price_gbp: 570,
    price_euro: 570,
    price_usd: 570,
    sale_percent: 30,
    sale_price_gbp: 399,
    sale_price_euro: 399,
    sale_price_usd: 399,
    price: "from £399",
    numericPrice: 399,
    size: "11 Sizes",
    sizeLabel: "11 Available Sizes (76x190 - 180x200 cm)",
    defaultSizeSlug: "135x190",
    has_3d: false,
    has3D: false,
    colors: ["#090A0A"],
    link: "/products/beds/classic-horizontal-traditional-bed",
  },
  {
    id: "flagship-traditional-studio-vertical",
    rawId: "flagship-traditional-studio-vertical",
    slug: "studio-vertical-traditional-bed",
    aliases: ["studio-vertical-bed"],
    name: "Studio Vertical Wall Bed",
    title: "Studio Vertical Wall Bed (Traditional)",
    type: "Studio",
    sub_category: "Studio",
    orientation: "Vertical",
    parent_category: "beds",
    isMorphy: false,
    description:
      "Traditional Studio series wall bed featuring standard front panels and proven lifting pistons.",
    tagline: "Front panel vertical design",
    badge: "Traditional",
    image: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/150x200-SV-TRADITIONAL_1.webp`,
    hover_image: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/150x200-SV-TRADITIONAL_2.webp`,
    hoverImage: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/150x200-SV-TRADITIONAL_2.webp`,
    gallery: getTraditionalGallery1K("150x200", "SV", "Studio Vertical Wall Bed (Traditional)", 7),
    price_gbp: 710,
    price_euro: 710,
    price_usd: 710,
    sale_percent: 30,
    sale_price_gbp: 499,
    sale_price_euro: 499,
    sale_price_usd: 499,
    price: "from £499",
    numericPrice: 499,
    size: "11 Sizes",
    sizeLabel: "11 Available Sizes (76x190 - 180x200 cm)",
    defaultSizeSlug: "135x190",
    has_3d: false,
    has3D: false,
    colors: ["#090A0A"],
    link: "/products/beds/studio-vertical-traditional-bed",
  },
  {
    id: "flagship-traditional-studio-horizontal",
    rawId: "flagship-traditional-studio-horizontal",
    slug: "studio-horizontal-traditional-bed",
    aliases: ["studio-horizontal-bed"],
    name: "Studio Horizontal Wall Bed",
    title: "Studio Horizontal Wall Bed (Traditional)",
    type: "Studio",
    sub_category: "Studio",
    orientation: "Horizontal",
    parent_category: "beds",
    isMorphy: false,
    description:
      "Traditional Studio series horizontal fold-away bed mechanism with front decorative panel.",
    tagline: "Front panel horizontal design",
    badge: "Traditional",
    image: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/150x200-SH-TRADITIONAL_1.webp`,
    hover_image: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/150x200-SH-TRADITIONAL_2.webp`,
    hoverImage: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/150x200-SH-TRADITIONAL_2.webp`,
    gallery: getTraditionalGallery1K("150x200", "SH", "Studio Horizontal Wall Bed (Traditional)", 7),
    price_gbp: 710,
    price_euro: 710,
    price_usd: 710,
    sale_percent: 30,
    sale_price_gbp: 499,
    sale_price_euro: 499,
    sale_price_usd: 499,
    price: "from £499",
    numericPrice: 499,
    size: "11 Sizes",
    sizeLabel: "11 Available Sizes (76x190 - 180x200 cm)",
    defaultSizeSlug: "135x190",
    has_3d: false,
    has3D: false,
    colors: ["#090A0A"],
    link: "/products/beds/studio-horizontal-traditional-bed",
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
        const itemIsMorphy = Boolean(
          (item.name || "").includes("MORPHY") || (item.category || "").includes("MORPHY")
        );
        const templateIsMorphy = Boolean(template.isMorphy);
        return (
          item.type?.toLowerCase() === template.type?.toLowerCase() &&
          item.orientation?.toLowerCase() === template.orientation?.toLowerCase() &&
          itemIsMorphy === templateIsMorphy
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

    const collectedTags = Array.from(
      new Set([
        ...(template.tags || []),
        ...matching.flatMap((m) => (Array.isArray(m.tags) ? m.tags : [])),
      ])
    ).filter(Boolean);

    const defaultVariant = matching.find((m) => {
      const minDim = Math.min(Number(m.width) || 0, Number(m.length) || 0);
      const maxDim = Math.max(Number(m.width) || 0, Number(m.length) || 0);
      const slug = `${Math.round(minDim / 10)}x${Math.round(maxDim / 10)}`;
      return slug === template.defaultSizeSlug;
    }) || matching[0];

    const manualUrl =
      defaultVariant?.installation_manual ||
      template.installation_manual ||
      matching.find((m) => m.installation_manual)?.installation_manual ||
      null;

    const videoUrl =
      defaultVariant?.installation_video ||
      template.installation_video ||
      matching.find((m) => m.installation_video)?.installation_video ||
      null;

    return {
      ...template,
      installation_manual: manualUrl,
      installation_video: videoUrl,
      tags: collectedTags,
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

export const FLAGSHIP_TABLES = [
  {
    id: "flagship-coffee-dining-table",
    rawId: "table-01",
    title: "Transforming Coffee-to-Dining Table",
    slug: "transforming-coffee-dining-table",
    parent_category: "tables",
    type: "Transforming",
    categoryKey: "tables",
    image: "/sofa1.webp",
    hoverImage: "/sofa2.webp",
    gallery: [
      { src: "/sofa1.webp", alt: "Transforming Coffee-to-Dining Table - Compact Position" },
      { src: "/sofa2.webp", alt: "Transforming Coffee-to-Dining Table - Dining Position" },
    ],
    price: "from £449",
    price_gbp: 449,
    price_euro: 519,
    price_usd: 579,
    numericPrice: 449,
    size: "Adjustable 70x120 – 140x120 cm",
    sizeLabel: "Adjustable 70x120 – 140x120 cm",
    badge: "Space Saver",
    description: "Effortless gas-lift mechanism converts from a stylish living room coffee table to a full 6-person dining table.",
    link: "/products/tables/transforming-coffee-dining-table",
  },
  {
    id: "flagship-wall-mounted-folding-table",
    rawId: "table-02",
    title: "Wall-Mounted Drop-Leaf Folding Table",
    slug: "wall-mounted-folding-table",
    parent_category: "tables",
    type: "Wall-Mounted",
    categoryKey: "tables",
    image: "/sofa2.webp",
    hoverImage: "/sofa1.webp",
    gallery: [
      { src: "/sofa2.webp", alt: "Wall-Mounted Drop-Leaf Table - Folded Position" },
      { src: "/sofa1.webp", alt: "Wall-Mounted Drop-Leaf Table - Opened Position" },
    ],
    price: "from £299",
    price_gbp: 299,
    price_euro: 349,
    price_usd: 389,
    numericPrice: 299,
    size: "80x60 cm folded to 10 cm",
    sizeLabel: "80x60 cm folded to 10 cm",
    badge: "Compact Living",
    description: "Precision engineered wall-mounted folding drop-leaf desk and dining table with heavy-duty locking hinges.",
    link: "/products/tables/wall-mounted-folding-table",
  },
  {
    id: "flagship-extending-console-table",
    rawId: "table-03",
    title: "Extending Console-to-Dining Table",
    slug: "extending-console-dining-table",
    parent_category: "tables",
    type: "Extending",
    categoryKey: "tables",
    image: "/sofa1.webp",
    hoverImage: "/sofa2.webp",
    gallery: [
      { src: "/sofa1.webp", alt: "Extending Console Table - Console Position" },
      { src: "/sofa2.webp", alt: "Extending Console Table - Extended Dining Position" },
    ],
    price: "from £599",
    price_gbp: 599,
    price_euro: 689,
    price_usd: 769,
    numericPrice: 599,
    size: "45x90 to 200x90 cm",
    sizeLabel: "45x90 to 200x90 cm",
    badge: "Extends to 10 seats",
    description: "Compact hallway console table that seamlessly telescopes into an expansive dining table seating up to 10 guests.",
    link: "/products/tables/extending-console-dining-table",
  },
  {
    id: "flagship-bed-front-side-table",
    rawId: "table-04",
    title: "Compact Bed-Front Side Table",
    slug: "bed-front-side-table",
    parent_category: "tables",
    type: "Coffee & Side",
    categoryKey: "tables",
    image: "/sofa2.webp",
    hoverImage: "/sofa1.webp",
    gallery: [
      { src: "/sofa2.webp", alt: "Compact Bed-Front Side Table" },
      { src: "/sofa1.webp", alt: "Compact Bed-Front Side Table Detail" },
    ],
    price: "from £199",
    price_gbp: 199,
    price_euro: 229,
    price_usd: 259,
    numericPrice: 199,
    size: "45x45x50 cm",
    sizeLabel: "45x45x50 cm",
    badge: "Bed Compatible",
    description: "Minimalist mobile nesting side table designed to tuck smoothly beside or under wall bed front arrangements.",
    link: "/products/tables/bed-front-side-table",
  },
];

export function getDynamicFlagshipTables(rawItems = RAW_CATALOG) {
  return getDynamicFlagships(FLAGSHIP_TABLES, rawItems, "tables");
}

// ── FLAGSHIP ACCESSORIES & EXTRAS (LIGHTING, HARDWARE) ──
export const FLAGSHIP_EXTRAS = [
  {
    id: "flagship-lighting-system",
    rawId: "extra-01",
    title: "LED Bed Lighting System",
    name: "LED Bed Lighting System",
    slug: "led-lighting-system",
    parent_category: "extras",
    type: "Lighting",
    sub_category: "Lighting",
    categoryKey: "extras",
    image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
    hover_image: "/product-images/morphy-integrated/160x200.jpg",
    hoverImage: "/product-images/morphy-integrated/160x200.jpg",
    gallery: [
      { src: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp", alt: "LED Bed Lighting System" },
      { src: "/product-images/morphy-integrated/160x200.jpg", alt: "LED Bed Lighting System Installed" },
    ],
    price_gbp: 79,
    price_euro: 89,
    price_usd: 99,
    sale_percent: 0,
    price: "from £79",
    numericPrice: 79,
    size: "Universal Fit",
    sizeLabel: "Universal Fit",
    badge: "Integrated LEDs",
    description: "Touch-activated dimmable LED reading lamps and warm ambient frame illumination with flexible goosenecks and integrated USB charging.",
    link: "/products/extras/led-lighting-system",
  },
  {
    id: "flagship-hardware-kit",
    rawId: "extra-02",
    title: "Heavy-Duty Gas Struts & Hardware Kit",
    name: "Heavy-Duty Gas Struts & Hardware Kit",
    slug: "heavy-duty-gas-struts-kit",
    parent_category: "extras",
    type: "Hardware",
    sub_category: "Hardware",
    categoryKey: "extras",
    image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
    hover_image: "/product-images/morphy-integrated/160x200-6.jpg",
    hoverImage: "/product-images/morphy-integrated/160x200-6.jpg",
    gallery: [
      { src: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp", alt: "Gas Struts & Hardware Kit" },
      { src: "/product-images/morphy-integrated/160x200-6.jpg", alt: "Gas Struts Detail" },
    ],
    price_gbp: 89,
    price_euro: 99,
    price_usd: 119,
    sale_percent: 0,
    price: "from £89",
    numericPrice: 89,
    size: "Pair (Left & Right)",
    sizeLabel: "Pair (Left & Right)",
    badge: "German Gas Struts",
    description: "Replacement precision German gas piston cylinders and heavy-gauge pivot hardware calibrated for smooth counterbalance operation.",
    link: "/products/extras/heavy-duty-gas-struts-kit",
  },
];

export function getDynamicFlagshipExtras(rawItems = RAW_CATALOG) {
  return getDynamicFlagships(FLAGSHIP_EXTRAS, rawItems, "extras");
}

export const DYNAMIC_FLAGSHIP_BEDS = getDynamicFlagshipBeds(RAW_CATALOG);
export const DYNAMIC_FLAGSHIP_SOFAS = getDynamicFlagshipSofas(RAW_CATALOG);
export const DYNAMIC_FLAGSHIP_TABLES = getDynamicFlagshipTables(RAW_CATALOG);
export const DYNAMIC_FLAGSHIP_MATTRESSES = getDynamicFlagshipMattresses(RAW_CATALOG);
export const DYNAMIC_FLAGSHIP_CABINETS = getDynamicFlagshipCabinets(RAW_CATALOG);
export const DYNAMIC_FLAGSHIP_EXTRAS = getDynamicFlagshipExtras(RAW_CATALOG);

export const ALL_FLAGSHIP_PRODUCTS = [
  ...DYNAMIC_FLAGSHIP_BEDS,
  ...DYNAMIC_FLAGSHIP_SOFAS,
  ...DYNAMIC_FLAGSHIP_TABLES,
  ...DYNAMIC_FLAGSHIP_MATTRESSES,
  ...DYNAMIC_FLAGSHIP_CABINETS,
  ...DYNAMIC_FLAGSHIP_EXTRAS,
];

// All bed variants for internal lookups and configurator sizing
export const ALL_BED_VARIANTS = RAW_CATALOG.filter(
  (p) => p.parent_category === "beds"
).map(formatCatalogItem);

// Categorized product arrays
export const ALL_PRODUCTS = {
  beds: DYNAMIC_FLAGSHIP_BEDS,
  sofas: DYNAMIC_FLAGSHIP_SOFAS,
  tables: DYNAMIC_FLAGSHIP_TABLES,
  mattresses: DYNAMIC_FLAGSHIP_MATTRESSES,
  cabinets: DYNAMIC_FLAGSHIP_CABINETS,
  extras: DYNAMIC_FLAGSHIP_EXTRAS,
};

/**
 * Builds all dynamic flagships and categorized product maps
 * dynamically from any array of raw catalog items (e.g. from Supabase).
 */
export function buildCatalog(rawItems = RAW_CATALOG) {
  const dynamicFlagshipBeds = getDynamicFlagshipBeds(rawItems);
  const dynamicFlagshipSofas = getDynamicFlagshipSofas(rawItems);
  const dynamicFlagshipTables = getDynamicFlagshipTables(rawItems);
  const dynamicFlagshipMattresses = getDynamicFlagshipMattresses(rawItems);
  const dynamicFlagshipCabinets = getDynamicFlagshipCabinets(rawItems);
  const dynamicFlagshipExtras = getDynamicFlagshipExtras(rawItems);

  const allFlagships = [
    ...dynamicFlagshipBeds,
    ...dynamicFlagshipSofas,
    ...dynamicFlagshipTables,
    ...dynamicFlagshipMattresses,
    ...dynamicFlagshipCabinets,
    ...dynamicFlagshipExtras,
  ];

  const allProducts = {
    beds: dynamicFlagshipBeds,
    sofas: dynamicFlagshipSofas,
    tables: dynamicFlagshipTables,
    mattresses: dynamicFlagshipMattresses,
    cabinets: dynamicFlagshipCabinets,
    extras: dynamicFlagshipExtras,
  };

  const allBedVariants = (rawItems || [])
    .filter((p) => p.parent_category === "beds")
    .map(formatCatalogItem);

  return {
    rawCatalog: rawItems,
    allFlagships,
    allProducts,
    allBedVariants,
  };
}

// Representative popular product models for the overview / home sliders
export const POPULAR_PRODUCTS_OVERVIEW = [
  {
    id: "popular-integrated",
    title: "Integrated Vertical MORPHY™ Bed",
    orientation: "Vertical & Horizontal",
    size: "76x190 to 200x200",
    colors: ["#090A0A", "#A5988E", "#D2AA7C"],
    price: "from £699",
    numericPrice: 699,
    image: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-IV-MORPHY_1.webp`,
    hoverImage: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-IV-MORPHY_1-m.webp`,
    link: "/products/beds/integrated-vertical-wall-bed",
    categoryKey: "beds",
    has3D: true,
  },
  {
    id: "popular-classic-vertical",
    title: "Classic Vertical MORPHY™ Bed",
    orientation: "Vertical",
    size: "76x190 to 200x200",
    colors: ["#090A0A"],
    price: "from £419",
    numericPrice: 419,
    image: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-CV-MORPHY_1.webp`,
    hoverImage: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-CV-MORPHY_1-m.webp`,
    link: "/products/beds/classic-vertical-wall-bed",
    categoryKey: "beds",
    has3D: false,
  },
  {
    id: "popular-studio-vertical",
    title: "Studio Vertical MORPHY™ Bed",
    orientation: "Vertical",
    size: "76x190 to 200x200",
    colors: ["#090A0A"],
    price: "from £524",
    numericPrice: 524,
    image: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-SV-MORPHY_1.webp`,
    hoverImage: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-SV-MORPHY_1-m.webp`,
    link: "/products/beds/studio-vertical-wall-bed",
    categoryKey: "beds",
    has3D: false,
  },
  {
    id: "popular-classic-horizontal",
    title: "Classic Horizontal MORPHY™ Bed",
    orientation: "Horizontal",
    size: "76x190 to 200x200",
    colors: ["#090A0A"],
    price: "from £419",
    numericPrice: 419,
    image: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-CH-MORPHY_1.webp`,
    hoverImage: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-CH-MORPHY_1-m.webp`,
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
export const getFlagshipBed = (type = "Classic", orientation = "Vertical", isMorphy = true) => {
  const normType = String(type).toLowerCase();
  const normOrient = String(orientation).toLowerCase();

  return (
    FLAGSHIP_BEDS.find(
      (f) =>
        f.type.toLowerCase() === normType &&
        f.orientation.toLowerCase() === normOrient &&
        Boolean(f.isMorphy) === Boolean(isMorphy)
    ) ||
    FLAGSHIP_BEDS.find(
      (f) =>
        f.type.toLowerCase() === normType &&
        f.orientation.toLowerCase() === normOrient
    ) ||
    FLAGSHIP_BEDS[0]
  );
};

// Look up a product by slug or ID
export const findProductBySlug = (
  categorySlug,
  productSlug,
  rawCatalog = RAW_CATALOG,
  allFlagships = null
) => {
  if (!productSlug) return null;
  const cleanSlug = productSlug.toLowerCase();
  const flagships = allFlagships || ALL_FLAGSHIP_PRODUCTS;
  const catalog = rawCatalog || RAW_CATALOG;

  // 1. Exact match or alias match against ALL Flagship products (beds, sofas, mattresses, cabinets)
  const flagshipMatch = flagships.find(
    (f) =>
      f.slug === cleanSlug ||
      (f.aliases && f.aliases.some((a) => a.toLowerCase() === cleanSlug))
  );
  if (flagshipMatch) {
    return { ...flagshipMatch };
  }

  // 2. Special backward compatibility alias for integrated-bed
  if (cleanSlug === "integrated-bed") {
    const integratedFlagship = flagships.find(
      (f) => f.slug === "integrated-vertical-wall-bed"
    );
    if (integratedFlagship) {
      return { ...integratedFlagship, slug: "integrated-bed" };
    }
  }

  // 3. Search by exact slug or match in catalog
  const rawItem = catalog.find(
    (p) =>
      p.slug === cleanSlug ||
      String(p.id) === cleanSlug ||
      `wbk-${p.id}` === cleanSlug
  );

  if (rawItem) {
    return formatCatalogItem(rawItem);
  }

  // 4. Substring match
  const subMatch = catalog.find(
    (p) => p.slug && (p.slug.includes(cleanSlug) || cleanSlug.includes(p.slug))
  );
  if (subMatch) {
    return formatCatalogItem(subMatch);
  }

  return getFallbackProduct(categorySlug, productSlug);
};

// Get all matching variant items for the same family/model
export const getProductVariants = (currentProduct, rawCatalog = RAW_CATALOG) => {
  if (!currentProduct) return [];
  const catalog = rawCatalog || RAW_CATALOG;
  const parentCat = currentProduct.parent_category || "beds";
  const type = currentProduct.type || "Classic";
  const subCategory = currentProduct.sub_category || type;
  const orientation = currentProduct.orientation || "Vertical";

  if (parentCat === "beds") {
    const isMorphy = Boolean(
      currentProduct.isMorphy ??
      ((currentProduct.name || "").includes("MORPHY") || (currentProduct.title || "").includes("MORPHY"))
    );

    // Return all size variants for this specific flagship (type + orientation + isMorphy)
    const matching = catalog.filter((p) => {
      if (p.parent_category !== "beds") return false;
      if (p.type?.toLowerCase() !== type.toLowerCase()) return false;
      if (p.orientation?.toLowerCase() !== orientation.toLowerCase()) return false;
      const itemIsMorphy = Boolean(
        (p.name || "").includes("MORPHY") || (p.category || "").includes("MORPHY")
      );
      return itemIsMorphy === isMorphy;
    });

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
    const matching = catalog.filter(
      (p) =>
        p.parent_category === "sofas" &&
        (p.sub_category?.toLowerCase() === subCategory.toLowerCase() ||
         p.type?.toLowerCase() === type.toLowerCase())
    );
    matching.sort((a, b) => (a.id || 0) - (b.id || 0));
    return matching.map(formatCatalogItem);
  }

  if (parentCat === "mattresses") {
    const matching = catalog.filter(
      (p) =>
        p.parent_category === "mattresses" &&
        (p.sub_category?.toLowerCase() === subCategory.toLowerCase() ||
         p.type?.toLowerCase() === type.toLowerCase())
    );
    matching.sort((a, b) => (a.width || 0) - (b.width || 0));
    return matching.map(formatCatalogItem);
  }

  if (parentCat === "cabinets") {
    const matching = catalog.filter(
      (p) =>
        p.parent_category === "cabinets" &&
        (p.sub_category?.toLowerCase() === subCategory.toLowerCase() ||
         p.type?.toLowerCase() === type.toLowerCase())
    );
    matching.sort((a, b) => (a.price_gbp || 0) - (b.price_gbp || 0));
    return matching.map(formatCatalogItem);
  }

  return catalog.filter((p) => p.parent_category === parentCat).map(
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
