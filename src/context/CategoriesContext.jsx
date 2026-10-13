"use client";

import { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import categoriesFallback from "@/data/categories.json";

const CategoriesContext = createContext(null);

export function CategoriesProvider({ initialCategories, children }) {
  const sanitize = (list) =>
    (Array.isArray(list) ? list : []).filter((c) => c.is_visible !== false);

  const [categories, setCategories] = useState(() => {
    if (Array.isArray(initialCategories) && initialCategories.length > 0) {
      return sanitize(initialCategories);
    }
    return sanitize(categoriesFallback);
  });

  const refreshCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
        setCategories(sanitize(data.categories));
      }
    } catch (err) {
      console.warn("[CategoriesContext] Failed to refresh categories:", err);
    }
  }, []);

  useEffect(() => {
    refreshCategories();
  }, [refreshCategories]);

  const featuredCategories = useMemo(() => {
    // Top 4 categories ordered by display_order for the homepage grid
    const sorted = [...categories].sort(
      (a, b) => (a.display_order ?? 999) - (b.display_order ?? 999)
    );
    // Prefer explicit is_featured or take top 4
    const featured = sorted.filter((c) => c.is_featured !== false && c.is_visible !== false);
    return (featured.length >= 4 ? featured : sorted.filter((c) => c.is_visible !== false)).slice(0, 4);
  }, [categories]);

  const getCategoryById = useCallback(
    (id) => categories.find((c) => c.id === id || c.slug === id),
    [categories]
  );

  const value = useMemo(
    () => ({
      categories,
      featuredCategories,
      refreshCategories,
      getCategoryById,
    }),
    [categories, featuredCategories, refreshCategories, getCategoryById]
  );

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (!context) {
    const fallbackSorted = [...categoriesFallback].sort(
      (a, b) => (a.display_order ?? 999) - (b.display_order ?? 999)
    );
    return {
      categories: categoriesFallback,
      featuredCategories: fallbackSorted.slice(0, 4),
      refreshCategories: async () => {},
      getCategoryById: (id) => categoriesFallback.find((c) => c.id === id),
    };
  }
  return context;
}
