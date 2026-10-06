"use client";

import { createContext, useContext, useMemo } from "react";
import {
  RAW_CATALOG,
  ALL_FLAGSHIP_PRODUCTS,
  ALL_PRODUCTS,
  ALL_BED_VARIANTS,
  buildCatalog,
  findProductBySlug as baseFindProductBySlug,
  getProductVariants as baseGetProductVariants,
} from "@/data/products";

const ProductCatalogContext = createContext(null);

export function ProductCatalogProvider({ initialProducts, children }) {
  const catalogData = useMemo(() => {
    if (!initialProducts || !Array.isArray(initialProducts) || initialProducts.length === 0) {
      return {
        rawCatalog: RAW_CATALOG,
        allFlagships: ALL_FLAGSHIP_PRODUCTS,
        allProducts: ALL_PRODUCTS,
        allBedVariants: ALL_BED_VARIANTS,
      };
    }
    return buildCatalog(initialProducts);
  }, [initialProducts]);

  const value = useMemo(() => {
    return {
      rawCatalog: catalogData.rawCatalog,
      allFlagships: catalogData.allFlagships,
      allProducts: catalogData.allProducts,
      allBedVariants: catalogData.allBedVariants,
      findProductBySlug: (categorySlug, productSlug) =>
        baseFindProductBySlug(
          categorySlug,
          productSlug,
          catalogData.rawCatalog,
          catalogData.allFlagships
        ),
      getProductVariants: (product) =>
        baseGetProductVariants(product, catalogData.rawCatalog),
    };
  }, [catalogData]);

  return (
    <ProductCatalogContext.Provider value={value}>
      {children}
    </ProductCatalogContext.Provider>
  );
}

export function useProductCatalog() {
  const context = useContext(ProductCatalogContext);
  if (!context) {
    return {
      rawCatalog: RAW_CATALOG,
      allFlagships: ALL_FLAGSHIP_PRODUCTS,
      allProducts: ALL_PRODUCTS,
      allBedVariants: ALL_BED_VARIANTS,
      findProductBySlug: (categorySlug, productSlug) =>
        baseFindProductBySlug(categorySlug, productSlug, RAW_CATALOG, ALL_FLAGSHIP_PRODUCTS),
      getProductVariants: (product) =>
        baseGetProductVariants(product, RAW_CATALOG),
    };
  }
  return context;
}
