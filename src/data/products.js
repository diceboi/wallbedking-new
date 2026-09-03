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

// Helpers to derive clean dimensions, size labels and slugs
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

export const getCleanBedSizeLabel = (item) => {
  if (!item) return "";
  if (item.parent_category !== "beds") {
    return item.size_label || item.sizeLabel || item.name;
  }
  const { widthCm, lengthCm } = getCleanBedDimensions(item);
  let baseName = item.name
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

  const isMorphy = item.name.includes("MORPHY");
  return `${baseName}${isMorphy ? " MORPHY™" : ""} (${widthCm}x${lengthCm} cm)`;
};

export const getCleanBedSizeSlug = (item) => {
  if (!item) return "";
  const { widthCm, lengthCm } = getCleanBedDimensions(item);
  return `${widthCm}x${lengthCm}`;
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

  const sizeLabel =
    item.parent_category === "beds"
      ? getCleanBedSizeLabel(item)
      : item.size_label || item.size_category;

  const sizeSlug =
    item.parent_category === "beds"
      ? getCleanBedSizeSlug(item)
      : (item.slug || String(item.id));

  return {
    ...item,
    id: `wbk-${item.id}`,
    rawId: item.id,
    title: item.name,
    price: `£${item.price_gbp}`,
    numericPrice: item.price_gbp,
    salePrice: item.sale_price_gbp ? `£${item.sale_price_gbp}` : null,
    size: item.size_category,
    sizeLabel,
    sizeSlug,
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

/**
 * Computes starting prices ("from") dynamically for flagship beds
 * based on the cheapest matching product variant in Supabase / catalog.
 */
export function getDynamicFlagshipBeds(rawItems = RAW_CATALOG) {
  const bedItems = rawItems.filter((p) => p.parent_category === "beds");

  return FLAGSHIP_BEDS.map((template) => {
    const matching = bedItems.filter(
      (item) =>
        item.type?.toLowerCase() === template.type?.toLowerCase() &&
        item.orientation?.toLowerCase() === template.orientation?.toLowerCase()
    );

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

    return {
      ...template,
      price_gbp: minGbp,
      price_euro: minEuro,
      price_usd: minUsd,
      sale_price_gbp: minSaleGbp,
      sale_price_euro: minSaleEuro,
      sale_price_usd: minSaleUsd,
      sale_percent: template.sale_percent,
    };
  });
}

export const DYNAMIC_FLAGSHIP_BEDS = getDynamicFlagshipBeds(RAW_CATALOG);

// All bed variants for internal lookups and configurator sizing
export const ALL_BED_VARIANTS = RAW_CATALOG.filter(
  (p) => p.parent_category === "beds"
).map(formatCatalogItem);

// Categorized product arrays
export const ALL_PRODUCTS = {
  beds: DYNAMIC_FLAGSHIP_BEDS,
  sofas: RAW_CATALOG.filter((p) => p.parent_category === "sofas").map(formatCatalogItem),
  mattresses: RAW_CATALOG.filter((p) => p.parent_category === "mattresses").map(formatCatalogItem),
  cabinets: RAW_CATALOG.filter((p) => p.parent_category === "cabinets").map(formatCatalogItem),
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
    title: "Sofa Bed Front Module",
    orientation: "Modular",
    size: "80cm to 140cm",
    colors: ["#D2AA7C", "#A5988E"],
    price: "from £499",
    numericPrice: 499,
    image: "/sofa1.webp",
    hoverImage: "/sofa2.webp",
    link: "/products/sofas/sofa-1000-bed-front-100-8x86-7",
    categoryKey: "sofas",
    has3D: false,
  },
  {
    id: "popular-sofa-freestanding",
    title: "Sofa Free Standing Module",
    orientation: "Modular",
    size: "80cm to 140cm",
    colors: ["#D2AA7C", "#A5988E"],
    price: "from £499",
    numericPrice: 499,
    image: "/sofa2.webp",
    hoverImage: "/sofa3.webp",
    link: "/products/sofas/sofa-1000-free-standing-107-2x83-4",
    categoryKey: "sofas",
    has3D: false,
  },
  {
    id: "popular-comfort-mattress",
    title: "Comfort Mattress Range",
    orientation: "Universal",
    size: "90x190 to 150x200",
    colors: ["#FFFFFF"],
    price: "from £299",
    numericPrice: 299,
    image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    hoverImage: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
    link: "/products/mattresses/single-comfort-mattress-90x190x20",
    categoryKey: "mattresses",
    has3D: false,
  },
  {
    id: "popular-cabinets",
    title: "Vertical & Horizontal Cabinets",
    orientation: "Universal",
    size: "Pine, Beech, Oak, White",
    colors: ["#A5988E", "#E4E0DE", "#FFFFFF"],
    price: "from £439",
    numericPrice: 439,
    image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
    hoverImage: "/product-images/morphy-integrated/160x200-8.jpg",
    link: "/products/cabinets/single-vertical-cabinet-pine-115x52x215",
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

  // 1. Exact match against the 6 Flagship beds
  const flagshipMatch = FLAGSHIP_BEDS.find((f) => f.slug === cleanSlug);
  if (flagshipMatch) {
    return { ...flagshipMatch };
  }

  // 2. Special backward compatibility alias for integrated-bed
  if (cleanSlug === "integrated-bed") {
    const integratedFlagship = FLAGSHIP_BEDS.find(
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
  const orientation = currentProduct.orientation || "Vertical";

  if (parentCat === "beds") {
    // Return all size variants for this specific flagship (type + orientation)
    const matching = RAW_CATALOG.filter(
      (p) =>
        p.parent_category === "beds" &&
        p.type === type &&
        p.orientation === orientation
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
