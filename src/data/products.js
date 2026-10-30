// Central Product & Category Catalog for WallBedKing
import catalog from './products-catalog.json';
import bundlesCatalog from './bundles.json';
import tablesCatalogData from './tables-catalog.json';

export const TABLES_CATALOG_VARIANTS = tablesCatalogData?.variants || [];
export const TABLES_FLAGSHIP_LIST = tablesCatalogData?.flagships || [];

export const RAW_CATALOG = [...catalog, ...TABLES_CATALOG_VARIANTS];

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
    label_fr: "Lits Escamotables",
    title_fr: "Lits Escamotables",
    slug: "beds",
    description: "Premium space-saving fold-away beds featuring our next-generation MORPHY™ series and Traditional mechanism collections.",
    description_fr: "Lits escamotables verticaux et horizontaux haut de gamme avec vérins à gaz et sommier à lattes intégré.",
    image: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-CV-MORPHY_5.webp`,
    hoverImage: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-CV-MORPHY_1-m.webp`,
    subcategories: ["Classic", "Studio", "Integrated"]
  },
  "morphy-beds": {
    label: "MORPHY™ Beds",
    title: "MORPHY™ Beds",
    label_fr: "Lits escamotables Morphy",
    title_fr: "Lits escamotables Morphy",
    slug: "beds?collection=morphy",
    description: "Next-generation MORPHY™ foldaway wall beds engineered with precision German gas pistons and integrated comfort.",
    description_fr: "Lits escamotables MORPHY™ nouvelle génération dotés de pistons à gaz de précision et d'un confort intégré.",
    image: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-CV-MORPHY_5.webp`,
    hoverImage: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-CV-MORPHY_1-m.webp`,
    subcategories: ["Classic", "Studio", "Integrated"]
  },
  "traditional-beds": {
    label: "Clearance",
    title: "Clearance",
    label_de: "Abverkauf",
    title_de: "Abverkauf",
    label_fr: "Déstockage",
    title_fr: "Déstockage",
    label_es: "Liquidación",
    title_es: "Liquidación",
    label_it: "Liquidazione",
    title_it: "Liquidazione",
    label_por: "Liquidação",
    title_por: "Liquidação",
    slug: "beds?collection=traditional",
    description: "High-quality foldaway clearance wall beds with proven mechanism and solid engineering at special clearance prices.",
    description_fr: "Lits escamotables traditionnels éprouvés avec mécanisme fiable et structure robuste.",
    image: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-CV-TRADITIONAL_1.webp`,
    hoverImage: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-CV-TRADITIONAL_2.webp`,
    subcategories: ["Classic", "Studio"]
  },
  sofas: {
    label: "Sofas",
    title: "Sofas & Seating Modules",
    label_fr: "Canapés",
    title_fr: "Canapés",
    slug: "sofas",
    description: "Modular seating systems engineered for bed front integration and free-standing living comfort.",
    description_fr: "Canapés modulaires et banquettes conçus spécifiquement pour s'intégrer devant les lits escamotables WallBedKing.",
    image: "/sofa1.webp",
    subcategories: ["Bed Front", "Free Standing"]
  },
  tables: {
    label: "Smart Tables",
    title: "Space Saving & Transforming Tables",
    label_fr: "Tables & Bureaux",
    title_fr: "Tables & Bureaux",
    slug: "tables",
    description: "Multifunctional expanding dining tables, lift-top coffee tables, wall desks and 5-in-1 modular stools.",
    description_fr: "Tables multifonctions, réglables en hauteur et extensibles conçues pour les espaces compacts.",
    image: "/product-images/tables/b2473m-transformer-storage-shelf-to-dining-table/transformer-storage-shelf-to-dining-table070015e9-9b6d-43bb-bb5d-3c35b18ed648.webp",
    hoverImage: "/product-images/tables/b2473m-transformer-storage-shelf-to-dining-table/transformer-storage-shelf-to-dining-tablee477d391-4f57-480d-bd52-10d39d901e6d.webp",
    subcategories: ["Dining Tables", "Coffee & Lifting Tables", "Desks & Wall Tables", "Cube Stools", "Benches"]
  },
  mattresses: {
    label: "Mattresses",
    title: "Comfort, Luxury & Supreme Mattresses",
    label_fr: "Matelas",
    title_fr: "Matelas",
    slug: "mattresses",
    description: "After extensive research and development, we have found the perfect match for our wall beds: the WBK Mattress Range. Designed for maximum durability, optimal weight balance, and everyday comfort.",
    description_fr: "Matelas orthopédiques à mémoire de forme et ressorts ensachés rigoureusement testés pour le stockage vertical.",
    image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    subcategories: ["Comfort", "Luxury", "Supreme"]
  },
  cabinets: {
    label: "Cabinets",
    title: "Cabinets & Storage Units",
    label_fr: "Armoires & Rangement",
    title_fr: "Armoires & Rangement",
    slug: "cabinets",
    description: "Our cabinets are perfectly designed to encase and compliment the Classic Range wall beds. The cabinet enclosures offer a neat, attractive and tidy way to store your wall bed away when not in use - keeping your bed, mattress and bedding dust-free and in pristine condition.",
    description_fr: "Armoires modulaires, étagères et ponts de lit assortis conçus pour compléter vos lits escamotables.",
    image: `${SUPABASE_CABINET_IMAGES_BASE}/1K/160x200-KV-WHITE-CABINET_ANGLE_1.webp`,
    subcategories: ["Vertical", "Horizontal", "Extensions", "Side Units"]
  },
  extras: {
    label: "Extras",
    title: "Extras & Accessories",
    label_fr: "Accessoires",
    title_fr: "Accessoires",
    slug: "extras",
    description: "Lighting systems, tension accessories, and modular hardware.",
    description_fr: "Systèmes d'éclairage, accessoires de tension et quincaillerie modulaire.",
    image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
    subcategories: ["Lighting", "Hardware"]
  },
  bundles: {
    label: "Bundles & Packages",
    title: "Bed & Cabinet Packages",
    label_fr: "Ensembles et Lots",
    title_fr: "Ensembles Lit et Armoire",
    slug: "bundles",
    description: "Complete wall bed packages with matching cabinets. Guaranteed fit, seamless aesthetics, and bundle savings.",
    description_fr: "Packs complets lit escamotable et armoire assortie. Compatibilité garantie et économies sur votre pack.",
    image: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/cabinets/1K/90x200-SV-WHITE-CABINET_ANGLE_1.webp",
    subcategories: ["Classic+ Packages", "Morphy Sets"]
  },
};

export const SUPABASE_MATTRESS_IMAGES_BASE =
  "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/mattresses";

export const OTHER_CATEGORIES_LIST = [
  {
    id: "morphyBeds",
    slug: "beds?collection=morphy",
    categoryKey: "morphy",
    label: "MORPHY™ Beds",
    titleKey: "nav.morphyBeds",
    image: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-CV-MORPHY_5.webp`,
  },
  {
    id: "traditionalBeds",
    slug: "beds?collection=traditional",
    categoryKey: "traditional",
    label: "Clearance",
    titleKey: "nav.traditionalBeds",
    image: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-CV-TRADITIONAL_1.webp`,
  },
  {
    id: "cabinets",
    slug: "cabinets",
    categoryKey: "cabinets",
    label: "Cabinets",
    titleKey: "nav.cabinets",
    image: `${SUPABASE_CABINET_IMAGES_BASE}/1K/140x200-DV-OAK-CABINET_ANGLE_1.webp`,
  },
  {
    id: "mattresses",
    slug: "mattresses",
    categoryKey: "mattresses",
    label: "Mattresses",
    titleKey: "nav.mattresses",
    image: `${SUPABASE_MATTRESS_IMAGES_BASE}/comfort.webp`,
  },
];


import { resolveFactorySize } from '../lib/sizes';

// Helpers to derive clean dimensions, size labels and slugs across all product categories
export const getCleanBedDimensions = (item) => {
  const isBed =
    item?.parent_category === "beds" ||
    item?.parent_category === "morphy-beds" ||
    item?.parent_category === "traditional-beds";
  if (!item || !isBed) {
    return {
      widthCm: item?.width ? Math.round(item.width / 10) : 0,
      lengthCm: item?.length ? Math.round(item.length / 10) : 0,
    };
  }
  const w = Math.min(item.width || 0, item.length || 0) / 10;
  const l = Math.max(item.width || 0, item.length || 0) / 10;
  return { widthCm: Math.round(w), lengthCm: Math.round(l) };
};

export const getProductSizeInfo = (item, locale = "en") => {
  if (!item) return { size: "Standard", sizeLabel: "Standard", sizeSlug: "", size_eu: "Standard", size_us: "Standard" };

  const isUS = (locale || "en").toLowerCase() === "us";
  const factory = resolveFactorySize(item);

  const isBed =
    item.parent_category === "beds" ||
    item.parent_category === "morphy-beds" ||
    item.parent_category === "traditional-beds";

  // 1. Murphy Beds
  if (isBed) {
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
    const euLabel = `${baseName}${isMorphy ? " MORPHY™" : ""} (${widthCm}x${lengthCm} cm)`;
    const usLabel = factory?.usLabel || (factory?.usInches ? `${factory.usInches}` : `${widthCm}x${lengthCm} cm`);
    const slug = `${widthCm}x${lengthCm}`;
    const slugUs = factory?.cmKey ? factory.cmKey : slug;

    return {
      size: isUS ? (factory?.nameUs || usLabel) : baseName,
      sizeLabel: isUS ? usLabel : euLabel,
      sizeSlug: slug,
      sizeSlug_us: slugUs,
      size_eu: `${widthCm}x${lengthCm} cm`,
      size_us: usLabel,
      sizeLabel_eu: euLabel,
      sizeLabel_us: usLabel,
    };
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
    const euLabel = `${mattressSize}${dim}`;
    const usLabel = factory?.usLabel || (factory?.usInches ? `${factory.usInches}` : euLabel);
    const slug = wCm && lCm ? `${wCm}x${lCm}` : (item.slug || String(item.id));

    return {
      size: isUS ? (factory?.nameUs || usLabel) : mattressSize,
      sizeLabel: isUS ? usLabel : euLabel,
      sizeSlug: slug,
      size_eu: wCm && lCm ? `${wCm}x${lCm} cm` : mattressSize,
      size_us: usLabel,
      sizeLabel_eu: euLabel,
      sizeLabel_us: usLabel,
    };
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

    const wCm = item.width ? Math.round(Number(item.width) / 10) : 0;
    const hCm = item.height ? Math.round(Number(item.height) / 10) : 0;
    const dCm = item.length ? Math.round(Number(item.length) / 10) : 0;
    const dim3 =
      wCm && hCm && dCm
        ? `W ${wCm} x H ${hCm} x D ${dCm}`
        : wCm && dCm
        ? `${wCm}x${dCm} cm`
        : "";
    const dim3WithCm = dim3 ? `${dim3} cm` : "";
    const wIn = wCm ? Math.round(wCm / 2.54) : 0;
    const hIn = hCm ? Math.round(hCm / 2.54) : 0;
    const dIn = dCm ? Math.round(dCm / 2.54) : 0;
    const dim3Us =
      wIn && hIn && dIn
        ? `W ${wIn}" x H ${hIn}" x D ${dIn}"`
        : dim3WithCm;
    const euLabel = cabSize ? `${cabSize} – ${dim3}` : dim3;
    const usLabel = cabSize ? `${cabSize} – ${dim3Us}` : dim3Us;
    let slug = wCm && dCm ? `${wCm}x${dCm}` : (item.slug || String(item.id));
    if (/side\s*unit/i.test(name)) {
      if (/door/i.test(name)) slug = `${slug}-door`;
      else if (/shelves/i.test(name)) slug = `${slug}-shelves`;
    }
    return {
      size: isUS ? (factory?.nameUs || usLabel) : (cabSize || dim3),
      sizeLabel: isUS ? usLabel : euLabel,
      sizeSlug: slug,
      size_eu: dim3WithCm,
      size_us: dim3Us,
      sizeLabel_eu: euLabel,
      sizeLabel_us: usLabel,
    };
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
    const euLabel = `${sofaSize}${dim}`;
    const wIn = wCm ? Math.round(wCm / 2.54) : 0;
    const lIn = lCm ? Math.round(lCm / 2.54) : 0;
    const usLabel = wIn && lIn ? `${sofaSize} (${wIn}" x ${lIn}")` : euLabel;
    const slug = wCm && lCm ? `${wCm}x${lCm}` : (item.slug || String(item.id));
    return {
      size: isUS ? usLabel : sofaSize,
      sizeLabel: isUS ? usLabel : euLabel,
      sizeSlug: slug,
      size_eu: wCm && lCm ? `${wCm}x${lCm} cm` : sofaSize,
      size_us: usLabel,
      sizeLabel_eu: euLabel,
      sizeLabel_us: usLabel,
    };
  }

  // 5. Fallback for extras and other categories
  const fallbackLabel = item.size_label || item.size_category || item.name || "Standard";
  const fallbackSize = item.size_category || "Standard";
  return {
    size: fallbackSize,
    sizeLabel: fallbackLabel,
    sizeSlug: item.slug || String(item.id),
    size_eu: fallbackLabel,
    size_us: fallbackLabel,
    sizeLabel_eu: fallbackLabel,
    sizeLabel_us: fallbackLabel,
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

  const fallbackImg = isMorphy
    ? `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-CV-MORPHY_5.webp`
    : `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-CV-TRADITIONAL_1.webp`;
  const fallbackHover = isMorphy
    ? `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-CV-MORPHY_1-m.webp`
    : `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-CV-TRADITIONAL_2.webp`;

  const itemImg = item.image || fallbackImg;
  const itemHov = item.hover_image || item.hoverImage || fallbackHover;

  const parentCat = (item.parent_category || "beds").toLowerCase();
  const isBed =
    parentCat === "beds" ||
    parentCat === "morphy-beds" ||
    parentCat === "traditional-beds";

  let defaultBedGallery = null;
  if (isBed) {
    const o = (item.orientation || "Vertical").toLowerCase().startsWith("h") ? "CH" : "CV";
    const s = (item.type || item.sub_category || "Classic").toLowerCase();
    const code = s.includes("int") ? (o === "CH" ? "IH" : "IV") : s.includes("stu") ? (o === "CH" ? "SH" : "SV") : o;
    const sizeKey = "160x200";
    defaultBedGallery = isMorphy
      ? getMorphyGallery2K(sizeKey, code, item.name || "MORPHY™ Bed")
      : getTraditionalGallery1K(sizeKey, code, item.name || "Traditional Wall Bed", s.includes("stu") ? 7 : 9);
  }

  const gallery =
    item.product_images && item.product_images.length > 0
      ? item.product_images.map((src, i) => ({
          src,
          alt: i === 1 ? `${item.name} - With Mattress` : `${item.name} View ${i + 1}`,
        }))
      : defaultBedGallery
      ? defaultBedGallery
      : isIntegrated
      ? GLOBAL_GALLERY_TEMPLATES
      : [
          { src: itemImg, alt: item.name },
          { src: itemHov, alt: `${item.name} Open` },
        ];

  const sizeInfo = getProductSizeInfo(item);
  const itemLink =
    item.link ||
    (parentCat === "beds" || parentCat === "morphy-beds" || parentCat === "traditional-beds"
      ? `/products/beds/${item.slug || `test-product-${item.id}`}`
      : `/products/${parentCat}/${item.slug || item.id}`);

  return {
    ...item,
    id: `wbk-${item.id}`,
    rawId: item.id,
    title: item.name,
    image: itemImg,
    hoverImage: itemHov,
    hover_image: itemHov,
    link: itemLink,
    isMorphy,
    badge: isMorphy ? "MORPHY™" : (item.badge || "Traditional"),
    price: `£${item.price_gbp}`,
    numericPrice: item.price_gbp,
    salePrice: item.sale_price_gbp ? `£${item.sale_price_gbp}` : null,
    size: sizeInfo.size,
    sizeLabel: sizeInfo.sizeLabel,
    sizeSlug: sizeInfo.sizeSlug,
    sizeSlug_us: sizeInfo.sizeSlug_us,
    size_eu: sizeInfo.size_eu,
    size_us: sizeInfo.size_us,
    sizeLabel_eu: sizeInfo.sizeLabel_eu,
    sizeLabel_us: sizeInfo.sizeLabel_us,
    colors:
      item.color === "Beige"
        ? ["#D2AA7C"]
        : item.color === "Grey"
        ? ["#A5988E"]
        : item.color === "White"
        ? ["#FFFFFF"]
        : item.color === "Oak"
        ? ["#BCA37F"]
        : item.color === "Beech"
        ? ["#D8AC78"]
        : item.color === "Pine"
        ? ["#E8CE9B"]
        : ["#090A0A"],
    gallery,
    has3D: Boolean(item.has_3d),
  };
};

// ── FLAGSHIP BED MODELS (MORPHY™ & TRADITIONAL) ──
export const FLAGSHIP_BEDS = [
  // ── MORPHY™ CONSOLIDATED FLAGSHIP MODELS (1K CARDS, 2K GALLERIES) ──
  {
    id: "flagship-classic-morphy",
    rawId: "flagship-classic-morphy",
    slug: "classic-morphy-bed",
    aliases: [
      "classic-vertical-wall-bed",
      "classic-horizontal-wall-bed",
      "classic-vertical-morphy-bed",
      "classic-horizontal-morphy-bed",
      "classic-wall-bed",
    ],
    name: "Classic MORPHY™ Bed",
    title: "Classic MORPHY™ Bed",
    name_fr: "Lit Escamotable Classique MORPHY™",
    title_fr: "Lit Escamotable Classique MORPHY™",
    type: "Classic",
    sub_category: "Classic",
    orientation: "Vertical & Horizontal",
    parent_category: "beds",
    isMorphy: true,
    description:
      "The Classic MORPHY™ Bed is our next-generation fold-away mechanism engineered for everyday durability. Designed with high-performance counterbalanced gas pistons and an all-steel reinforced frame. Available in both Vertical and Horizontal configurations.",
    tagline: "Core mechanism, vertical & horizontal",
    badge: "MORPHY™",
    image: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-CV-MORPHY_5.webp`,
    hover_image: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-CV-MORPHY_1-m.webp`,
    hoverImage: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-CV-MORPHY_1-m.webp`,
    gallery: getMorphyGallery2K("160x200", "CV", "Classic MORPHY™ Bed"),
    price_gbp: 749,
    price_euro: 749,
    price_usd: 1099,
    sale_percent: null,
    sale_price_gbp: null,
    sale_price_euro: null,
    sale_price_usd: null,
    price: "from £749",
    numericPrice: 749,
    size: "19 Sizes",
    sizeLabel: "19 Available Sizes (76x190 - 200x200 cm)",
    defaultSizeSlug: "160x200",
    has_3d: false,
    has3D: false,
    colors: ["#090A0A"],
    link: "/products/beds/classic-morphy-bed",
  },
  {
    id: "flagship-studio-morphy",
    rawId: "flagship-studio-morphy",
    slug: "studio-morphy-bed",
    aliases: [
      "studio-vertical-wall-bed",
      "studio-horizontal-wall-bed",
      "studio-vertical-morphy-bed",
      "studio-horizontal-morphy-bed",
    ],
    name: "Studio MORPHY™ Bed",
    title: "Studio MORPHY™ Bed",
    name_fr: "Lit Escamotable Studio MORPHY™",
    title_fr: "Lit Escamotable Studio MORPHY™",
    type: "Studio",
    sub_category: "Studio",
    orientation: "Vertical & Horizontal",
    parent_category: "beds",
    isMorphy: true,
    description:
      "Features front decorative panels, modern aesthetics, and smooth gas-assisted lifting. Perfect as a standalone statement wall bed with contemporary MORPHY™ styling in Vertical and Horizontal layouts.",
    tagline: "With decorative front panel",
    badge: "MORPHY™",
    image: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-SV-MORPHY_5.webp`,
    hover_image: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-SV-MORPHY_1-m.webp`,
    hoverImage: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-SV-MORPHY_1-m.webp`,
    gallery: getMorphyGallery2K("160x200", "SV", "Studio MORPHY™ Bed"),
    price_gbp: 999,
    price_euro: 999,
    price_usd: 1549,
    sale_percent: null,
    sale_price_gbp: null,
    sale_price_euro: null,
    sale_price_usd: null,
    price: "from £999",
    numericPrice: 999,
    size: "19 Sizes",
    sizeLabel: "19 Available Sizes (76x190 - 200x200 cm)",
    defaultSizeSlug: "160x200",
    has_3d: false,
    has3D: false,
    colors: ["#090A0A"],
    link: "/products/beds/studio-morphy-bed",
  },
  {
    id: "flagship-integrated-morphy",
    rawId: "flagship-integrated-morphy",
    slug: "integrated-morphy-bed",
    aliases: [
      "integrated-vertical-wall-bed",
      "integrated-horizontal-wall-bed",
      "integrated-vertical-morphy-bed",
      "integrated-horizontal-morphy-bed",
      "integrated-bed",
    ],
    name: "Integrated MORPHY™ Bed",
    title: "Integrated MORPHY™ Bed",
    name_fr: "Lit Escamotable Intégré MORPHY™",
    title_fr: "Lit Escamotable Intégré MORPHY™",
    type: "Integrated",
    sub_category: "Integrated",
    orientation: "Vertical & Horizontal",
    parent_category: "beds",
    isMorphy: true,
    description:
      "Engineered specifically to seamlessly fit inside custom cabinetry, bespoke wardrobes, and modular storage systems. Precision gas piston counterbalanced mechanism available in Vertical and Horizontal orientations.",
    tagline: "Cabinetry & wardrobe ready",
    badge: "MORPHY™ Integrated",
    image: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-IV-MORPHY_5.webp`,
    hover_image: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-IV-MORPHY_1-m.webp`,
    hoverImage: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-IV-MORPHY_1-m.webp`,
    gallery: getMorphyGallery2K("160x200", "IV", "Integrated MORPHY™ Bed"),
    price_gbp: 749,
    price_euro: 749,
    price_usd: 1099,
    sale_percent: null,
    sale_price_gbp: null,
    sale_price_euro: null,
    sale_price_usd: null,
    price: "from £749",
    numericPrice: 749,
    size: "19 Sizes",
    sizeLabel: "19 Available Sizes (76x190 - 200x200 cm)",
    defaultSizeSlug: "160x200",
    has_3d: false,
    has3D: false,
    colors: ["#090A0A", "#A5988E", "#D2AA7C"],
    link: "/products/beds/integrated-morphy-bed",
  },

  // ── TRADITIONAL (CLEARANCE) CONSOLIDATED FLAGSHIP MODELS ──
  {
    id: "flagship-traditional-classic",
    rawId: "flagship-traditional-classic",
    slug: "classic-traditional-bed",
    aliases: [
      "classic-vertical-traditional-bed",
      "classic-horizontal-traditional-bed",
      "classic-vertical-bed",
      "classic-horizontal-bed",
      "classic-traditional-wall-bed",
    ],
    name: "Classic Wall Bed",
    title: "Classic Wall Bed (Traditional)",
    name_fr: "Lit Escamotable Classique",
    title_fr: "Lit Escamotable Classique",
    type: "Classic",
    sub_category: "Classic",
    orientation: "Vertical & Horizontal",
    parent_category: "beds",
    isMorphy: false,
    description:
      "The time-tested Traditional Classic Wall Bed. Proven counterbalanced gas pistons and solid construction for dependable everyday use in Vertical and Horizontal spaces.",
    tagline: "Original mechanism, clearance savings",
    badge: "Traditional",
    image: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-CV-TRADITIONAL_1.webp`,
    hover_image: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-CV-TRADITIONAL_2.webp`,
    hoverImage: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-CV-TRADITIONAL_2.webp`,
    gallery: getTraditionalGallery1K("160x200", "CV", "Classic Wall Bed (Traditional)", 9),
    price_gbp: 599,
    price_euro: 599,
    price_usd: 599,
    sale_percent: null,
    sale_price_gbp: 419,
    sale_price_euro: 419,
    sale_price_usd: 419,
    price: "from £419",
    numericPrice: 419,
    size: "13 Sizes",
    sizeLabel: "13 Available Sizes (76x190 - 180x200 cm)",
    defaultSizeSlug: "135x190",
    has_3d: false,
    has3D: false,
    colors: ["#090A0A"],
    link: "/products/beds/classic-traditional-bed",
  },
  {
    id: "flagship-traditional-studio",
    rawId: "flagship-traditional-studio",
    slug: "studio-traditional-bed",
    aliases: [
      "studio-vertical-traditional-bed",
      "studio-horizontal-traditional-bed",
      "studio-vertical-bed",
      "studio-horizontal-bed",
      "studio-traditional-wall-bed",
    ],
    name: "Studio Wall Bed",
    title: "Studio Wall Bed (Traditional)",
    name_fr: "Lit Escamotable Studio",
    title_fr: "Lit Escamotable Studio",
    type: "Studio",
    sub_category: "Studio",
    orientation: "Vertical & Horizontal",
    parent_category: "beds",
    isMorphy: false,
    description:
      "Traditional Studio series wall bed featuring standard front decorative panels and proven lifting pistons in Vertical and Horizontal formats.",
    tagline: "Front panel clearance design",
    badge: "Traditional",
    image: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/150x200-SV-TRADITIONAL_1.webp`,
    hover_image: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/150x200-SV-TRADITIONAL_2.webp`,
    hoverImage: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/150x200-SV-TRADITIONAL_2.webp`,
    gallery: getTraditionalGallery1K("150x200", "SV", "Studio Wall Bed (Traditional)", 7),
    price_gbp: 999,
    price_euro: 999,
    price_usd: 999,
    sale_percent: null,
    sale_price_gbp: 699,
    sale_price_euro: 699,
    sale_price_usd: 699,
    price: "from £699",
    numericPrice: 699,
    size: "11 Sizes",
    sizeLabel: "11 Available Sizes (76x190 - 180x200 cm)",
    defaultSizeSlug: "135x190",
    has_3d: false,
    has3D: false,
    colors: ["#090A0A"],
    link: "/products/beds/studio-traditional-bed",
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
    name_fr: "Canapé modulaire avec lit intégré",
    title_fr: "Canapé modulaire avec lit intégré",
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
    name_fr: "Canapé modulaire avec lit intégré",
    title_fr: "Canapé modulaire avec lit intégré",
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
    aliases: ["comfort-pocket-sprung-mattress", "comfort"],
    name: "Comfort Mattress",
    title: "Comfort Mattress",
    name_fr: "Matelas Confort",
    title_fr: "Matelas Confort",
    type: "Comfort",
    sub_category: "Comfort",
    orientation: "Universal",
    parent_category: "mattresses",
    description:
      "Engineered specifically for everyday restful sleep and optimal weight balance in Murphy beds. The Comfort Mattress features an 8” (20cm) depth profile with a 2” layer of pressure-relieving memory foam combined with a high-density support foam base.",
    description_fr:
      "Profil de 8” (20cm) d'épaisseur avec une couche de 2” de mousse à mémoire de forme et une base en mousse haute densité pour un soutien durable.",
    extended_description:
      "After extensive research and development, we created the WBK Comfort Mattress as the ideal match for our fold-away wall beds. The 8” (20cm) depth profile allows the bed to close effortlessly with bedding retained, while the 2” memory foam layer provides contouring comfort and pressure relief over a durable high-density support core. Backed by our 30-day money back guarantee and 1-year warranty.",
    extended_description_fr:
      "Profil de 8” (20cm) d'épaisseur pour un pliage sans couture du lit mural. Couche de 2” de mousse à mémoire de forme pour un confort soulageant la pression. Base en mousse haute densité pour un soutien durable de la colonne vertébrale. Conçu pour un sommeil reposant quotidien dans les lits escamotables. Garantie de remboursement complet de 30 jours. Garantie : 1 an pour les défauts de fabrication.",
    tagline: "8” (20cm) thickness profile, 2” memory foam layer",
    badge: "Comfort Range",
    image: `${SUPABASE_MATTRESS_IMAGES_BASE}/comfort.webp`,
    hover_image: `${SUPABASE_MATTRESS_IMAGES_BASE}/comfort.webp`,
    hoverImage: `${SUPABASE_MATTRESS_IMAGES_BASE}/comfort.webp`,
    price_gbp: 399,
    price_euro: 399,
    price_usd: 399,
    sale_percent: 0,
    price: "from £299",
    numericPrice: 299,
    warranty: "1 year for manufacturing defects",
    thickness: "8” (20cm)",
    features: [
      "8” (20cm) thickness profile for seamless wall bed folding",
      "2” layer of memory foam for pressure-relieving comfort",
      "High-density foam base for durable spinal support",
      "Engineered for everyday restful sleep in wall beds",
      "30-day complete money back guarantee",
      "Warranty: 1 year for manufacturing defects",
    ],
    size: "Multiple Sizes",
    sizeLabel: "Single to Super King (90x190 - 180x200 cm)",
    defaultSizeSlug: "double-comfort-mattress-135x190x20",
    available_locales: ["en", "de", "fr", "es", "por", "it"],
    has_3d: false,
    has3D: false,
    colors: ["#FFFFFF"],
    link: "/products/mattresses/comfort-mattress",
  },
  {
    id: "flagship-luxury-mattress",
    rawId: "flagship-luxury-mattress",
    slug: "luxury-mattress",
    aliases: ["luxury-orthopaedic-mattress", "luxury"],
    name: "Luxury Mattress",
    title: "Luxury Mattress",
    name_fr: "Matelas de luxe",
    title_fr: "Matelas de luxe",
    type: "Luxury",
    sub_category: "Luxury",
    orientation: "Universal",
    parent_category: "mattresses",
    description:
      "The Luxury Mattress features a 10” (25cm) thickness profile combining a generous 3” layer of pressure-relieving memory foam with a high-resilience reflex foam base. Engineered for medium-firm orthopaedic support and restorative everyday sleep.",
    description_fr:
      "Profil d'épaisseur de 10” (25cm) combinant une couche de 3” de mousse à mémoire pour un confort profond avec une base en mousse réflexe à haute résilience.",
    extended_description:
      "Part of the official WBK Mattress Range, the Luxury Mattress delivers enhanced pressure distribution and targeted orthopaedic support. The combination of a 3” high-grade memory foam contouring topper and a solid reflex foam core ensures optimal spinal alignment and superior longevity for daily use. Backed by our 30-day trial period and 1-year manufacturing defect warranty.",
    extended_description_fr:
      "Profil d'épaisseur de 10” (25cm). Couche de 3” de mousse à mémoire pour un confort soulageant profondément la pression. Mousse à mémoire épaisse combinée à une base en mousse réflexe à haute résilience. Soutien orthopédique de fermeté moyenne pour l'alignement de la colonne vertébrale. Garantie de remboursement complet de 30 jours. Garantie : 1 an pour les défauts de fabrication.",
    tagline: "10” (25cm) thickness profile, 3” memory foam + reflex foam",
    badge: "Luxury Range",
    image: `${SUPABASE_MATTRESS_IMAGES_BASE}/luxury.webp`,
    hover_image: `${SUPABASE_MATTRESS_IMAGES_BASE}/luxury.webp`,
    hoverImage: `${SUPABASE_MATTRESS_IMAGES_BASE}/luxury.webp`,
    price_gbp: 499,
    price_euro: 499,
    price_usd: 499,
    sale_percent: 0,
    price: "from £364",
    numericPrice: 364,
    warranty: "1 year for manufacturing defects",
    thickness: "10” (25cm)",
    features: [
      "10” (25cm) thickness profile",
      "3” layer of memory foam for deep pressure-relieving comfort",
      "Thick memory foam combined with a high-resilience reflex foam base",
      "Medium-firm orthopaedic support for spinal alignment",
      "30-day complete money back guarantee",
      "Warranty: 1 year for manufacturing defects",
    ],
    size: "Multiple Sizes",
    sizeLabel: "Single to Super King (90x190 - 180x200 cm)",
    defaultSizeSlug: "double-luxury-mattress-135x190x25",
    available_locales: ["en", "de", "fr", "es", "por", "it"],
    has_3d: false,
    has3D: false,
    colors: ["#FFFFFF"],
    link: "/products/mattresses/luxury-mattress",
  },
  {
    id: "flagship-supreme-mattress",
    rawId: "flagship-supreme-mattress",
    slug: "supreme-mattress",
    aliases: ["supreme-hybrid-mattress", "supreme"],
    name: "Supreme Mattress",
    title: "Supreme Mattress",
    name_fr: "Matelas Suprême",
    title_fr: "Matelas Suprême",
    type: "Supreme",
    sub_category: "Supreme",
    orientation: "Universal",
    parent_category: "mattresses",
    description:
      "Our pinnacle sleep experience. The Supreme Mattress features a 10” (25cm) thickness profile combining 1,500 individual pocket springs with pressure-relieving memory foam and Motion Isolation Technology™ to eliminate partner disturbance and provide ultimate luxury contouring.",
    description_fr:
      "Profil d'épaisseur de 10” (25cm) combinant 1 500 ressorts ensachés individuels avec de la mousse à mémoire de forme et la technologie Motion Isolation Technology™.",
    extended_description:
      "The pinnacle of our mattress collection. The Supreme Mattress combines the responsive adaptability of 1,500 individual pocket springs with a plush memory foam layer and Motion Isolation Technology™, ensuring completely undisturbed rest. Specially engineered to maintain perfect balance and comfort inside Wall Bed King systems. Complete with a 30-day money back guarantee and 1-year warranty.",
    extended_description_fr:
      "Profil d'épaisseur de 10” (25cm). 1 500 ressorts ensachés individuels combinés à de la mousse à mémoire de forme. Technologie d'isolation des mouvements™ pour éliminer les perturbations du partenaire. Soulagement ciblé de la pression et confort luxueux. Garantie de remboursement complet de 30 jours. Garantie : 1 an pour les défauts de fabrication.",
    tagline: "10” (25cm) thickness profile, 1,500 pocket springs + memory foam",
    badge: "Supreme Range",
    image: `${SUPABASE_MATTRESS_IMAGES_BASE}/supreme.webp`,
    hover_image: `${SUPABASE_MATTRESS_IMAGES_BASE}/supreme.webp`,
    hoverImage: `${SUPABASE_MATTRESS_IMAGES_BASE}/supreme.webp`,
    price_gbp: 599,
    price_euro: 599,
    price_usd: 599,
    sale_percent: 0,
    price: "from £449",
    numericPrice: 449,
    warranty: "1 year for manufacturing defects",
    thickness: "10” (25cm)",
    features: [
      "10” (25cm) thickness profile",
      "1,500 individually wrapped pocket springs combined with memory foam",
      "Motion Isolation Technology™ to eliminate partner disturbance",
      "Cloud-like luxury contouring and targeted pressure relief",
      "30-day complete money back guarantee",
      "Warranty: 1 year for manufacturing defects",
    ],
    size: "Multiple Sizes",
    sizeLabel: "Single to Super King (90x190 - 180x200 cm)",
    defaultSizeSlug: "double-supreme-mattress-135x190x25",
    available_locales: ["en", "de", "fr", "es", "por", "it"],
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
    aliases: ["vertical", "vertical-cabinet", "vertical-cabinets"],
    name: "Classic Vertical Wall Bed Cabinet",
    title: "Classic Vertical Wall Bed Cabinet",
    name_fr: "Armoire de Lit Escamotable Vertical Classique",
    title_fr: "Armoire de Lit Escamotable Vertical Classique",
    type: "Cabinet",
    sub_category: "Vertical",
    orientation: "Vertical",
    parent_category: "cabinets",
    description:
      "The vertical cabinets are a perfect fit for the Classic vertical wall bed frames and come in a range of colours: pine, beech, oak and white. Suitable for the vertical Classic Single, Small Double, Double and King wall bed. The cabinet enclosures offer a neat, attractive and tidy way to store your wall bed away when not in use - keeping your bed, mattress and bedding dust-free and in pristine condition.",
    description_fr:
      "Portes : ouverture à 170 degrés pour un accès large et facile. Matériau : Panneau de meuble mélaminé. Convient aux lits muraux Classic Vertical Simple, Petit Double, Double et King. Emballé à plat pour un montage facile. Garantie : 1 an pour les défauts de fabrication.",
    extended_description:
      "Our cabinets are perfectly designed to encase and compliment the Classic Range wall beds. Manufactured from durable melamine-faced furniture board, these vertical cabinets feature wide 170-degree door openings for unobstructed access and easy daily use. Delivered flat-packed for straightforward assembly and backed by our 1-year manufacturing defect warranty.",
    tagline: "Fits Classic vertical wall bed frames (Single to King)",
    badge: "Vertical Cabinets",
    warranty: "1 year for manufacturing defects",
    material: "Melamine-faced furniture board",
    door_opening: "170 degrees opening",
    assembly: "Flat-packed for easy assembly",
    features: [
      "Doors: 170 degrees opening for wide, easy access",
      "Material: Melamine-faced furniture board",
      "Suitable for Classic Vertical Single, Small Double, Double and King wall beds",
      "Flat-packed for easy assembly",
      "Warranty: 1 year for manufacturing defects",
    ],
    image: `${SUPABASE_CABINET_IMAGES_BASE}/1K/140x200-DV-OAK-CABINET_ANGLE_1.webp`,
    hover_image: `${SUPABASE_CABINET_IMAGES_BASE}/1K/140x200-DV-OAK-CABINET_ANGLE_2.webp`,
    hoverImage: `${SUPABASE_CABINET_IMAGES_BASE}/1K/140x200-DV-OAK-CABINET_ANGLE_2.webp`,
    price_gbp: 649,
    price_euro: 649,
    price_usd: 649,
    sale_percent: 0,
    price: "from £479",
    numericPrice: 479,
    size: "4 Sizes / 4 Finishes",
    sizeLabel: "Single to King in Oak, Beech, Pine & White",
    defaultSizeSlug: "single-vertical-cabinet-oak-115x52x215",
    available_locales: ["en", "de", "fr", "es", "por", "it"],
    has_3d: false,
    has3D: false,
    colors: ["#BCA37F", "#D8AC78", "#E8CE9B", "#FFFFFF"],
    link: "/products/cabinets/vertical-wall-bed-cabinet",
  },
  {
    id: "flagship-horizontal-cabinet",
    rawId: "flagship-horizontal-cabinet",
    slug: "horizontal-wall-bed-cabinet",
    aliases: ["horizontal", "horizontal-cabinet", "horizontal-cabinets"],
    name: "Classic Horizontal Wall Bed Cabinet",
    title: "Classic Horizontal Wall Bed Cabinet",
    name_fr: "Armoire Lit Escamotable Horizontal Classique",
    title_fr: "Armoire Lit Escamotable Horizontal Classique",
    type: "Cabinet",
    sub_category: "Horizontal",
    orientation: "Horizontal",
    parent_category: "cabinets",
    description:
      "The horizontal cabinets are a perfect fit for the Classic horizontal wall bed frames and come in a range of colours: pine, beech, oak and white. Suitable for the horizontal Classic Double and King wall bed. The cabinet enclosures offer a neat, attractive and tidy way to store your wall bed away when not in use - keeping your bed, mattress and bedding dust-free and in pristine condition.",
    description_fr:
      "Portes : ouverture à 90 degrés. Matériau : Panneau de meuble mélaminé. Convient aux cadres de lit escamotable horizontaux Classic Double et King. Emballé à plat pour un montage facile. Garantie : 1 an pour les défauts de fabrication.",
    extended_description:
      "Specifically designed for low ceiling spaces, lofts, and wide rooms, our horizontal cabinets neatly conceal your horizontal fold-away bed. Features smooth 90-degree opening doors and sturdy melamine-faced furniture board construction. Can be paired with our horizontal cabinet extensions to match the height of side units. Delivered flat-packed for easy assembly with a 1-year warranty.",
    tagline: "Fits Classic horizontal wall bed frames (Double & King)",
    badge: "Horizontal Cabinets",
    warranty: "1 year for manufacturing defects",
    material: "Melamine-faced furniture board",
    door_opening: "90 degrees opening",
    assembly: "Flat-packed for easy assembly",
    features: [
      "Doors: 90 degrees opening",
      "Material: Melamine-faced furniture board",
      "Suitable for horizontal Classic Double and King wall bed frames",
      "Flat-packed for easy assembly",
      "Warranty: 1 year for manufacturing defects",
    ],
    image: `${SUPABASE_CABINET_IMAGES_BASE}/1K/160x200-KH-OAK-CABINET_ANGLE_1.webp`,
    hover_image: `${SUPABASE_CABINET_IMAGES_BASE}/1K/160x200-KH-OAK-CABINET_ANGLE_2.webp`,
    hoverImage: `${SUPABASE_CABINET_IMAGES_BASE}/1K/160x200-KH-OAK-CABINET_ANGLE_2.webp`,
    price_gbp: 799,
    price_euro: 799,
    price_usd: 799,
    sale_percent: 0,
    price: "from £629",
    numericPrice: 629,
    size: "2 Sizes / 4 Finishes",
    sizeLabel: "Double & King in Oak, Beech, Pine & White",
    defaultSizeSlug: "double-horizontal-cabinet-oak-215x52x180",
    available_locales: ["en", "de", "fr", "es", "por", "it"],
    has_3d: false,
    has3D: false,
    colors: ["#BCA37F", "#D8AC78", "#E8CE9B", "#FFFFFF"],
    link: "/products/cabinets/horizontal-wall-bed-cabinet",
  },
  {
    id: "flagship-extension-cabinet",
    rawId: "flagship-extension-cabinet",
    slug: "overhead-storage-extension-cabinet",
    aliases: ["extensions", "extension", "extension-cabinet", "cabinet-extensions"],
    name: "Horizontal Cabinet Extension",
    title: "Horizontal Cabinet Extension",
    name_fr: "Extension de Cabinet Horizontal",
    title_fr: "Extension de Cabinet Horizontal",
    type: "Cabinet Extension",
    sub_category: "Extensions",
    orientation: "Horizontal",
    parent_category: "cabinets",
    description:
      "The Horizontal Cabinet Extensions have been specifically developed by our team to extend the usability and increase the use of space of your horizontal cabinet by adding extra height. The extra height also allows your side units to match the height of your horizontal cabinet for a visually balanced design.",
    description_fr:
      "Conçu spécifiquement pour les armoires horizontales Double et King. Compense la différence de hauteur pour s'aligner parfaitement avec les unités latérales. Matériau : Panneau de meubles mélaminé. Emballé à plat pour un montage facile. Garantie : 1 an pour les défauts de fabrication.",
    extended_description:
      "Crafted from matching melamine-faced furniture board in pine, beech, oak and white, this top overhead extension mounts securely above your horizontal double or king cabinet. It bridges the vertical height difference, creating a harmonious, continuous line with any adjacent Wall Bed King side wardrobe or shelving units while providing valuable overhead storage.",
    tagline: "Extends height to match side units (Double & King)",
    badge: "Cabinet Extensions",
    warranty: "1 year for manufacturing defects",
    material: "Melamine-faced furniture board",
    assembly: "Flat-packed for easy assembly",
    features: [
      "Specifically designed for the horizontal Double and King cabinets",
      "Makes up the height difference to align perfectly with side units",
      "Material: Melamine-faced furniture board",
      "Flat-packed for easy assembly",
      "Warranty: 1 year for manufacturing defects",
    ],
    image: `${SUPABASE_CABINET_IMAGES_BASE}/1K/140-160x200-KHEXT-OAK-CABINET_ANGLE_1.webp`,
    hover_image: `${SUPABASE_CABINET_IMAGES_BASE}/1K/140-160x200-KHEXT-OAK-CABINET_ANGLE_2.webp`,
    hoverImage: `${SUPABASE_CABINET_IMAGES_BASE}/1K/140-160x200-KHEXT-OAK-CABINET_ANGLE_2.webp`,
    price_gbp: 469,
    price_euro: 469,
    price_usd: 469,
    sale_percent: 0,
    price: "from £349",
    numericPrice: 349,
    size: "2 Sizes / 4 Finishes",
    sizeLabel: "Double & King in Oak, Beech, Pine & White",
    defaultSizeSlug: "double-horizontal-cabinet-extension-oak-215x52x35",
    available_locales: ["en", "de", "fr", "es", "por", "it"],
    has_3d: false,
    has3D: false,
    colors: ["#BCA37F", "#D8AC78", "#E8CE9B", "#FFFFFF"],
    link: "/products/cabinets/overhead-storage-extension-cabinet",
  },
  {
    id: "flagship-side-unit-cabinet",
    rawId: "flagship-side-unit-cabinet",
    slug: "side-storage-wardrobe-cabinet",
    aliases: ["side-units", "side-unit", "side-storage", "wardrobe-cabinet"],
    name: "Modular Side Storage & Wardrobe Unit",
    title: "Modular Side Storage & Wardrobe Unit",
    name_fr: "Unité de rangement latéral modulaire et armoire",
    title_fr: "Unité de rangement latéral modulaire et armoire",
    type: "Side Unit",
    sub_category: "Side Units",
    orientation: "Vertical",
    parent_category: "cabinets",
    description:
      "The side units are the perfect space extension for your wall bed cabinets. Available in pine, beech, oak and white with hanging wardrobe doors or open shelving, matching the height of your Classic Vertical Double and King size cabinets, as well as the Classic Horizontal Double and King cabinets with extensions.",
    description_fr:
      "Hauteur : Correspond à la verticale Armoires doubles/king et armoires horizontales avec extension. Largeur : 50cm, Profondeur : 52cm. Choix de style : Porte de placard avec tringle à vêtements (ouverture à 90°) ou étagères ouvertes. Matériau : Panneau de meubles en mélamine. Emballé à plat pour un montage facile. Garantie : 1 an pour les défauts de fabrication.",
    extended_description:
      "Create a complete modular bedroom storage wall by placing one or two 50cm-wide side units alongside your wall bed cabinet. Choose between a hanging wardrobe with 90-degree opening doors or open shelving for display and books. Built from robust melamine-faced furniture board, flat-packed for simple assembly, and covered by a 1-year warranty for manufacturing defects.",
    tagline: "Door + hanger or open shelving (matches cabinet height)",
    badge: "Side Units",
    warranty: "1 year for manufacturing defects",
    material: "Melamine-faced furniture board",
    door_opening: "90 degrees opening (with Door) / Open shelving",
    assembly: "Flat-packed for easy assembly",
    features: [
      "Height: Matches vertical Double/King cabinets and horizontal cabinets with extension",
      "Width: 50cm, Depth: 52cm",
      "Style choices: Wardrobe door with hanging rail (90° opening) or open shelving",
      "Material: Melamine-faced furniture board",
      "Flat-packed for easy assembly",
      "Warranty: 1 year for manufacturing defects",
    ],
    image: `${SUPABASE_CABINET_IMAGES_BASE}/1K/50x225-SIDEDHV-OAK-CABINET_ANGLE_1.webp`,
    hover_image: `${SUPABASE_CABINET_IMAGES_BASE}/1K/50x225-SIDEDHV-OAK-CABINET_ANGLE_2.webp`,
    hoverImage: `${SUPABASE_CABINET_IMAGES_BASE}/1K/50x225-SIDEDHV-OAK-CABINET_ANGLE_2.webp`,
    price_gbp: 439,
    price_euro: 439,
    price_usd: 439,
    sale_percent: 0,
    price: "from £319",
    numericPrice: 319,
    size: "2 Styles / 4 Finishes",
    sizeLabel: "Door + Hanger or Shelves in 4 Finishes",
    defaultSizeSlug: "50x52-door",
    available_locales: ["en", "de", "fr", "es", "por", "it"],
    has_3d: false,
    has3D: false,
    colors: ["#BCA37F", "#D8AC78", "#E8CE9B", "#FFFFFF"],
    link: "/products/cabinets/side-storage-wardrobe-cabinet",
  },
];

// Helper to determine if a product or variant is visible on storefront
export const isProductVisible = (item) => {
  if (!item) return false;
  const vis = String(item.visibility || "").trim().toLowerCase();
  if (vis === "hidden" || vis === "false" || item.visibility === false) return false;
  if (item.is_visible === false && !item.is_unlisted && vis !== "unlisted") return false;
  return true;
};

/**
 * Computes starting prices ("from") dynamically for flagship models
 * based on the cheapest matching product variant in Supabase / catalog.
 */
export function getDynamicFlagships(templates, rawItems, category) {
  const catItems = rawItems.filter((p) => {
    if (!isProductVisible(p)) return false;
    if (category === "beds" || category === "morphy-beds" || category === "traditional-beds") {
      return (
        p.parent_category === "beds" ||
        p.parent_category === "morphy-beds" ||
        p.parent_category === "traditional-beds"
      );
    }
    return p.parent_category === category;
  });

  return templates
    .map((template) => {
      if (!isProductVisible(template)) return null;

      const matching = catItems.filter((item) => {
        if (category === "beds") {
          const itemIsMorphy = Boolean(
            (item.name || "").includes("MORPHY") || (item.category || "").includes("MORPHY")
          );
          const templateIsMorphy = Boolean(template.isMorphy);
          return (
            item.type?.toLowerCase() === template.type?.toLowerCase() &&
            itemIsMorphy === templateIsMorphy
          );
        }

        const templateOrientation = (template.orientation || "").toLowerCase();
        const itemOrientation = (item.orientation || "").toLowerCase();
        const ignoreOrientation = !templateOrientation || templateOrientation === "universal" || !itemOrientation || itemOrientation === "universal";

        if (template.sub_category && item.sub_category) {
          const subMatch = item.sub_category.toLowerCase() === template.sub_category.toLowerCase();
          if (!ignoreOrientation) {
            return subMatch && itemOrientation === templateOrientation;
          }
          return subMatch;
        }

        if (template.type && item.type) {
          const typeMatch = item.type.toLowerCase() === template.type.toLowerCase();
          if (!ignoreOrientation) {
            return typeMatch && itemOrientation === templateOrientation;
          }
          return typeMatch;
        }

        return false;
      });

      if (matching.length === 0) {
        if (rawItems && rawItems.length > 0) {
          return null;
        }
        return template;
      }

      // Isolate legitimate products for flagship starting price calculations (exclude test beds or abnormally low test prices)
      const validForPricing = matching.filter(
        (m) =>
          Number(m.price_gbp) > 5 &&
          !String(m.name || "").toUpperCase().includes("TEST") &&
          m.id !== 235 &&
          m.id !== 236
      );
      const pricingPool = validForPricing.length > 0 ? validForPricing : matching;

      const gbpList = pricingPool.map((m) => m.price_gbp).filter((v) => v != null && !isNaN(v));
      const euroList = pricingPool.map((m) => m.price_euro ?? m.price_gbp).filter((v) => v != null && !isNaN(v));
      const usdList = pricingPool.map((m) => m.price_usd ?? m.price_gbp).filter((v) => v != null && !isNaN(v));

      const minGbp = gbpList.length > 0 ? Math.min(...gbpList) : template.price_gbp;
      const minEuro = euroList.length > 0 ? Math.min(...euroList) : template.price_euro;
      const minUsd = usdList.length > 0 ? Math.min(...usdList) : template.price_usd;

      // Dynamic Sale Calculations from matching variants in database
      const salePercents = pricingPool
        .map((m) => Number(m.sale_percent))
        .filter((v) => !isNaN(v) && v > 0);
      const dynamicSalePercent = salePercents.length > 0 ? Math.max(...salePercents) : null;

      const saleGbpList = pricingPool
        .map((m) => Number(m.sale_price_gbp))
        .filter((v) => !isNaN(v) && v > 0);
      const saleEuroList = pricingPool
        .map((m) => Number(m.sale_price_euro ?? m.sale_price_gbp))
        .filter((v) => !isNaN(v) && v > 0);
      const saleUsdList = pricingPool
        .map((m) => Number(m.sale_price_usd ?? m.sale_price_gbp))
        .filter((v) => !isNaN(v) && v > 0);

      const minSaleGbp = saleGbpList.length > 0 ? Math.min(...saleGbpList) : null;
      const minSaleEuro = saleEuroList.length > 0 ? Math.min(...saleEuroList) : null;
      const minSaleUsd = saleUsdList.length > 0 ? Math.min(...saleUsdList) : null;

      const saleFixGbpList = pricingPool
        .map((m) => Number(m.sale_fix_gbp))
        .filter((v) => !isNaN(v) && v > 0);
      const saleFixEuroList = pricingPool
        .map((m) => Number(m.sale_fix_euro))
        .filter((v) => !isNaN(v) && v > 0);
      const saleFixUsdList = pricingPool
        .map((m) => Number(m.sale_fix_usd))
        .filter((v) => !isNaN(v) && v > 0);

    const maxSaleFixGbp = saleFixGbpList.length > 0 ? Math.max(...saleFixGbpList) : null;
    const maxSaleFixEuro = saleFixEuroList.length > 0 ? Math.max(...saleFixEuroList) : null;
    const maxSaleFixUsd = saleFixUsdList.length > 0 ? Math.max(...saleFixUsdList) : null;

    let effectiveStartingPriceGbp = minGbp;
    if (minSaleGbp != null && minGbp != null && minSaleGbp < minGbp) {
      effectiveStartingPriceGbp = minSaleGbp;
    } else if (dynamicSalePercent != null && minGbp != null) {
      effectiveStartingPriceGbp = Math.round(minGbp * (1 - dynamicSalePercent / 100));
    } else if (maxSaleFixGbp != null && minGbp != null) {
      effectiveStartingPriceGbp = Math.max(0, minGbp - maxSaleFixGbp);
    }

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

    // Derive available locales for this flagship model from matching variants
    const allKnownLocales = ["en", "us", "de", "fr", "es", "por", "it"];
    const variantLocalesSet = new Set();
    matching.forEach((m) => {
      if (Array.isArray(m.available_locales) && m.available_locales.length > 0) {
        m.available_locales.forEach((l) => variantLocalesSet.add(String(l).toLowerCase()));
      } else {
        // If variant doesn't have available_locales explicitly specified, it defaults to all markets
        allKnownLocales.forEach((l) => variantLocalesSet.add(l));
      }
    });

    const dynamicAvailableLocales =
      variantLocalesSet.size > 0
        ? Array.from(variantLocalesSet)
        : template.available_locales || allKnownLocales;

    // Compute aggregated stock across matching visible variants
    const matchingInStockVariants = matching.filter(
      (m) =>
        isProductVisible(m) &&
        (m.stock === undefined || m.stock === null || Number(m.stock) > 0) &&
        m.in_stock !== false
    );
    const totalMatchingStock = matching.reduce(
      (sum, m) => sum + (Number(m.stock) || 0),
      0
    );
    const flagshipInStock = matchingInStockVariants.length > 0;

    return {
      ...template,
      available_locales: dynamicAvailableLocales,
      description_en: template.description_en || defaultVariant?.description_en || template.description,
      description_us: template.description_us || defaultVariant?.description_us || template.description,
      description_de: template.description_de || defaultVariant?.description_de,
      description_fr: template.description_fr || defaultVariant?.description_fr,
      description_es: template.description_es || defaultVariant?.description_es,
      description_por: template.description_por || defaultVariant?.description_por,
      description_pt: template.description_pt || defaultVariant?.description_pt || defaultVariant?.description_por,
      description_it: template.description_it || defaultVariant?.description_it,
      extended_description_en: template.extended_description_en || defaultVariant?.extended_description_en || template.extended_description,
      extended_description_de: template.extended_description_de || defaultVariant?.extended_description_de,
      extended_description_fr: template.extended_description_fr || defaultVariant?.extended_description_fr,
      extended_description_es: template.extended_description_es || defaultVariant?.extended_description_es,
      extended_description_por: template.extended_description_por || defaultVariant?.extended_description_por,
      extended_description_pt: template.extended_description_pt || defaultVariant?.extended_description_pt || defaultVariant?.extended_description_por,
      extended_description_it: template.extended_description_it || defaultVariant?.extended_description_it,
      installation_manual: manualUrl,
      installation_video: videoUrl,
      tags: collectedTags,
      price_gbp: minGbp,
      price_euro: minEuro,
      price_usd: minUsd,
      sale_price_gbp: minSaleGbp,
      sale_price_euro: minSaleEuro,
      sale_price_usd: minSaleUsd,
      sale_fix_gbp: maxSaleFixGbp,
      sale_fix_euro: maxSaleFixEuro,
      sale_fix_usd: maxSaleFixUsd,
      numericPrice: effectiveStartingPriceGbp,
      price: `from £${effectiveStartingPriceGbp}`,
      sale_percent: dynamicSalePercent,
      stock: flagshipInStock ? (totalMatchingStock > 0 ? totalMatchingStock : 99) : 0,
      in_stock: flagshipInStock,
    };
  }).filter(Boolean);
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

export const FLAGSHIP_TABLES = TABLES_FLAGSHIP_LIST;

export function getDynamicFlagshipTables(rawItems = RAW_CATALOG) {
  return TABLES_FLAGSHIP_LIST.map((f) => {
    let matching = (rawItems || []).filter(
      (p) => p.parent_category === "tables" && p.parent_slug === f.slug
    );
    if (matching.length === 0) {
      matching = (tablesCatalogData?.variants || []).filter(
        (v) => v.parent_slug === f.slug
      );
    }
    if (matching.length > 0) {
      const prices = matching
        .map((m) => Number(m.price_gbp) || 0)
        .filter((p) => p > 0);
      const minPrice = prices.length > 0 ? Math.min(...prices) : f.price_gbp;
      const first = matching[0];
      return {
        ...first,
        ...f,
        price_gbp: minPrice,
        numericPrice: minPrice,
        price: `from £${Math.round(minPrice)}`,
        material: f.material || first.material,
        dimensions: f.dimensions || first.dimensions,
        table_size: f.table_size || first.table_size,
        height: f.height || first.height,
        weight: f.weight || first.weight,
        mechanism: f.mechanism || first.mechanism,
        assembly: f.assembly || first.assembly,
        shape: f.shape || first.shape,
        application: f.application || first.application,
        design_style: f.design_style || first.design_style,
      };
    }
    return f;
  });
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

export const formatBundleItem = (bundle, rawCatalog = RAW_CATALOG) => {
  const items = (bundle.items || []).map((it) => {
    const prod = rawCatalog.find((p) => p.id === it.product_id || p.id === Number(it.product_id));
    return {
      ...it,
      product: prod ? formatCatalogItem(prod) : null,
    };
  });

  let subtotal_gbp = 0;
  let subtotal_euro = 0;
  let subtotal_usd = 0;
  let minStock = Infinity;

  for (const it of items) {
    const p = it.product;
    const qty = it.quantity || 1;
    if (p) {
      subtotal_gbp += (Number(p.price_gbp) || p.numericPrice || 0) * qty;
      subtotal_euro += (Number(p.price_euro) || p.numericPrice || 0) * qty;
      subtotal_usd += (Number(p.price_usd) || p.numericPrice || 0) * qty;
      const stock = Number(p.stock ?? 0);
      if (stock < minStock) minStock = stock;
    }
  }

  if (minStock === Infinity) minStock = 0;

  const discountPercent = Number(bundle.discount_percent || 10);
  const price_gbp = Math.round(subtotal_gbp * (1 - discountPercent / 100));
  const price_euro = Math.round(subtotal_euro * (1 - discountPercent / 100));
  const price_usd = Math.round(subtotal_usd * (1 - discountPercent / 100));

  const gallery = Array.isArray(bundle.product_images) && bundle.product_images.length > 0
    ? bundle.product_images.map((src, i) => ({ src, alt: `${bundle.name} - View ${i + 1}` }))
    : [
        { src: bundle.image, alt: bundle.name },
        { src: bundle.hover_image || bundle.image, alt: `${bundle.name} Details` },
      ];

  return {
    ...bundle,
    id: `bundle-${bundle.id}`,
    rawId: bundle.id,
    title: bundle.name,
    image: bundle.image,
    hoverImage: bundle.hover_image || bundle.image,
    hover_image: bundle.hover_image || bundle.image,
    link: `/products/bundles/${bundle.slug}`,
    categoryKey: "bundles",
    parent_category: "bundles",
    sub_category: bundle.sub_category || "Classic+ Packages",
    badge: bundle.badge || "Classic+ Package • 10% Off",
    price: `£${price_gbp}`,
    numericPrice: price_gbp,
    salePrice: null,
    regularPrice: subtotal_gbp,
    price_gbp,
    price_euro,
    price_usd,
    sale_price_gbp: null,
    sale_price_euro: null,
    sale_price_usd: null,
    subtotal_gbp,
    subtotal_euro,
    subtotal_usd,
    stock: minStock,
    is_bundle: true,
    bundle_items: items,
    items,
    gallery,
    product_images: bundle.product_images || [bundle.image],
    available_locales: bundle.available_locales || ["en", "us", "de", "fr", "es", "por", "it"],
    tags: Array.isArray(bundle.tags) ? bundle.tags : ["bundle"],
    features: Array.isArray(bundle.features) ? bundle.features : [],
  };
};

export const DYNAMIC_FLAGSHIP_BUNDLES = (bundlesCatalog || [])
  .filter(isProductVisible)
  .map((b) => formatBundleItem(b, RAW_CATALOG));

export const ALL_FLAGSHIP_PRODUCTS = [
  ...DYNAMIC_FLAGSHIP_BEDS,
  ...DYNAMIC_FLAGSHIP_SOFAS,
  ...DYNAMIC_FLAGSHIP_TABLES,
  ...DYNAMIC_FLAGSHIP_MATTRESSES,
  ...DYNAMIC_FLAGSHIP_CABINETS,
  ...DYNAMIC_FLAGSHIP_EXTRAS,
  ...DYNAMIC_FLAGSHIP_BUNDLES,
];

// All bed variants for internal lookups and configurator sizing
export const ALL_BED_VARIANTS = RAW_CATALOG.filter(
  (p) =>
    p.parent_category === "beds" ||
    p.parent_category === "morphy-beds" ||
    p.parent_category === "traditional-beds"
).map(formatCatalogItem);

// Categorized product arrays
export const ALL_PRODUCTS = {
  beds: DYNAMIC_FLAGSHIP_BEDS,
  "morphy-beds": DYNAMIC_FLAGSHIP_BEDS.filter((b) => b.isMorphy),
  "traditional-beds": DYNAMIC_FLAGSHIP_BEDS.filter((b) => !b.isMorphy),
  sofas: DYNAMIC_FLAGSHIP_SOFAS,
  tables: DYNAMIC_FLAGSHIP_TABLES,
  mattresses: DYNAMIC_FLAGSHIP_MATTRESSES,
  cabinets: DYNAMIC_FLAGSHIP_CABINETS,
  extras: DYNAMIC_FLAGSHIP_EXTRAS,
  bundles: DYNAMIC_FLAGSHIP_BUNDLES,
};

/**
 * Builds all dynamic flagships and categorized product maps
 * dynamically from any array of raw catalog items (e.g. from Supabase).
 */
export function buildCatalog(rawItems = RAW_CATALOG, rawBundles = null) {
  // Map local tablesCatalogData to enrich items with parent_slug, material, dimensions, specifications
  const tablesVariantMap = new Map();
  (tablesCatalogData?.variants || []).forEach((v) => {
    if (v.slug) tablesVariantMap.set(v.slug, v);
    if (v.sku) tablesVariantMap.set(v.sku, v);
    if (v.id) tablesVariantMap.set(String(v.id), v);
  });

  const enrichedRawItems = (rawItems || []).map((item) => {
    if (item.parent_category === "tables") {
      const localVariant =
        tablesVariantMap.get(item.slug) ||
        tablesVariantMap.get(item.sku) ||
        tablesVariantMap.get(String(item.id));
      if (localVariant) {
        return {
          ...localVariant,
          ...item,
          parent_slug: localVariant.parent_slug || item.parent_slug,
          material: item.material || localVariant.material,
          table_size: item.table_size || localVariant.table_size,
          dimensions: item.dimensions || localVariant.dimensions,
          height: item.height || localVariant.height,
          weight: item.weight || localVariant.weight,
          mechanism: item.mechanism || localVariant.mechanism,
          assembly: item.assembly || localVariant.assembly,
          shape: item.shape || localVariant.shape,
          application: item.application || localVariant.application,
          design_style: item.design_style || localVariant.design_style,
          color: item.color || localVariant.color,
          product_images:
            item.product_images && item.product_images.length > 0
              ? item.product_images
              : localVariant.product_images,
          image: item.image || localVariant.image,
          hover_image: item.hover_image || localVariant.hover_image,
          hoverImage: item.hoverImage || localVariant.hoverImage,
          has_real_photos:
            item.has_real_photos !== undefined
              ? item.has_real_photos
              : localVariant.has_real_photos,
        };
      }
    }
    return item;
  });

  const combinedItems = [...enrichedRawItems];
  const existingSlugs = new Set(combinedItems.map((p) => p.slug));
  for (const tv of (tablesCatalogData?.variants || [])) {
    if (!existingSlugs.has(tv.slug)) {
      combinedItems.push(tv);
    }
  }

  const visibleItems = combinedItems.filter(isProductVisible);

  const dynamicFlagshipBeds = getDynamicFlagshipBeds(visibleItems);
  const dynamicFlagshipSofas = getDynamicFlagshipSofas(visibleItems);
  const dynamicFlagshipTables = getDynamicFlagshipTables(visibleItems);
  const dynamicFlagshipMattresses = getDynamicFlagshipMattresses(visibleItems);
  const dynamicFlagshipCabinets = getDynamicFlagshipCabinets(visibleItems);
  const dynamicFlagshipExtras = getDynamicFlagshipExtras(visibleItems);

  const bundleSource = Array.isArray(rawBundles) && rawBundles.length > 0
    ? rawBundles
    : (bundlesCatalog || []);

  const dynamicBundles = bundleSource
    .filter(isProductVisible)
    .map((b) => formatBundleItem(b, visibleItems))
    .filter((b) => {
      // Ensure bundle is not missing required components
      const hasMissingRequired = (b.items || []).some(
        (it) => it.is_required && !it.product
      );
      return !hasMissingRequired;
    });

  const allFlagships = [
    ...dynamicFlagshipBeds,
    ...dynamicFlagshipSofas,
    ...dynamicFlagshipTables,
    ...dynamicFlagshipMattresses,
    ...dynamicFlagshipCabinets,
    ...dynamicFlagshipExtras,
    ...dynamicBundles,
  ];

  const dynamicFlagshipMorphyBeds = dynamicFlagshipBeds.filter((b) => b.isMorphy);
  const standaloneTraditionalBeds = visibleItems
    .filter(
      (p) =>
        p.parent_category === "traditional-beds" &&
        (String(p.name || "").toUpperCase().includes("TEST") || p.id === 235 || p.id === 236)
    )
    .map(formatCatalogItem);

  const dynamicFlagshipTraditionalBeds = [
    ...dynamicFlagshipBeds.filter((b) => !b.isMorphy),
    ...standaloneTraditionalBeds,
  ];

  const allProducts = {
    beds: [...dynamicFlagshipBeds, ...standaloneTraditionalBeds],
    "morphy-beds": dynamicFlagshipMorphyBeds,
    "traditional-beds": dynamicFlagshipTraditionalBeds,
    sofas: dynamicFlagshipSofas,
    tables: dynamicFlagshipTables,
    mattresses: dynamicFlagshipMattresses,
    cabinets: dynamicFlagshipCabinets,
    extras: dynamicFlagshipExtras,
    bundles: dynamicBundles,
  };

  const allBedVariants = visibleItems
    .filter(
      (p) =>
        p.parent_category === "beds" ||
        p.parent_category === "morphy-beds" ||
        p.parent_category === "traditional-beds"
    )
    .map(formatCatalogItem);

  return {
    rawCatalog: visibleItems,
    allFlagships,
    allProducts,
    allBedVariants,
  };
}

// Representative popular product models for the overview / home sliders
export const POPULAR_PRODUCTS_OVERVIEW = [
  {
    id: "popular-classic-morphy",
    title: "Classic MORPHY™ Bed",
    title_fr: "Lit Escamotable Classique MORPHY™",
    name_fr: "Lit Escamotable Classique MORPHY™",
    orientation: "Vertical & Horizontal",
    size: "76x190 to 200x200",
    colors: ["#090A0A"],
    price: "from £749",
    numericPrice: 749,
    image: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-CV-MORPHY_5.webp`,
    hoverImage: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-CV-MORPHY_1-m.webp`,
    link: "/products/beds/classic-morphy-bed",
    categoryKey: "beds",
    has3D: false,
  },
  {
    id: "popular-studio-morphy",
    title: "Studio MORPHY™ Bed",
    title_fr: "Lit Escamotable Studio MORPHY™",
    name_fr: "Lit Escamotable Studio MORPHY™",
    orientation: "Vertical & Horizontal",
    size: "76x190 to 200x200",
    colors: ["#090A0A"],
    price: "from £999",
    numericPrice: 999,
    image: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-SV-MORPHY_5.webp`,
    hoverImage: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-SV-MORPHY_1-m.webp`,
    link: "/products/beds/studio-morphy-bed",
    categoryKey: "beds",
    has3D: false,
  },
  {
    id: "popular-integrated-morphy",
    title: "Integrated MORPHY™ Bed",
    title_fr: "Lit Escamotable Intégré MORPHY™",
    name_fr: "Lit Escamotable Intégré MORPHY™",
    orientation: "Vertical & Horizontal",
    size: "76x190 to 200x200",
    colors: ["#090A0A", "#A5988E", "#D2AA7C"],
    price: "from £749",
    numericPrice: 749,
    image: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-IV-MORPHY_5.webp`,
    hoverImage: `${SUPABASE_PRODUCT_IMAGES_BASE}/1K/160x200-IV-MORPHY_1-m.webp`,
    link: "/products/beds/integrated-morphy-bed",
    categoryKey: "beds",
    has3D: true,
  },
  {
    id: "popular-comfort-mattress",
    title: "Comfort Mattress",
    title_fr: "Matelas Confort",
    name_fr: "Matelas Confort",
    orientation: "Universal",
    size: "Single to Super King (90x190 - 180x200 cm)",
    sizeLabel: "Single to Super King (90x190 - 180x200 cm)",
    colors: ["#FFFFFF"],
    price: "from £399",
    numericPrice: 399,
    image: `${SUPABASE_MATTRESS_IMAGES_BASE}/comfort.webp`,
    hoverImage: `${SUPABASE_MATTRESS_IMAGES_BASE}/comfort.webp`,
    link: "/products/mattresses/comfort-mattress",
    categoryKey: "mattresses",
    has3D: false,
    available_locales: ["en", "de", "fr", "es", "por", "it"],
  },
  {
    id: "popular-luxury-mattress",
    title: "Luxury Mattress",
    title_fr: "Matelas Luxe",
    name_fr: "Matelas Luxe",
    orientation: "Universal",
    size: "Single to Super King (90x190 - 180x200 cm)",
    sizeLabel: "Single to Super King (90x190 - 180x200 cm)",
    colors: ["#FFFFFF"],
    price: "from £499",
    numericPrice: 499,
    image: `${SUPABASE_MATTRESS_IMAGES_BASE}/luxury.webp`,
    hoverImage: `${SUPABASE_MATTRESS_IMAGES_BASE}/luxury.webp`,
    link: "/products/mattresses/luxury-mattress",
    categoryKey: "mattresses",
    has3D: false,
    available_locales: ["en", "de", "fr", "es", "por", "it"],
  },
  {
    id: "popular-cabinets",
    title: "Classic Vertical Wall Bed Cabinet",
    title_fr: "Armoire Verticale Double - Chêne",
    name_fr: "Armoire de Lit Escamotable Vertical Classique",
    orientation: "Vertical",
    size: "Pine, Beech, Oak, White",
    colors: ["#BCA37F", "#D8AC78", "#E8CE9B", "#FFFFFF"],
    price: "from £449",
    numericPrice: 449,
    image: `${SUPABASE_CABINET_IMAGES_BASE}/1K/140x200-DV-OAK-CABINET_ANGLE_1.webp`,
    hoverImage: `${SUPABASE_CABINET_IMAGES_BASE}/1K/140x200-DV-OAK-CABINET_ANGLE_2.webp`,
    link: "/products/cabinets/vertical-wall-bed-cabinet",
    categoryKey: "cabinets",
    has3D: false,
  },
];

// Helper to find flagship bed from a slug or variant
export const getFlagshipBed = (type = "Classic", orientation = "Vertical", isMorphy = true) => {
  const normType = String(type).toLowerCase();

  return (
    FLAGSHIP_BEDS.find(
      (f) =>
        f.type.toLowerCase() === normType &&
        Boolean(f.isMorphy) === Boolean(isMorphy)
    ) ||
    FLAGSHIP_BEDS.find(
      (f) => f.type.toLowerCase() === normType
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
  const allFlagshipsList = allFlagships || ALL_FLAGSHIP_PRODUCTS;
  const allCatalogList = rawCatalog || RAW_CATALOG;

  // 0. Check Bundles if category is bundles or slug matches a bundle
  const bundleMatch =
    (allFlagshipsList || []).find(
      (b) =>
        b.is_bundle &&
        (b.slug === cleanSlug ||
          String(b.rawId) === cleanSlug ||
          `wbk-${b.rawId}` === cleanSlug ||
          `bundle-${b.rawId}` === cleanSlug)
    ) ||
    DYNAMIC_FLAGSHIP_BUNDLES.find(
      (b) =>
        b.slug === cleanSlug ||
        String(b.rawId) === cleanSlug ||
        `wbk-${b.rawId}` === cleanSlug ||
        `bundle-${b.rawId}` === cleanSlug
    );
  if (bundleMatch && isProductVisible(bundleMatch)) {
    return { ...bundleMatch };
  }

  // 1. Exact match or alias match against ALL Flagship products (checking visible first, then all)
  let flagshipMatch = allFlagshipsList.find(
    (f) =>
      isProductVisible(f) &&
      (f.slug === cleanSlug ||
        (f.aliases && f.aliases.some((a) => a.toLowerCase() === cleanSlug)))
  );
  if (!flagshipMatch) {
    flagshipMatch = allFlagshipsList.find(
      (f) =>
        f.slug === cleanSlug ||
        (f.aliases && f.aliases.some((a) => a.toLowerCase() === cleanSlug))
    );
  }
  if (flagshipMatch) {
    return { ...flagshipMatch };
  }

  // 2. Special backward compatibility alias for integrated-bed
  if (cleanSlug === "integrated-bed") {
    const integratedFlagship = allFlagshipsList.find(
      (f) => f.slug === "integrated-vertical-wall-bed"
    );
    if (integratedFlagship) {
      return { ...integratedFlagship, slug: "integrated-bed" };
    }
  }

  // 3. Search by exact slug or match in catalog (checking visible first, then all)
  let rawItem = allCatalogList.find(
    (p) =>
      isProductVisible(p) &&
      (p.slug === cleanSlug ||
        String(p.id) === cleanSlug ||
        `wbk-${p.id}` === cleanSlug)
  );
  if (!rawItem) {
    rawItem = allCatalogList.find(
      (p) =>
        p.slug === cleanSlug ||
        String(p.id) === cleanSlug ||
        `wbk-${p.id}` === cleanSlug
    );
  }

  if (rawItem) {
    return formatCatalogItem(rawItem);
  }

  // 4. Substring match (checking visible first, then all)
  let subMatch = allCatalogList.find(
    (p) =>
      isProductVisible(p) &&
      p.slug &&
      (p.slug.includes(cleanSlug) || cleanSlug.includes(p.slug))
  );
  if (!subMatch) {
    subMatch = allCatalogList.find(
      (p) =>
        p.slug && (p.slug.includes(cleanSlug) || cleanSlug.includes(p.slug))
    );
  }
  if (subMatch) {
    return formatCatalogItem(subMatch);
  }

  return getFallbackProduct(categorySlug, productSlug);
};

// Get all matching variant items for the same family/model
export const getProductVariants = (currentProduct, rawCatalog = RAW_CATALOG) => {
  if (!currentProduct) return [];
  if (currentProduct.is_bundle || currentProduct.parent_category === "bundles") {
    return [currentProduct];
  }
  const catalog = rawCatalog || RAW_CATALOG;
  const parentCat = currentProduct.parent_category || "beds";
  const type = currentProduct.type || "Classic";
  const subCategory = currentProduct.sub_category || type;
  const orientation = currentProduct.orientation || "Vertical";

  const isBedCategory =
    parentCat === "beds" ||
    parentCat === "morphy-beds" ||
    parentCat === "traditional-beds";

  if (isBedCategory) {
    const isMorphy = Boolean(
      currentProduct.isMorphy ??
      ((currentProduct.name || "").includes("MORPHY") || (currentProduct.title || "").includes("MORPHY"))
    );

    // Return all size variants for this specific flagship (type + isMorphy, both orientations if consolidated)
    const currentOrient = (orientation || "").toLowerCase();
    const isSingleOrient = currentOrient && !currentOrient.includes("&") && currentOrient !== "universal";

    const matching = catalog.filter((p) => {
      if (!isProductVisible(p)) return false;
      const pIsBed =
        p.parent_category === "beds" ||
        p.parent_category === "morphy-beds" ||
        p.parent_category === "traditional-beds";
      if (!pIsBed) return false;
      if (p.type?.toLowerCase() !== type.toLowerCase()) return false;
      if (isSingleOrient && p.orientation?.toLowerCase() !== currentOrient) return false;
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
        isProductVisible(p) &&
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
        isProductVisible(p) &&
        p.parent_category === "mattresses" &&
        (p.sub_category?.toLowerCase() === subCategory.toLowerCase() ||
         p.type?.toLowerCase() === type.toLowerCase())
    );
    matching.sort((a, b) => (a.width || 0) - (b.width || 0));
    return matching.map(formatCatalogItem);
  }

  if (parentCat === "cabinets") {
    const targetSub = (subCategory || "").toLowerCase();
    const matching = catalog.filter((p) => {
      if (!isProductVisible(p) || p.parent_category !== "cabinets") return false;
      const pSub = (p.sub_category || "").toLowerCase();
      if (targetSub.includes("side") || targetSub.includes("unit")) {
        return pSub.includes("side") || pSub.includes("unit");
      }
      if (targetSub.includes("ext") || targetSub.includes("overhead")) {
        return pSub.includes("ext") || pSub.includes("overhead");
      }
      if (targetSub === "horizontal" || currentProduct.orientation?.toLowerCase() === "horizontal") {
        return pSub === "horizontal";
      }
      if (targetSub === "vertical" || currentProduct.orientation?.toLowerCase() === "vertical") {
        return pSub === "vertical";
      }
      return pSub === targetSub;
    });
    matching.sort((a, b) => (a.price_gbp || 0) - (b.price_gbp || 0));
    return matching.map(formatCatalogItem);
  }

  if (parentCat === "tables") {
    const parentSlug = currentProduct.parent_slug || currentProduct.slug;
    let matching = catalog.filter((p) => {
      if (!isProductVisible(p)) return false;
      if (p.parent_category !== "tables") return false;
      return (
        (parentSlug && p.parent_slug === parentSlug) ||
        p.slug === currentProduct.slug
      );
    });
    if (matching.length === 0) {
      matching = (tablesCatalogData?.variants || []).filter(
        (v) => (parentSlug && v.parent_slug === parentSlug) || v.slug === currentProduct.slug
      );
    }
    matching.sort((a, b) => (Number(a.price_gbp) || 0) - (Number(b.price_gbp) || 0));
    return matching.length > 0 ? matching.map(formatCatalogItem) : [formatCatalogItem(currentProduct)];
  }

  return catalog
    .filter((p) => isProductVisible(p) && p.parent_category === parentCat)
    .map(formatCatalogItem);
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
    rawId: null,
    slug: cleanSlug,
    title: title,
    name: title,
    price: "£799",
    numericPrice: 799,
    stock: 0,
    in_stock: false,
    isOutOfStock: true,
    visibility: "Hidden",
    is_visible: false,
    isFallback: true,
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
