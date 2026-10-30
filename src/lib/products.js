import { supabase } from '@/lib/supabase';
import { ALL_PRODUCTS, RAW_CATALOG, findProductBySlug, getProductVariants } from '@/data/products';

/**
 * Fetch products with optional filtering (Supabase with instant local fallback)
 */
export async function getProducts({
  category = 'beds',
  orientation = 'All',
  type = 'All',
  size = 'All',
  priceRange = 'All',
} = {}) {
  try {
    let query = supabase.from('products').select('*');

    if (category && category !== 'all') {
      if (category === 'beds') {
        query = query.in('parent_category', ['beds', 'morphy-beds', 'traditional-beds']);
      } else {
        query = query.eq('parent_category', category);
      }
    }
    if (orientation && orientation !== 'All') {
      query = query.eq('orientation', orientation);
    }
    if (type && type !== 'All') {
      query = query.eq('type', type);
    }
    if (size && size !== 'All') {
      query = query.eq('size_category', size);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data.map((item) => {
        const local = RAW_CATALOG.find((p) => p.id === item.id || p.slug === item.slug) || {};
        return { ...local, ...item };
      });
    }
  } catch (err) {
    // Supabase query fallback
  }

  // Fallback to localized catalog
  const products = ALL_PRODUCTS[category] || RAW_CATALOG;
  return products.filter((prod) => {
    if (orientation !== 'All' && prod.orientation !== orientation) return false;
    if (type !== 'All' && prod.type !== type) return false;
    if (size !== 'All' && prod.size !== size) return false;
    if (priceRange !== 'All') {
      const p = prod.numericPrice || prod.price_gbp;
      if (priceRange === 'Under £500' && p >= 500) return false;
      if (priceRange === '£500 - £800' && (p < 500 || p > 800)) return false;
      if (priceRange === 'Over £800' && p <= 800) return false;
    }
    return true;
  });
}

/**
 * Fetch a single product by slug
 */
export async function getProduct(categorySlug, productSlug) {
  const localFallback = findProductBySlug(categorySlug, productSlug);
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', productSlug)
      .single();

    if (!error && data) {
      return { ...localFallback, ...data };
    }
  } catch (err) {
    // fallback
  }

  return localFallback;
}

/**
 * Checks if a product is available in a given locale
 */
export function isProductAvailableInLocale(product, locale) {
  if (!product) return false;
  if (!locale) return true;
  if (product.available_locales === undefined || product.available_locales === null) {
    return true; // Default: available everywhere if not explicitly specified
  }
  if (!Array.isArray(product.available_locales)) {
    return true;
  }
  const normLocale = String(locale).toLowerCase();
  return product.available_locales.some(
    (l) => String(l).toLowerCase() === normLocale
  );
}

/**
 * Resolves the localized product name for a specific storefront locale.
 * Priority rule: Database localized column takes absolute precedence.
 * Product names must NOT be translated via general dictionaries.
 */
export function getLocalizedProductName(product, locale = "en") {
  if (!product) return "Wall Bed";
  const normLocale = (locale || "en").toLowerCase();

  // 1. Direct locale match (e.g. name_de, name_fr, name_es, name_por, name_it, name_us, name_en)
  const directKey = `name_${normLocale}`;
  if (product[directKey] && String(product[directKey]).trim()) {
    return String(product[directKey]).trim();
  }
  const directTitleKey = `title_${normLocale}`;
  if (product[directTitleKey] && String(product[directTitleKey]).trim()) {
    return String(product[directTitleKey]).trim();
  }

  // 2. Portuguese alias handling (por <-> pt)
  if (normLocale === "por" || normLocale === "pt") {
    if (product.name_por && String(product.name_por).trim()) {
      return String(product.name_por).trim();
    }
    if (product.name_pt && String(product.name_pt).trim()) {
      return String(product.name_pt).trim();
    }
  }

  // 3. English aliases (en <-> uk)
  if (normLocale === "en" || normLocale === "uk") {
    if (product.name_en && String(product.name_en).trim()) {
      return String(product.name_en).trim();
    }
    if (product.name_uk && String(product.name_uk).trim()) {
      return String(product.name_uk).trim();
    }
  }

  // 4. Default fallback to name_en, then generic name, then title
  if (product.name_en && String(product.name_en).trim()) {
    return String(product.name_en).trim();
  }
  if (product.name && String(product.name).trim()) {
    return String(product.name).trim();
  }
  if (product.title && String(product.title).trim()) {
    return String(product.title).trim();
  }

  return "Wall Bed";
}

/**
 * Resolves the localized GTIN (Global Trade Item Number / EAN / UPC)
 * for a specific storefront locale / market.
 */
export function getLocalizedProductGtin(product, locale = "en") {
  if (!product) return "";
  const normLocale = (locale || "en").toLowerCase();

  // 1. Direct GTIN column (gtin_en, gtin_us, gtin_de, gtin_fr, gtin_es, gtin_por, gtin_it)
  const directGtin = product[`gtin_${normLocale}`];
  if (directGtin && String(directGtin).trim()) {
    return String(directGtin).trim();
  }

  // 2. Portuguese alias handling (por <-> pt)
  if (normLocale === "por" || normLocale === "pt") {
    const val = product.gtin_por || product.gtin_pt;
    if (val && String(val).trim()) return String(val).trim();
  }

  // 3. English aliases (en <-> uk)
  if (normLocale === "en" || normLocale === "uk") {
    const val = product.gtin_en || product.gtin_uk;
    if (val && String(val).trim()) return String(val).trim();
  }

  // 4. Fallback to existing ean_* columns
  const directEan = product[`ean_${normLocale}`];
  if (directEan && String(directEan).trim()) {
    return String(directEan).trim();
  }
  if (normLocale === "por" || normLocale === "pt") {
    const val = product.ean_pt || product.ean_por;
    if (val && String(val).trim()) return String(val).trim();
  }
  if (normLocale === "en" || normLocale === "uk") {
    const val = product.ean_uk || product.ean_en;
    if (val && String(val).trim()) return String(val).trim();
  }

  // 5. Fallback to master/default ean or gtin
  return (
    product.gtin ||
    product.ean ||
    product.gtin_en ||
    product.ean_uk ||
    ""
  );
}

/**
 * Resolves the localized product description for a specific storefront locale / market.
 * Priority rule: Database localized column takes precedence, followed by localized catalog fallback.
 */
export function getLocalizedProductDescription(product, locale = "en") {
  if (!product) return "";
  const normLocale = (locale || "en").toLowerCase();
  const check = (val) => (val && String(val).trim() ? String(val).trim() : null);

  // 1. Direct column on the current product object
  const directDesc = check(product[`description_${normLocale}`]);
  if (directDesc) return directDesc;

  // 2. Portuguese alias handling (por <-> pt)
  if (normLocale === "por" || normLocale === "pt") {
    const val = check(product.description_por) || check(product.description_pt);
    if (val) return val;
  }

  // 3. English aliases (en <-> uk)
  if (normLocale === "en" || normLocale === "uk") {
    const val = check(product.description_en) || check(product.description_uk);
    if (val) return val;
  }

  // 4. Fallback to catalog definition if product is from DB and columns are not yet filled
  if (product.slug) {
    const catFallback = findProductBySlug(product.parent_category, product.slug);
    if (catFallback && catFallback !== product) {
      const fbDirect = check(catFallback[`description_${normLocale}`]);
      if (fbDirect) return fbDirect;
      if (normLocale === "por" || normLocale === "pt") {
        const fbPor = check(catFallback.description_por) || check(catFallback.description_pt);
        if (fbPor) return fbPor;
      }
      if (normLocale === "en" || normLocale === "uk") {
        const fbEn = check(catFallback.description_en) || check(catFallback.description_uk);
        if (fbEn) return fbEn;
      }
    }
  }

  // 5. Default fallback to description_en, then generic description
  return (
    check(product.description_en) ||
    check(product.description) ||
    ""
  );
}

/**
 * Resolves the localized short description (brief overview for buy box / under price)
 * for a specific storefront locale / market.
 * Priority rule:
 * 1. Dedicated short_description columns in DB/product.
 * 2. If not defined, fallback to concise excerpt/first paragraph of full description.
 */
export function getLocalizedProductShortDescription(product, locale = "en") {
  if (!product) return "";
  const normLocale = (locale || "en").toLowerCase();
  const check = (val) => (val && String(val).trim() ? String(val).trim() : null);

  // 1. Direct localized column
  const directShortDesc =
    check(product[`short_description_${normLocale}`]) ||
    check(product.short_description);
  if (directShortDesc) return directShortDesc;

  // 2. Portuguese alias handling (por <-> pt)
  if (normLocale === "por" || normLocale === "pt") {
    const val =
      check(product.short_description_por) ||
      check(product.short_description_pt);
    if (val) return val;
  }

  // 3. English aliases (en <-> uk)
  if (normLocale === "en" || normLocale === "uk") {
    const val =
      check(product.short_description_en) ||
      check(product.short_description_uk);
    if (val) return val;
  }

  // 4. Fallback to catalog definition if product is from DB and columns are not yet filled
  if (product.slug) {
    const catFallback = findProductBySlug(product.parent_category, product.slug);
    if (catFallback && catFallback !== product) {
      const fbShort =
        check(catFallback[`short_description_${normLocale}`]) ||
        check(catFallback.short_description);
      if (fbShort) return fbShort;
    }
  }

  // 5. Intelligent brief excerpt from full description if short_description is not yet provided:
  const fullDesc = getLocalizedProductDescription(product, locale);
  if (!fullDesc) return "";

  const trimmed = fullDesc.trim();
  // Take the first paragraph
  const firstParagraph = trimmed.split(/\n\s*\n|\r\n\s*\r\n/)[0].trim();
  // If first paragraph is already short and readable (under 260 chars), keep it intact
  if (firstParagraph.length <= 260) {
    return firstParagraph;
  }

  // Otherwise, extract the first 1-2 complete sentences that fit under ~250 characters
  const sentences = firstParagraph.match(/[^.!?]+[.!?]+/g);
  if (sentences && sentences.length > 0) {
    let brief = "";
    for (const sentence of sentences) {
      if ((brief + sentence).length <= 250) {
        brief += (brief ? " " : "") + sentence.trim();
      } else {
        break;
      }
    }
    if (brief) return brief;
  }

  return firstParagraph.slice(0, 220).replace(/[,;:\s]+$/, "") + "...";
}

export function getLocalizedProductExtendedDescription(product, locale = "en") {
  if (!product) return "";
  const normLocale = (locale || "en").toLowerCase();
  const check = (val) => (val && String(val).trim() ? String(val).trim() : null);

  // 1. Direct column on current object
  const directExt = check(product[`extended_description_${normLocale}`]);
  if (directExt) return directExt;

  // 2. Portuguese alias
  if (normLocale === "por" || normLocale === "pt") {
    const val = check(product.extended_description_por) || check(product.extended_description_pt);
    if (val) return val;
  }

  // 3. English alias
  if (normLocale === "en" || normLocale === "uk") {
    const val = check(product.extended_description_en);
    if (val) return val;
  }

  // 4. Fallback to catalog definition
  if (product.slug) {
    const catFallback = findProductBySlug(product.parent_category, product.slug);
    if (catFallback && catFallback !== product) {
      const fbDirect = check(catFallback[`extended_description_${normLocale}`]);
      if (fbDirect) return fbDirect;
      if (normLocale === "por" || normLocale === "pt") {
        const fbPor = check(catFallback.extended_description_por) || check(catFallback.extended_description_pt);
        if (fbPor) return fbPor;
      }
    }
  }

  // 5. Default fallback to extended_description_en, then generic extended_description
  return (
    check(product.extended_description_en) ||
    check(product.extended_description) ||
    ""
  );
}

/**
 * Resolves the storefront URL for any product or variant.
 * Maps bed models to their flagship page with the exact ?size= query parameter,
 * and handles sofas, mattresses, cabinets, and tables.
 */
export function getStorefrontProductUrl(p, locale = null, options = {}) {
  // Resolve target locale:
  // If a locale is requested and product is available there, use it.
  // If not available in requested market (e.g. US), fall back to a market where the product exists.
  let targetLocale = locale;
  if (p && Array.isArray(p.available_locales) && p.available_locales.length > 0) {
    if (!targetLocale || !p.available_locales.includes(targetLocale)) {
      targetLocale = p.available_locales.includes("us") ? "us" : p.available_locales[0];
    }
  } else if (!targetLocale) {
    targetLocale = "en";
  }

  const prefix = targetLocale ? `/${targetLocale}` : "/en";
  let targetUrl = `${prefix}/products`;

  if (!p) return targetUrl;

  if (p.link) {
    if (p.link.startsWith("http")) targetUrl = p.link;
    else targetUrl = `${prefix}${p.link.startsWith("/") ? "" : "/"}${p.link}`;
  } else {
    const category = (p.parent_category || "beds").toLowerCase();

    // Route standalone test products directly to their product page
    if (String(p.name || "").toUpperCase().includes("TEST") || p.id === 235 || p.id === 236) {
      targetUrl = `${prefix}/products/beds/${p.slug || `test-product-${p.id}`}`;
    } else if (category === "beds" || category === "morphy-beds" || category === "traditional-beds") {
      const isMorphy = Boolean(
        p.isMorphy ??
        ((p.name || "").includes("MORPHY") || (p.category || "").includes("MORPHY"))
      );
      const o = (p.orientation || "Vertical").toLowerCase();
      const style = (p.sub_category || p.type || "Classic").toLowerCase();

      let flagshipSlug = "classic-vertical-wall-bed";
      if (isMorphy) {
        if (style.includes("integrated")) flagshipSlug = `integrated-${o}-wall-bed`;
        else if (style.includes("studio")) flagshipSlug = `studio-${o}-wall-bed`;
        else flagshipSlug = `classic-${o}-wall-bed`;
      } else {
        if (style.includes("studio")) flagshipSlug = `studio-${o}-traditional-bed`;
        else flagshipSlug = `classic-${o}-traditional-bed`;
      }

      const minDim = Math.min(Number(p.width) || 0, Number(p.length) || 0);
      const maxDim = Math.max(Number(p.width) || 0, Number(p.length) || 0);
      const sizeSlug = (minDim && maxDim)
        ? `${Math.round(minDim / 10)}x${Math.round(maxDim / 10)}`
        : (p.sizeSlug || null);

      targetUrl = `${prefix}/products/beds/${flagshipSlug}${sizeSlug ? `?size=${sizeSlug}` : ""}`;
    } else if (category === "sofas") {
      const s = (p.sub_category || p.type || "").toLowerCase();
      const slug = (s.includes("free") || s.includes("standing"))
        ? "free-standing-modular-sofa"
        : "bed-front-modular-sofa";
      targetUrl = `${prefix}/products/sofas/${slug}`;
    } else if (category === "mattresses") {
      const s = (p.sub_category || p.type || "").toLowerCase();
      let slug = "comfort-mattress";
      if (s.includes("supreme")) slug = "supreme-mattress";
      else if (s.includes("luxury")) slug = "luxury-mattress";
      const minDim = Math.min(Number(p.width) || 0, Number(p.length) || 0);
      const maxDim = Math.max(Number(p.width) || 0, Number(p.length) || 0);
      const sizeSlug = (minDim && maxDim)
        ? `${Math.round(minDim / 10)}x${Math.round(maxDim / 10)}`
        : (p.sizeSlug || null);
      targetUrl = `${prefix}/products/mattresses/${slug}${sizeSlug ? `?size=${sizeSlug}` : ""}`;
    } else if (category === "cabinets") {
      const s = (p.sub_category || p.type || "").toLowerCase();
      const o = (p.orientation || "").toLowerCase();
      let slug = "vertical-wall-bed-cabinet";
      if (s.includes("side") || s.includes("wardrobe")) slug = "side-storage-wardrobe-cabinet";
      else if (s.includes("ext") || s.includes("overhead") || s.includes("bridge")) slug = "overhead-storage-extension-cabinet";
      else if (s.includes("horiz") || o === "horizontal") slug = "horizontal-wall-bed-cabinet";
      const sizeSlug = p.sizeSlug || null;
      targetUrl = `${prefix}/products/cabinets/${slug}${sizeSlug ? `?size=${sizeSlug}` : ""}`;
    } else if (category === "tables") {
      const s = (p.sub_category || p.type || "").toLowerCase();
      let slug = "transforming-coffee-dining-table";
      if (s.includes("mounted") || s.includes("folding")) slug = "wall-mounted-folding-table";
      else if (s.includes("extending") || s.includes("console")) slug = "extending-console-dining-table";
      targetUrl = `${prefix}/products/tables/${slug}`;
    } else {
      targetUrl = `${prefix}/products/${category}/${p.slug || p.id}`;
    }
  }

  if (options.preview || options.admin) {
    const separator = targetUrl.includes("?") ? "&" : "?";
    targetUrl = `${targetUrl}${separator}preview=1`;
  }

  return targetUrl;
}

export const OFFICIAL_INSTALLATION_VIDEOS = [
  {
    key: "morphy-classic",
    title: "Classic MORPHY™ Bed (3D Animated Guide)",
    videoId: "1MQ7Ksb2t-Y",
    url: "https://www.youtube.com/watch?v=1MQ7Ksb2t-Y",
    category: "beds",
    model: "Classic MORPHY",
  },
  {
    key: "morphy-studio",
    title: "Studio MORPHY™ Bed (3D Animated Guide)",
    videoId: "tz9-MVtDb7I",
    url: "https://www.youtube.com/watch?v=tz9-MVtDb7I",
    category: "beds",
    model: "Studio MORPHY",
  },
  {
    key: "morphy-integrated",
    title: "Integrated MORPHY™ Bed (3D Animated Guide)",
    videoId: "yyyw2hTSFII",
    url: "https://www.youtube.com/watch?v=yyyw2hTSFII",
    category: "beds",
    model: "Integrated MORPHY",
  },
  {
    key: "traditional-classic",
    title: "Classic Wall Bed Traditional (Assembly Video)",
    videoId: "P-Bu-WuWakM",
    url: "https://www.youtube.com/watch?v=P-Bu-WuWakM",
    category: "beds",
    model: "Classic Traditional",
  },
  {
    key: "traditional-studio",
    title: "Studio Wall Bed Traditional (Flat-Packed Guide)",
    videoId: "mD0vF1k075c",
    url: "https://www.youtube.com/watch?v=mD0vF1k075c",
    category: "beds",
    model: "Studio Traditional",
  },
  {
    key: "cabinets",
    title: "Cabinet Enclosure & Storage Unit Assembly",
    videoId: "o2dD3Qn7bKk",
    url: "https://www.youtube.com/watch?v=o2dD3Qn7bKk",
    category: "cabinets",
    model: "Cabinets",
  },
];

export function parseYouTubeVideo(input) {
  if (!input || typeof input !== "string") return null;
  const str = input.trim();
  if (!str) return null;

  let videoId = null;
  const regExp = /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = str.match(regExp);

  if (match && match[1] && match[1].length === 11) {
    videoId = match[1];
  } else if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    videoId = str;
  }

  if (!videoId) return null;

  return {
    videoId,
    embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`,
    watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
  };
}

/**
 * Calculate Morphy Sofa add-on surcharge for a bed.
 * - Vertical beds: width <= 120cm => 499, width >= 135cm => 998 (in all currencies)
 * - Horizontal beds: always 998 (in all currencies)
 */
export function calculateSofaPrice(itemOrProduct, orientationStr = null, sizeStr = null) {
  const isHoriz =
    (orientationStr && String(orientationStr).toLowerCase().includes("horizontal")) ||
    (itemOrProduct?.options?.orientation && String(itemOrProduct.options.orientation).toLowerCase().includes("horizontal")) ||
    (itemOrProduct?.sub_category && String(itemOrProduct.sub_category).toLowerCase().includes("horizontal")) ||
    (itemOrProduct?.slug && String(itemOrProduct.slug).toLowerCase().includes("horizontal")) ||
    (itemOrProduct?.name && String(itemOrProduct.name).toLowerCase().includes("horizontal"));

  if (isHoriz) {
    return 998;
  }

  // Determine width in cm
  let widthCm = null;

  if (itemOrProduct?.width) {
    const w = Number(itemOrProduct.width);
    if (!isNaN(w) && w > 0) {
      widthCm = w > 250 ? Math.round(w / 10) : w;
    }
  }

  if (!widthCm) {
    const text = `${sizeStr || ""} ${itemOrProduct?.options?.size || ""} ${itemOrProduct?.size || ""} ${itemOrProduct?.slug || ""} ${itemOrProduct?.name || ""}`;
    const match = text.match(/(?:^|[^\d])(\d{2,3})\s*[xX*]\s*(\d{2,3})/);
    if (match) {
      widthCm = parseInt(match[1], 10);
    } else {
      const lower = text.toLowerCase();
      if (lower.includes("single") || lower.includes("twin")) widthCm = 90;
      else if (lower.includes("double") || lower.includes("queen") || lower.includes("king")) widthCm = 140;
    }
  }

  return (widthCm && widthCm <= 120) ? 499 : 998;
}

export function parseTableFinish(variant, index = 0, allVariants = []) {
  if (!variant) {
    return {
      label: "Standard Finish",
      topHex: "#D2B48C",
      legHex: "#D2B48C",
      isTwoTone: false,
    };
  }

  let raw = variant.color || variant.name || "Standard";
  if (raw.includes(" - ")) {
    raw = raw.split(" - ").slice(1).join(" - ");
  }
  // Strip bracketed model codes like (B2448-1WM), (C3488- 2AM), etc.
  raw = raw.replace(/\s*\([A-Z0-9\-\s\+]*\)/gi, "").trim();
  raw = raw.replace(/\s*\([A-Z0-9\-\s\+]*$/gi, "").trim();
  raw = raw.replace(/barble/gi, "Marble");
  raw = raw.replace(/drak/gi, "Dark");
  raw = raw.replace(/\s*\+\s*/g, " + ");

  let label = raw
    .split(" ")
    .map((w) => {
      if (w === "+") return "+";
      if (!w) return "";
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ")
    .trim();

  // If duplicate labels exist in the variant list, append SKU or model code to disambiguate
  const duplicates = (allVariants || []).filter(
    (v) =>
      (v.color || v.name || "").toLowerCase().replace(/[^a-z]/g, "") ===
      (variant.color || variant.name || "").toLowerCase().replace(/[^a-z]/g, "")
  );
  if (duplicates.length > 1 && variant.sku) {
    const skuCode = variant.sku.split("-")[0] || variant.sku;
    label = `${label} (${skuCode})`;
  }

  const s = (variant.color || variant.name || "").toLowerCase();

  let topHex = "#D2B48C"; // default wood
  if (s.includes("walnut") && s.includes("dark")) topHex = "#3E2723";
  else if (s.includes("walnut")) topHex = "#5C4033";
  else if (
    s.includes("white glossy") ||
    s.includes("white top") ||
    s.includes("white mdf") ||
    s.includes("white glass")
  )
    topHex = "#FFFFFF";
  else if (
    s.includes("black marble") ||
    s.includes("black barble") ||
    s.includes("black glass") ||
    s.includes("black glossy")
  )
    topHex = "#1A1A1A";
  else if (s.includes("black")) topHex = "#1A1A1A";
  else if (
    s.includes("natural wood") ||
    s.includes("oak") ||
    s.includes("solid wood")
  )
    topHex = "#C19A6B";
  else if (s.includes("dark grey") || s.includes("dark gray"))
    topHex = "#4A4A4A";
  else if (
    s.includes("grey") ||
    s.includes("gray") ||
    s.includes("light grey")
  )
    topHex = "#8A8A8A";
  else if (s.includes("blue")) topHex = "#1E3A8A";
  else if (s.includes("khaki")) topHex = "#BDB76B";
  else if (s.includes("silver") || s.includes("silvery")) topHex = "#C0C0C0";

  let legHex = null;
  if (
    s.includes("silver leg") ||
    s.includes("silvery paint") ||
    s.includes("silver frame") ||
    s.includes("silver")
  )
    legHex = "#C0C0C0";
  else if (
    s.includes("dark gray leg") ||
    s.includes("dark gray frame") ||
    s.includes("dark grey leg") ||
    s.includes("dark grey frame") ||
    s.includes("dark grey")
  )
    legHex = "#4A4A4A";
  else if (s.includes("black leg") || s.includes("black frame"))
    legHex = "#1A1A1A";
  else if (s.includes("white leg") || s.includes("white frame"))
    legHex = "#FFFFFF";
  else if (s.includes("khaki frame")) legHex = "#BDB76B";

  const isTwoTone = Boolean(legHex && legHex !== topHex);

  return {
    label: label || variant.sku || "Standard Finish",
    topHex,
    legHex: legHex || topHex,
    isTwoTone,
  };
}

export { findProductBySlug, getProductVariants };



