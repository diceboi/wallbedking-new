"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";

const WholesaleContext = createContext(null);
const WHOLESALE_CART_KEY = "wbk_wholesale_cart_v1";

export function WholesaleProvider({ children }) {
  const pathname = usePathname();
  const isWholesaleRoute = Boolean(
    pathname && /^\/([a-z]{2,3}\/)?wholesale(\/|$)/i.test(pathname)
  );
  const { user, session, loading: authLoading } = useAuth();
  const { locale } = useLocale();

  const [pricingLoading, setPricingLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [partner, setPartner] = useState(null);
  const [prices, setPrices] = useState({});
  const [hiddenProductIds, setHiddenProductIds] = useState([]);
  const [paymentSettings, setPaymentSettings] = useState(null);

  // Completely separated B2B Wholesale Cart (never mixes with retail cart)
  const [wholesaleItems, setWholesaleItems] = useState([]);
  const [isWholesaleCartOpen, setIsWholesaleCartOpen] = useState(false);
  const [cartMounted, setCartMounted] = useState(false);

  useEffect(() => {
    setCartMounted(true);
    try {
      const saved = localStorage.getItem(WHOLESALE_CART_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setWholesaleItems(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!cartMounted) return;
    try {
      localStorage.setItem(WHOLESALE_CART_KEY, JSON.stringify(wholesaleItems));
    } catch {
      // ignore
    }
  }, [wholesaleItems, cartMounted]);

  const fetchWholesalePricing = useCallback(async () => {
    if (authLoading) return;
    setPricingLoading(true);
    try {
      const headers = { "Cache-Control": "no-cache" };
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }
      const res = await fetch(`/api/wholesale/pricing?locale=${encodeURIComponent(locale || "en")}&_t=${Date.now()}`, {
        headers,
        cache: "no-store",
      });
      const data = await res.json();
      if (data?.success) {
        setAuthorized(Boolean(data.authorized));
        setPartner(data.partner || null);
        setPrices(data.prices || {});
        setHiddenProductIds(Array.isArray(data.hiddenProductIds) ? data.hiddenProductIds : []);
        setPaymentSettings(data.paymentSettings || null);
      } else {
        setAuthorized(false);
        setPartner(null);
        setPrices({});
      }
    } catch (err) {
      console.warn("[WholesaleContext] Pricing fetch error:", err?.message);
      setAuthorized(false);
      setPartner(null);
      setPrices({});
    } finally {
      setPricingLoading(false);
    }
  }, [authLoading, session?.access_token, user?.id, locale]);

  // Only fetch wholesale pricing when actually visiting wholesale pages or opening wholesale cart
  useEffect(() => {
    if (!isWholesaleRoute && !isWholesaleCartOpen) return;
    fetchWholesalePricing();
  }, [isWholesaleRoute, isWholesaleCartOpen, fetchWholesalePricing]);

  const addWholesaleItem = useCallback((product, pricingInfo, { orderUnit = "unit", quantity = 1 } = {}) => {
    if (!product || !pricingInfo || !pricingInfo.hasPrice) return;
    const isContainer = orderUnit === "container" && pricingInfo.containerQty > 0;
    const lineKey = `${product.id}__${isContainer ? "container" : "unit"}`;
    const unitPrice = isContainer ? pricingInfo.containerTotal : pricingInfo.unitPrice;
    const addQty = Math.max(1, parseInt(quantity, 10) || 1);

    setWholesaleItems((prev) => {
      const idx = prev.findIndex((it) => it.lineKey === lineKey);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          quantity: next[idx].quantity + addQty,
          price: unitPrice,
          currency: pricingInfo.currency,
        };
        return next;
      }
      return [
        ...prev,
        {
          lineKey,
          id: lineKey,
          rawId: product.id,
          sku: product.sku || "",
          slug: product.slug || "",
          title: product.name || product.title || "Wall Bed King Product",
          image: product.image || "",
          price: unitPrice,
          quantity: addQty,
          currency: pricingInfo.currency,
          options: {
            orderType: "wholesale",
            orderUnit: isContainer ? "container" : "unit",
            unitsPerContainer: isContainer ? pricingInfo.containerQty : null,
            unitNetPrice: pricingInfo.unitPrice,
            currency: pricingInfo.currency,
            vatNote: "Excl. VAT (Net)",
          },
        },
      ];
    });
    setIsWholesaleCartOpen(true);
  }, []);

  const updateWholesaleQty = useCallback((lineKey, nextQty) => {
    const qty = parseInt(nextQty, 10) || 0;
    setWholesaleItems((prev) =>
      qty <= 0
        ? prev.filter((it) => it.lineKey !== lineKey)
        : prev.map((it) => (it.lineKey === lineKey ? { ...it, quantity: qty } : it))
    );
  }, []);

  const removeWholesaleItem = useCallback((lineKey) => {
    setWholesaleItems((prev) => prev.filter((it) => it.lineKey !== lineKey));
  }, []);

  const clearWholesaleCart = useCallback(() => {
    setWholesaleItems([]);
  }, []);

  const wholesaleSubtotal = useMemo(
    () =>
      Math.round(
        wholesaleItems.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0) * 100
      ) / 100,
    [wholesaleItems]
  );

  const wholesaleCurrency = useMemo(() => {
    if (wholesaleItems.length > 0 && wholesaleItems[0].currency) {
      return wholesaleItems[0].currency;
    }
    const firstPrice = Object.values(prices).find((p) => p?.hasPrice);
    return firstPrice?.currency || "USD";
  }, [wholesaleItems, prices]);

  const wholesaleTotalCount = useMemo(
    () => wholesaleItems.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0),
    [wholesaleItems]
  );

  const value = {
    isWholesaleRoute,
    pricingLoading,
    authorized,
    partner,
    prices,
    hiddenProductIds,
    paymentSettings,
    refreshWholesalePricing: fetchWholesalePricing,
    wholesaleItems,
    wholesaleSubtotal,
    wholesaleCurrency,
    wholesaleTotalCount,
    isWholesaleCartOpen,
    setIsWholesaleCartOpen,
    addWholesaleItem,
    updateWholesaleQty,
    removeWholesaleItem,
    clearWholesaleCart,
  };

  return <WholesaleContext.Provider value={value}>{children}</WholesaleContext.Provider>;
}

export function useWholesale() {
  const ctx = useContext(WholesaleContext);
  if (!ctx) {
    throw new Error("useWholesale must be used inside WholesaleProvider");
  }
  return ctx;
}
