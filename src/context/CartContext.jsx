"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

const CartContext = createContext(null);

const STORAGE_KEY = "wbk_cart_v1";
const PROMO_STORAGE_KEY = "wbk_promo_v1";

// Sample valid promo codes
const PROMO_CODES = {
  WBK10: { type: "percent", value: 10, label: "10% Welcome Discount" },
  SAVE50: { type: "fixed", value: 50, label: "£50 Off Orders" },
  FREEDELIVERY: { type: "fixed", value: 0, label: "Free UK Delivery" },
};

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [promoCode, setPromoCode] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [isMounted, setIsMounted] = useState(false);

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
        setPromoCode(savedPromo);
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

  // Save promo to localStorage on changes
  useEffect(() => {
    if (!isMounted) return;
    try {
      if (promoCode) {
        localStorage.setItem(PROMO_STORAGE_KEY, promoCode);
      } else {
        localStorage.removeItem(PROMO_STORAGE_KEY);
      }
    } catch (e) {
      console.warn("Could not save promo to localStorage", e);
    }
  }, [promoCode, isMounted]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  /**
   * Add item to cart
   * @param {Object} item - { id, productId, title, image, price, options, href }
   * @param {number} quantity - defaults to 1
   * @param {boolean} openDrawer - whether to open the slide-over drawer automatically
   */
  const addItem = useCallback((item, quantity = 1, openDrawer = true) => {
    // Generate unique ID based on product & specific configuration
    const configHash = [
      item.productId || item.id,
      item.options?.size || "",
      item.options?.orientation || "",
      item.options?.type || "",
      item.options?.sofaIncluded ? "sofa" : "",
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

    if (openDrawer) {
      setIsCartOpen(true);
    }
  }, []);

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
    setItems((prev) => prev.filter((i) => i.id !== cartItemId));
  }, []);

  /**
   * Clear all items from cart
   */
  const clearCart = useCallback(() => {
    setItems([]);
    setPromoCode(null);
    setPromoError("");
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(PROMO_STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  }, []);

  /**
   * Apply promotional discount code
   */
  const applyPromoCode = useCallback((rawCode) => {
    setPromoError("");
    const cleaned = String(rawCode || "").trim().toUpperCase();
    if (!cleaned) {
      setPromoError("Please enter a discount code.");
      return false;
    }
    if (PROMO_CODES[cleaned]) {
      setPromoCode(cleaned);
      setPromoError("");
      return true;
    } else {
      setPromoError("Invalid discount code. Try 'WBK10' or 'SAVE50'.");
      return false;
    }
  }, []);

  const removePromoCode = useCallback(() => {
    setPromoCode(null);
    setPromoError("");
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

  // Shipping is free UK Mainland for all wall bed orders
  const shipping = 0;

  // Calculate discount based on active promo code
  const discount = useMemo(() => {
    if (!promoCode || !PROMO_CODES[promoCode]) return 0;
    const promo = PROMO_CODES[promoCode];
    if (promo.type === "percent") {
      return Math.round((subtotal * promo.value) / 100);
    }
    if (promo.type === "fixed") {
      return Math.min(subtotal, promo.value);
    }
    return 0;
  }, [promoCode, subtotal]);

  // 20% UK VAT included in price
  const vatIncluded = useMemo(() => {
    const taxableTotal = Math.max(0, subtotal - discount);
    return Math.round(taxableTotal - taxableTotal / 1.2);
  }, [subtotal, discount]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discount + shipping);
  }, [subtotal, discount, shipping]);

  const activePromoDetails = useMemo(() => {
    if (!promoCode || !PROMO_CODES[promoCode]) return null;
    return {
      code: promoCode,
      ...PROMO_CODES[promoCode],
    };
  }, [promoCode]);

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
    discount,
    vatIncluded,
    total,
    promoCode,
    promoError,
    activePromoDetails,
    applyPromoCode,
    removePromoCode,
    isMounted,
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
