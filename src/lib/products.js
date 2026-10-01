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
      query = query.eq('parent_category', category);
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
  if (
    !product.available_locales ||
    !Array.isArray(product.available_locales) ||
    product.available_locales.length === 0
  ) {
    return true; // Default: available everywhere
  }
  return product.available_locales.includes(locale);
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

export { findProductBySlug, getProductVariants };

