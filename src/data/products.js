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

// Helper to convert catalog item to uniform UI product
const formatCatalogItem = (item) => {
  const isIntegrated = item.type === "Integrated" || item.has_3d;
  const gallery = (item.product_images && item.product_images.length > 0)
    ? item.product_images.map((src, i) => ({ src, alt: `${item.name} View ${i + 1}` }))
    : isIntegrated ? GLOBAL_GALLERY_TEMPLATES : [
        { src: item.image, alt: item.name },
        { src: item.hover_image, alt: `${item.name} Open` }
      ];

  return {
    ...item,
    id: `wbk-${item.id}`,
    rawId: item.id,
    title: item.name,
    price: `£${item.price_gbp}`,
    numericPrice: item.price_gbp,
    salePrice: item.sale_price_gbp ? `£${item.sale_price_gbp}` : null,
    size: item.size_category,
    sizeLabel: item.size_label,
    colors: item.color === "Beige" ? ["#D2AA7C"] : item.color === "Grey" ? ["#A5988E"] : item.color === "White" ? ["#FFFFFF"] : ["#090A0A"],
    gallery: gallery,
    has3D: Boolean(item.has_3d),
  };
};

// Categorized product arrays
export const ALL_PRODUCTS = {
  beds: RAW_CATALOG.filter((p) => p.parent_category === "beds").map(formatCatalogItem),
  sofas: RAW_CATALOG.filter((p) => p.parent_category === "sofas").map(formatCatalogItem),
  mattresses: RAW_CATALOG.filter((p) => p.parent_category === "mattresses").map(formatCatalogItem),
  cabinets: RAW_CATALOG.filter((p) => p.parent_category === "cabinets").map(formatCatalogItem),
  extras: RAW_CATALOG.filter((p) => p.parent_category === "extras").map(formatCatalogItem),
};

// Representative popular product models for the overview / home sliders
export const POPULAR_PRODUCTS_OVERVIEW = [
  {
    id: "popular-integrated",
    title: "Integrated MORPHY™ Bed",
    orientation: "Vertical & Horizontal",
    size: "76x190 to 200x200",
    colors: ["#090A0A", "#A5988E", "#D2AA7C"],
    price: "from £749",
    numericPrice: 749,
    image: "/product-images/morphy-integrated/160x200.jpg",
    hoverImage: "/product-images/morphy-integrated/160x200-3.jpg",
    link: "/products/beds/integrated-bed",
    categoryKey: "beds",
    has3D: true,
  },
  {
    id: "popular-classic-morphy",
    title: "Classic MORPHY™ Bed",
    orientation: "Vertical & Horizontal",
    size: "76x190 to 200x200",
    colors: ["#090A0A"],
    price: "from £749",
    numericPrice: 749,
    image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
    hoverImage: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    link: "/products/beds/single-vertical-classic-morphy-bed-90x190",
    categoryKey: "beds",
    has3D: false,
  },
  {
    id: "popular-studio-morphy",
    title: "Studio MORPHY™ Bed",
    orientation: "Vertical & Horizontal",
    size: "76x190 to 200x200",
    colors: ["#090A0A"],
    price: "from £999",
    numericPrice: 999,
    image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
    hoverImage: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    link: "/products/beds/single-vertical-studio-morphy-bed-90x190",
    categoryKey: "beds",
    has3D: false,
  },
  {
    id: "popular-classic-base",
    title: "Classic Wall Bed",
    orientation: "Vertical & Horizontal",
    size: "76x190 to 200x180",
    colors: ["#090A0A"],
    price: "from £599",
    numericPrice: 599,
    image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
    hoverImage: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    link: "/products/beds/single-vertical-classic-bed-90x190",
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

// Look up a product by slug or ID
export const findProductBySlug = (categorySlug, productSlug) => {
  if (!productSlug) return null;
  const cleanSlug = productSlug.toLowerCase();

  // Special alias for integrated-bed
  if (cleanSlug === "integrated-bed") {
    const found = RAW_CATALOG.find((p) => p.slug === "european-king-vertical-integrated-morphy-bed-160x200") || RAW_CATALOG[135];
    return formatCatalogItem({ ...found, slug: "integrated-bed", name: "Integrated MORPHY™ Bed", has_3d: true });
  }

  // Search by exact slug or match
  const rawItem = RAW_CATALOG.find(
    (p) => p.slug === cleanSlug || String(p.id) === cleanSlug || `wbk-${p.id}` === cleanSlug
  );

  if (rawItem) {
    return formatCatalogItem(rawItem);
  }

  // Substring match
  const subMatch = RAW_CATALOG.find((p) => p.slug.includes(cleanSlug) || cleanSlug.includes(p.slug));
  if (subMatch) {
    return formatCatalogItem(subMatch);
  }

  return getFallbackProduct(categorySlug, productSlug);
};

// Get all matching variant items for the same family/model
export const getProductVariants = (currentProduct) => {
  if (!currentProduct) return [];
  const type = currentProduct.type || "Classic";
  const parentCat = currentProduct.parent_category || "beds";

  return RAW_CATALOG.filter((p) => {
    if (parentCat === "beds") {
      return p.parent_category === "beds" && p.type === type;
    }
    return p.parent_category === parentCat;
  }).map(formatCatalogItem);
};

// Fallback generator for unknown product slugs
export const getFallbackProduct = (categorySlug, productSlug) => {
  const cleanSlug = productSlug || "integrated-bed";
  const title = cleanSlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  const isSofa = cleanSlug.toLowerCase().includes("sofa") || (categorySlug && categorySlug.toLowerCase().includes("sofa"));
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
    image: isIntegrated ? "/product-images/morphy-integrated/160x200.jpg" : isSofa ? "/sofa1.webp" : "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
    hoverImage: isIntegrated ? "/product-images/morphy-integrated/160x200-3.jpg" : "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    orientation: "Vertical",
    size: "King",
    sizeLabel: "King 160 x 200",
    categoryKey: categorySlug || "beds",
    parent_category: categorySlug || "beds",
    type: isIntegrated ? "Integrated" : "Classic",
    gallery: isIntegrated ? GLOBAL_GALLERY_TEMPLATES : [
      { src: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp", alt: title },
      { src: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp", alt: `${title} Open` }
    ],
  };
};
