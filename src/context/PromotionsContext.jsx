"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import {
  calculateCampaignDiscount,
  isProductEligibleForCampaign,
  isCampaignEligibleForLocale,
  setClientCampaignsCache,
} from "@/lib/promotions";

const PromotionsContext = createContext(null);

export function PromotionsProvider({ children, initialCampaigns = [] }) {
  const { isAdmin, session } = useAuth();
  const localeContext = useLocale();
  const locale = localeContext?.locale || "en";
  const [campaigns, setCampaigns] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("wbk_campaigns_cache"); // Clear old unkeyed cache
        const cached = localStorage.getItem(`wbk_campaigns_cache_${locale}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            return parsed.filter((c) => isCampaignEligibleForLocale(c, locale));
          }
        }
      } catch {}
    }
    if (Array.isArray(initialCampaigns) && initialCampaigns.length > 0) {
      return initialCampaigns.filter((c) => isCampaignEligibleForLocale(c, locale));
    }
    return [];
  });
  const [loading, setLoading] = useState(true);

  // Safety timer to prevent infinite loading in case of offline/network failure
  useEffect(() => {
    const safety = setTimeout(() => {
      setLoading(false);
    }, 1800);
    return () => clearTimeout(safety);
  }, []);

  // Initialize client cache if initial campaigns provided
  useEffect(() => {
    if (initialCampaigns.length > 0) {
      setClientCampaignsCache(initialCampaigns);
    }
  }, [initialCampaigns]);

  const fetchPromotions = useCallback(async () => {
    try {
      const headers = {};
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }
      const res = await fetch(`/api/promotions?locale=${encodeURIComponent(locale || "en")}`, {
        headers,
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.campaigns)) {
          setCampaigns(data.campaigns);
          setClientCampaignsCache(data.campaigns);
          try {
            localStorage.setItem(`wbk_campaigns_cache_${locale}`, JSON.stringify(data.campaigns));
          } catch {}
        }
      }
    } catch (e) {
      console.warn("Failed to load storefront promotions:", e?.message);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token, locale]);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions, isAdmin, session?.access_token, locale]);

  // Active top bar campaign (highest priority campaign with top_bar.enabled and eligible for market)
  const topBarCampaign = useMemo(() => {
    const matching = campaigns.filter(
      (c) => c?.top_bar?.enabled && isCampaignEligibleForLocale(c, locale)
    );
    if (matching.length === 0) return null;
    return matching.sort((a, b) => (b.priority || 0) - (a.priority || 0))[0];
  }, [campaigns, locale]);

  // Active hero campaigns (all campaigns with hero_banner.enabled, eligible for market, sorted by priority)
  const heroCampaigns = useMemo(() => {
    return campaigns
      .filter((c) => c?.hero_banner?.enabled && isCampaignEligibleForLocale(c, locale))
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }, [campaigns, locale]);

  // Helper to check if a product is covered by any active campaign for current market
  const isProductPromoted = useCallback(
    (product) => {
      if (!product || campaigns.length === 0) return false;
      return campaigns.some((c) => isProductEligibleForCampaign(product, c, locale));
    },
    [campaigns, locale],
  );

  // Helper to calculate promotional price for a product in current market
  const getPromotionalPrice = useCallback(
    (product, basePrice, currency = "GBP") => {
      return calculateCampaignDiscount(product, basePrice, currency, campaigns, locale);
    },
    [campaigns, locale],
  );

  const value = useMemo(
    () => ({
      campaigns,
      loading,
      topBarCampaign,
      heroCampaigns,
      hasActiveCampaign: campaigns.length > 0,
      isProductPromoted,
      getPromotionalPrice,
      refreshPromotions: fetchPromotions,
    }),
    [
      campaigns,
      loading,
      topBarCampaign,
      heroCampaigns,
      isProductPromoted,
      getPromotionalPrice,
      fetchPromotions,
    ],
  );

  return (
    <PromotionsContext.Provider value={value}>
      {children}
    </PromotionsContext.Provider>
  );
}

export function usePromotions() {
  const context = useContext(PromotionsContext);
  if (!context) {
    return {
      campaigns: [],
      loading: false,
      topBarCampaign: null,
      heroCampaigns: [],
      hasActiveCampaign: false,
      isProductPromoted: () => false,
      getPromotionalPrice: (_p, base) => ({
        originalPrice: base,
        finalPrice: base,
        discountAmount: 0,
        discountPercent: 0,
        appliedCampaign: null,
        isPromotional: false,
      }),
      refreshPromotions: () => {},
    };
  }
  return context;
}

