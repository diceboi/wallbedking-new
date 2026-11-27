"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useLocale } from "@/context/LocaleContext";
import defaultSettingsData from "@/data/shipping_payment_settings.json";
import { trackAddToCart, trackRemoveFromCart } from "@/lib/analytics";

const CartContext = createContext(null);

const STORAGE_KEY = "wbk_cart_v1";
const PROMO_STORAGE_KEY = "wbk_promo_v1";
const APPLIED_COUPON_STORAGE_KEY = "wbk_applied_coupon_v1";
const AFFILIATE_STORAGE_KEY = "wbk_affiliate_ref_v1";
const DELIVERY_STORAGE_KEY = "wbk_delivery_v1";

function readAffiliateFromStorage() {
  try {
    const raw = localStorage.getItem(AFFILIATE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.code && (!parsed.expiresAt || Date.now() < parsed.expiresAt)) {
        return String(parsed.code).toUpperCase();
      }
      localStorage.removeItem(AFFILIATE_STORAGE_KEY);
    }
  } catch {
    // ignore
  }
  return null;
}

function saveAffiliateToStorage(code, cookieDays = 30) {
  try {
    if (!code) {
      localStorage.removeItem(AFFILIATE_STORAGE_KEY);
      document.cookie = "wbk_affiliate_ref=; path=/; max-age=0; SameSite=Lax";
      return;
    }
    const clean = String(code).trim().toUpperCase();
    const maxAgeSec = Math.max(1, Number(cookieDays || 30)) * 24 * 60 * 60;
    const expiresAt = Date.now() + maxAgeSec * 1000;
    localStorage.setItem(AFFILIATE_STORAGE_KEY, JSON.stringify({ code: clean, expiresAt }));
    document.cookie = `wbk_affiliate_ref=${encodeURIComponent(clean)}; path=/; max-age=${maxAgeSec}; SameSite=Lax`;
  } catch {
    // ignore
  }
}

// Delivery options matching Wall Bed King standard
export const DELIVERY_OPTIONS = {
  delivery_option_discount: {
    id: "delivery_option_discount",
    key: "delivery_option_discount",
    label: "Discount Delivery (-5%)",
    menu: "Discount Delivery (-5%)",
    cost: 0,
    discountPercent: 5,
    code: 0,
    message: "Delivery within 5 - 8 weeks (Extra 5% off your order)",
  },
  delivery_option_economy: {
    id: "delivery_option_economy",
    key: "delivery_option_economy",
    label: "Free delivery",
    menu: "Free delivery",
    cost: 0,
    discountPercent: 0,
    code: 1,
    message: "Delivery within 3 - 5 weeks",
  },
  delivery_option_standard: {
    id: "delivery_option_standard",
    key: "delivery_option_standard",
    label: "Standard delivery",
    menu: "Standard delivery £59",
    cost: 59,
    discountPercent: 0,
    code: 2,
    message: "Delivery within 1 - 3 weeks",
  },
  delivery_option_express: {
    id: "delivery_option_express",
    key: "delivery_option_express",
    label: "Express delivery",
    menu: "Express delivery £79",
    cost: 79,
    discountPercent: 0,
    code: 3,
    message: "Delivery within 7 working days",
  },
  delivery_option_pickup: {
    id: "delivery_option_pickup",
    key: "delivery_option_pickup",
    label: "Warehouse Collection",
    menu: "Collection (Free)",
    cost: 0,
    discountPercent: 0,
    code: 1,
    address: "Wall Bed King, Harlow, CM20 2HU. Mon - Fri, 10am - 4pm. Must be arranged by contacting us.",
    message: "To be collected from our warehouse in Harlow, CM20 2HU. Mon - Fri, 10am - 4pm. Must be arranged by contacting us.",
  },
};

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [promoCode, setPromoCode] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [affiliateCode, setAffiliateCode] = useState(null);
  const [serverCouponDiscount, setServerCouponDiscount] = useState(null);
  const [serverDeliveryDiscount, setServerDeliveryDiscount] = useState(null);
  const [serverPromoValid, setServerPromoValid] = useState(true);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [deliveryOption, setDeliveryOption] = useState("delivery_option_economy");
  const [isMounted, setIsMounted] = useState(false);
  const [remoteSettings, setRemoteSettings] = useState(null);

  // Safely extract locale from LocaleContext
  const localeCtx = useLocale();
  const activeLocale = (localeCtx?.locale || "en").toLowerCase();

  // Function to load fresh settings from API
  const loadFreshSettings = useCallback(async () => {
    try {
      const res = await fetch(`/api/checkout/settings?locale=${activeLocale}&_t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      const data = await res.json();
      if (data?.success && data?.config) {
        setRemoteSettings(data.config);
      }
    } catch {
      // Fallback to local data
    }
  }, [activeLocale]);

  // Fetch updated settings from API when mounted, locale changes, window regains focus, or custom event fires
  useEffect(() => {
    loadFreshSettings();

    const handleRefresh = () => {
      loadFreshSettings();
    };

    window.addEventListener("focus", handleRefresh);
    window.addEventListener("wbk_settings_updated", handleRefresh);
    window.addEventListener("storage", handleRefresh);

    return () => {
      window.removeEventListener("focus", handleRefresh);
      window.removeEventListener("wbk_settings_updated", handleRefresh);
      window.removeEventListener("storage", handleRefresh);
    };
  }, [loadFreshSettings]);

  // Combine default JSON with remote settings for active market
  const checkoutSettings = useMemo(() => {
    const baseDefault =
      defaultSettingsData[activeLocale] ||
      defaultSettingsData.en ||
      {};
    if (remoteSettings && remoteSettings.locale === activeLocale) {
      return {
        ...baseDefault,
        ...remoteSettings,
        payments: {
          ...(baseDefault.payments || {}),
          ...(remoteSettings.payments || {}),
        },
        shipping: {
          ...(baseDefault.shipping || {}),
          ...(remoteSettings.shipping || {}),
        },
      };
    }
    return baseDefault;
  }, [remoteSettings, activeLocale]);

  // Dynamic delivery options for the active market, filtered to enabled options only
  const deliveryOptions = useMemo(() => {
    const shippingConfig =
      checkoutSettings?.shipping || defaultSettingsData.en.shipping;
    const symbol = checkoutSettings?.currencySymbol || "£";
    const result = {};

    const orderedKeys = [
      "delivery_option_discount",
      "delivery_option_economy",
      "delivery_option_standard",
      "delivery_option_express",
      "delivery_option_pickup",
      ...Object.keys(shippingConfig).filter(
        (k) =>
          ![
            "delivery_option_discount",
            "delivery_option_economy",
            "delivery_option_standard",
            "delivery_option_express",
            "delivery_option_pickup",
          ].includes(k)
      ),
    ];

    orderedKeys.forEach((key) => {
      const opt = shippingConfig[key];
      if (opt && opt.enabled) {
        const discountPercent =
          Number(
            opt.discountPercent ??
              (key === "delivery_option_discount" ? 5 : 0)
          ) || 0;
        result[key] = {
          id: key,
          key: key,
          label: opt.label,
          menu:
            opt.cost === 0
              ? opt.label
              : `${opt.label} ${symbol}${opt.cost}`,
          cost: Number(opt.cost) || 0,
          discountPercent,
          code:
            key === "delivery_option_express"
              ? 3
              : key === "delivery_option_standard"
              ? 2
              : key === "delivery_option_discount"
              ? 0
              : 1,
          message: opt.message,
          enabled: true,
        };
      }
    });

    if (Object.keys(result).length === 0) {
      result.delivery_option_economy = {
        id: "delivery_option_economy",
        key: "delivery_option_economy",
        label: "Free delivery",
        menu: "Free delivery",
        cost: 0,
        discountPercent: 0,
        code: 1,
        message: "Delivery within 3 - 5 weeks",
        enabled: true,
      };
    }

    return result;
  }, [checkoutSettings]);

  // If currently selected deliveryOption is not enabled for this market, fallback to first enabled option
  useEffect(() => {
    if (deliveryOptions && !deliveryOptions[deliveryOption]) {
      const firstKey = Object.keys(deliveryOptions)[0];
      if (firstKey) {
        setDeliveryOption(firstKey);
      }
    }
  }, [deliveryOptions, deliveryOption]);

  // Load cart from localStorage on mount (prevents SSR hydration mismatch)
  useEffect(() => {
    setIsMounted(true);
    try {
      const savedCart = localStorage.getItem(STORAGE_KEY);
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) setItems(parsed);
      }
      const savedPromo = localStorage.getItem(PROMO_STORAGE_KEY);
      if (savedPromo) {
        setPromoCode(String(savedPromo).trim().toUpperCase());
      }
      const savedCouponRaw = localStorage.getItem(APPLIED_COUPON_STORAGE_KEY);
      if (savedCouponRaw) {
        try {
          const parsedCoupon = JSON.parse(savedCouponRaw);
          if (parsedCoupon?.code) setAppliedCoupon(parsedCoupon);
        } catch {}
      }
      const savedAff = readAffiliateFromStorage();
      if (savedAff) {
        setAffiliateCode(savedAff);
      }
      const savedDelivery = localStorage.getItem(DELIVERY_STORAGE_KEY);
      if (savedDelivery && DELIVERY_OPTIONS[savedDelivery]) {
        setDeliveryOption(savedDelivery);
      }
    } catch (e) {
      console.warn("Could not read cart from localStorage", e);
    }
  }, []);

  // Save cart to localStorage on changes
  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("Could not save cart to localStorage", e);
    }
  }, [items, isMounted]);

  // Save promo & applied coupon to localStorage on changes
  useEffect(() => {
    if (!isMounted) return;
    try {
      if (promoCode) {
        localStorage.setItem(PROMO_STORAGE_KEY, promoCode);
      } else {
        localStorage.removeItem(PROMO_STORAGE_KEY);
      }
      if (appliedCoupon) {
        localStorage.setItem(APPLIED_COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem(APPLIED_COUPON_STORAGE_KEY);
      }
    } catch (e) {
      console.warn("Could not save promo to localStorage", e);
    }
  }, [promoCode, appliedCoupon, isMounted]);

  // Save delivery option to localStorage on changes
  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem(DELIVERY_STORAGE_KEY, deliveryOption);
    } catch (e) {
      console.warn("Could not save delivery option to localStorage", e);
    }
  }, [deliveryOption, isMounted]);

  // Revalidate active promo code against server whenever locale/market changes (even if cart is empty!)
  useEffect(() => {
    if (!isMounted || !promoCode) return;
    let cancelled = false;
    const targetCurrency = (
      localeCtx?.market?.currency ||
      (activeLocale === "us" ? "USD" : activeLocale === "en" ? "GBP" : "EUR")
    ).toUpperCase();

    async function revalidatePromoForMarket() {
      try {
        const res = await fetch("/api/coupons/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: promoCode,
            items,
            currency: targetCurrency,
            locale: activeLocale,
            deliveryOption,
          }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (data?.valid && data?.coupon) {
          setServerPromoValid(true);
          setAppliedCoupon(data.coupon);
          setServerCouponDiscount(Number(data.couponDiscountAmount) || 0);
          if (data.deliveryDiscountAmount !== undefined) {
            setServerDeliveryDiscount(Number(data.deliveryDiscountAmount) || 0);
          }
          setPromoError("");
        } else {
          // Coupon is not valid in this market/state — suppress discount & badge for this storefront
          setServerPromoValid(false);
          setServerCouponDiscount(0);
        }
      } catch {
        // ignore network hiccup
      }
    }

    revalidatePromoForMarket();
    return () => {
      cancelled = true;
    };
  }, [activeLocale, localeCtx?.market?.currency, isMounted, promoCode]);

  // Revalidate cart item prices against database when activeLocale or currency changes
  useEffect(() => {
    if (!isMounted || items.length === 0) return;

    let isSubscribed = true;
    const targetCurrency = (localeCtx?.market?.currency || (activeLocale === "us" ? "USD" : (activeLocale === "en" ? "GBP" : "EUR"))).toUpperCase();

    async function syncPrices() {
      try {
        const res = await fetch("/api/checkout/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items,
            deliveryOption,
            promoCode: promoCode || "",
            currency: targetCurrency,
            locale: activeLocale,
          }),
        });
        const data = await res.json();
        if (isSubscribed && data?.success && Array.isArray(data?.items)) {
          let hasDiff = false;
          const updatedItems = items.map((origItem, idx) => {
            const validated = data.items[idx];
            if (validated) {
              const priceChanged = validated.price !== origItem.price;
              const stockStatusChanged = Boolean(validated.isOutOfStock) !== Boolean(origItem.isOutOfStock);
              if (priceChanged || stockStatusChanged) {
                hasDiff = true;
                return {
                  ...origItem,
                  price: validated.price,
                  rawId: validated.rawId || origItem.rawId,
                  slug: validated.slug || origItem.slug,
                  isOutOfStock: Boolean(validated.isOutOfStock),
                  stock: validated.stock ?? origItem.stock,
                };
              }
            }
            return origItem;
          });

          if (hasDiff) {
            setItems(updatedItems);
          }

          // Sync authoritative server-side coupon & delivery discount calculations
          if (promoCode) {
            if (data.couponResult?.valid) {
              setServerCouponDiscount(Number(data.couponDiscountAmount) || 0);
              setServerDeliveryDiscount(Number(data.deliveryDiscountAmount) || 0);
              if (data.couponResult.publicInfo) {
                setAppliedCoupon(data.couponResult.publicInfo);
              }
              setPromoError("");
            } else {
              setServerCouponDiscount(0);
              setServerDeliveryDiscount(Number(data.deliveryDiscountAmount) || 0);
              if (data.couponResult?.error) {
                setPromoError(data.couponResult.error);
              }
            }
          } else {
            setServerCouponDiscount(0);
            setServerDeliveryDiscount(Number(data.deliveryDiscountAmount) || 0);
          }
        }
      } catch (err) {
        console.warn("[CartContext] Price revalidation notice:", err);
      }
    }

    syncPrices();

    return () => {
      isSubscribed = false;
    };
  }, [activeLocale, localeCtx?.market?.currency, isMounted, deliveryOption, promoCode, items.length]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  /**
   * Add item to cart
   * @param {Object} item - { id, productId, title, image, price, options, href }
   * @param {number} quantity - defaults to 1
   * @param {boolean} openDrawer - whether to open the slide-over drawer automatically
   */
  const addItem = useCallback((item, quantity = 1, openDrawer = true) => {
    if (
      item.isOutOfStock ||
      (item.stock !== undefined && item.stock !== null && Number(item.stock) <= 0)
    ) {
      console.warn("[CartContext] Item is out of stock and cannot be added:", item);
      return;
    }
    // Generate unique ID based on product & specific configuration
    const configHash = [
      item.productId || item.id,
      item.options?.size || "",
      item.options?.orientation || "",
      item.options?.type || "",
      item.options?.sofaIncluded ? "sofa" : "",
      item.options?.cabinetIncluded ? "cabinet" : "",
      item.options?.color || "",
    ].filter(Boolean).join("-");

    const cartItemId = item.id || configHash;

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((i) => i.id === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }
      return [
        ...prevItems,
        {
          ...item,
          id: cartItemId,
          quantity: Math.max(1, quantity),
        },
      ];
    });

    // Ecommerce dataLayer & Meta tracking
    try {
      trackAddToCart({
        id: item.productId || item.id || cartItemId,
        name: item.title || item.name || "Wall Bed King Product",
        category: item.options?.type || item.category || "Wall Bed",
        variant: item.options?.size || "",
        price: Number(item.price) || 0,
        quantity,
        currency: localeCtx?.market?.currency || (activeLocale === "en" ? "GBP" : "EUR"),
      });
    } catch (e) {
      console.warn("Analytics trackAddToCart warning:", e);
    }

    if (openDrawer) {
      setIsCartOpen(true);
    }
  }, [localeCtx, activeLocale]);

  /**
   * Update quantity of an item
   */
  const updateQuantity = useCallback((cartItemId, quantity) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== cartItemId));
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === cartItemId ? { ...item, quantity } : item
      )
    );
  }, []);

  /**
   * Remove item from cart
   */
  const removeItem = useCallback((cartItemId) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === cartItemId);
      if (target) {
        try {
          trackRemoveFromCart({
            id: target.productId || target.id || cartItemId,
            name: target.title || target.name || "Wall Bed King Product",
            price: Number(target.price) || 0,
            quantity: target.quantity || 1,
            currency: localeCtx?.market?.currency || (activeLocale === "en" ? "GBP" : "EUR"),
          });
        } catch (e) {
          console.warn("Analytics trackRemoveFromCart warning:", e);
        }
      }
      return prev.filter((i) => i.id !== cartItemId);
    });
  }, [localeCtx, activeLocale]);

  /**
   * Clear all items from cart
   */
  const clearCart = useCallback(() => {
    setItems([]);
    setPromoCode(null);
    setAppliedCoupon(null);
    setServerCouponDiscount(null);
    setServerDeliveryDiscount(null);
    setPromoError("");
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(PROMO_STORAGE_KEY);
      localStorage.removeItem(APPLIED_COUPON_STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  }, []);

  /**
   * Activate an affiliate / influencer offer from a ?ref=CODE link
   */
  const activateAffiliateOffer = useCallback((offer) => {
    if (!offer?.code) return;
    const clean = String(offer.code).trim().toUpperCase();
    setAffiliateCode(clean);
    saveAffiliateToStorage(clean, offer.cookie_days || 30);
    if (offer.auto_apply_on_ref !== false) {
      setServerPromoValid(true);
      setPromoCode(clean);
      setAppliedCoupon(offer);
      setPromoError("");
    }
  }, []);

  /**
   * Apply promotional / influencer discount code (validated strictly on server)
   */
  const applyPromoCode = useCallback(
    async (rawCode, customerEmail = "") => {
      setPromoError("");
      const cleaned = String(rawCode || "").trim().toUpperCase();
      if (!cleaned) {
        setPromoError("Please enter a discount code.");
        return false;
      }
      setPromoLoading(true);
      try {
        const targetCurrency = (
          localeCtx?.market?.currency ||
          (activeLocale === "us" ? "USD" : activeLocale === "en" ? "GBP" : "EUR")
        ).toUpperCase();
        const res = await fetch("/api/coupons/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: cleaned,
            items,
            currency: targetCurrency,
            locale: activeLocale,
            deliveryOption,
            customerEmail,
          }),
        });
        const data = await res.json();
        if (data?.valid && data?.coupon) {
          setServerPromoValid(true);
          setPromoCode(data.coupon.code);
          setAppliedCoupon(data.coupon);
          setServerCouponDiscount(Number(data.couponDiscountAmount) || 0);
          if (data.deliveryDiscountAmount !== undefined) {
            setServerDeliveryDiscount(Number(data.deliveryDiscountAmount) || 0);
          }
          if (data.coupon.is_influencer) {
            setAffiliateCode(data.coupon.code);
            saveAffiliateToStorage(data.coupon.code, data.coupon.cookie_days || 30);
          }
          setPromoError("");
          return true;
        }
        setPromoError(data?.error || "Invalid or expired discount code.");
        return false;
      } catch (err) {
        setPromoError("Could not verify discount code. Please try again.");
        return false;
      } finally {
        setPromoLoading(false);
      }
    },
    [items, activeLocale, localeCtx?.market?.currency, deliveryOption]
  );

  const removePromoCode = useCallback(() => {
    setPromoCode(null);
    setAppliedCoupon(null);
    setServerCouponDiscount(0);
    setServerDeliveryDiscount(null);
    setPromoError("");
    try {
      localStorage.removeItem(PROMO_STORAGE_KEY);
      localStorage.removeItem(APPLIED_COUPON_STORAGE_KEY);
    } catch {}
  }, []);

  // ── Calculated properties ──
  const totalItems = useMemo(() => {
    return items.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.quantity) || 1;
      return acc + price * qty;
    }, 0);
  }, [items]);

  // Shipping option details
  const selectedDeliveryDetails = useMemo(() => {
    return deliveryOptions[deliveryOption] || Object.values(deliveryOptions)[0];
  }, [deliveryOptions, deliveryOption]);

  const shipping = useMemo(() => {
    return selectedDeliveryDetails?.cost ?? 0;
  }, [selectedDeliveryDetails]);

  // Payment gateway status flags for current market
  const isStripeEnabled = Boolean(checkoutSettings?.payments?.stripe?.enabled);
  const isPayPalEnabled = Boolean(checkoutSettings?.payments?.paypal?.enabled);
  const isQuickPayEnabled = Boolean(checkoutSettings?.payments?.quickPayInCart?.enabled);
  const isBankTransferEnabled = Boolean(checkoutSettings?.payments?.bankTransfer?.enabled);

  // Strict market/country eligibility check for active coupon
  const isCouponEligibleForLocale = useMemo(() => {
    if (!promoCode || !appliedCoupon || !serverPromoValid) return false;
    const markets = appliedCoupon.target_markets;
    if (!Array.isArray(markets) || markets.length === 0) return true;
    return markets.map((m) => String(m).toLowerCase()).includes(activeLocale);
  }, [promoCode, appliedCoupon, serverPromoValid, activeLocale]);

  const effectivePromoCode = isCouponEligibleForLocale ? promoCode : null;
  const effectiveAppliedCoupon = isCouponEligibleForLocale ? appliedCoupon : null;

  // Calculate discount based on active server-validated coupon and/or delivery discount (respecting stacking flag & market eligibility)
  const couponDiscount = useMemo(() => {
    if (!effectivePromoCode || !effectiveAppliedCoupon) return 0;
    if (serverCouponDiscount !== null && items.length > 0) {
      return Math.min(subtotal, Math.max(0, Number(serverCouponDiscount) || 0));
    }
    if (effectiveAppliedCoupon.discount_type === "fixed") {
      return Math.min(subtotal, Math.max(0, Number(effectiveAppliedCoupon.discount_value) || 0));
    }
    const pct = Number(effectiveAppliedCoupon.discount_value) || 0;
    return Math.min(subtotal, Math.round(subtotal * (pct / 100) * 100) / 100);
  }, [effectivePromoCode, effectiveAppliedCoupon, serverCouponDiscount, items.length, subtotal]);

  const deliveryDiscount = useMemo(() => {
    const canStack =
      !effectivePromoCode ||
      !effectiveAppliedCoupon ||
      Boolean(effectiveAppliedCoupon.allow_stack_with_delivery_discount);
    if (!canStack) return 0;
    if (serverDeliveryDiscount !== null && items.length > 0) {
      return Math.max(0, Number(serverDeliveryDiscount) || 0);
    }
    const deliveryDiscountPct =
      Number(
        selectedDeliveryDetails?.discountPercent ??
          (deliveryOption === "delivery_option_discount" ? 5 : 0)
      ) || 0;
    if (deliveryDiscountPct > 0 && subtotal > 0) {
      return Math.round(subtotal * (deliveryDiscountPct / 100) * 100) / 100;
    }
    return 0;
  }, [effectivePromoCode, effectiveAppliedCoupon, serverDeliveryDiscount, items.length, selectedDeliveryDetails, deliveryOption, subtotal]);

  const discount = useMemo(() => {
    return Math.min(subtotal, Math.round((couponDiscount + deliveryDiscount) * 100) / 100);
  }, [subtotal, couponDiscount, deliveryDiscount]);

  // 20% UK VAT included in price
  const vatIncluded = useMemo(() => {
    const taxableTotal = Math.max(0, subtotal - discount + shipping);
    return Math.round(taxableTotal - taxableTotal / 1.2);
  }, [subtotal, discount, shipping]);

  const total = useMemo(() => {
    return Math.max(0, Math.round((subtotal - discount + shipping) * 100) / 100);
  }, [subtotal, discount, shipping]);

  // Generate unique customCartId matching Wall Bed King standard
  // Format: {pid}-{qty}||T={timestamp}||D={delivery_option}
  const customCartId = useMemo(() => {
    const parts = items.map(
      (item) => `${item.rawId || item.productId || item.id}-${item.quantity || 1}`
    );
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const timestamp = `${pad(now.getDate())}${pad(now.getMonth() + 1)}${now.getFullYear()}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    return `${parts.join("-")}||T=${timestamp}||D=${deliveryOption}`;
  }, [items, deliveryOption]);

  const activePromoDetails = useMemo(() => {
    if (effectivePromoCode && effectiveAppliedCoupon) {
      return {
        code: effectiveAppliedCoupon.code || effectivePromoCode,
        type: effectiveAppliedCoupon.discount_type || "percent",
        value: effectiveAppliedCoupon.discount_value || 0,
        label: effectiveAppliedCoupon.influencer_name
          ? `${effectiveAppliedCoupon.code} (${effectiveAppliedCoupon.influencer_name})`
          : effectiveAppliedCoupon.code,
        ...effectiveAppliedCoupon,
      };
    }
    if (deliveryDiscount > 0) {
      const deliveryDiscountPct =
        Number(
          selectedDeliveryDetails?.discountPercent ??
            (deliveryOption === "delivery_option_discount" ? 5 : 0)
        ) || 0;
      return {
        code: `-${deliveryDiscountPct}%`,
        type: "percent",
        value: deliveryDiscountPct,
        label: selectedDeliveryDetails?.label || `Discount Delivery (-${deliveryDiscountPct}%)`,
      };
    }
    return null;
  }, [effectivePromoCode, effectiveAppliedCoupon, deliveryDiscount, selectedDeliveryDetails, deliveryOption]);

  const value = {
    items,
    isCartOpen,
    openCart,
    closeCart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    totalItems,
    subtotal,
    shipping,
    deliveryOption,
    setDeliveryOption,
    selectedDeliveryDetails,
    deliveryOptions,
    checkoutSettings,
    isStripeEnabled,
    isPayPalEnabled,
    isQuickPayEnabled,
    isBankTransferEnabled,
    customCartId,
    discount,
    couponDiscount,
    deliveryDiscount,
    vatIncluded,
    total,
    promoCode: effectivePromoCode,
    appliedCoupon: effectiveAppliedCoupon,
    affiliateCode: isCouponEligibleForLocale ? affiliateCode : null,
    promoLoading,
    promoError,
    activePromoDetails,
    applyPromoCode,
    removePromoCode,
    activateAffiliateOffer,
    isMounted,
    refreshCheckoutSettings: loadFreshSettings,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
