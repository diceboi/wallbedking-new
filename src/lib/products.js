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
      return data;
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
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', productSlug)
      .single();

    if (!error && data) {
      return data;
    }
  } catch (err) {
    // fallback
  }

  return findProductBySlug(categorySlug, productSlug);
}

export { findProductBySlug, getProductVariants };
