"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

const CartContext = createContext(null);

const STORAGE_KEY = "wbk_cart_v1";
const PROMO_STORAGE_KEY = "wbk_promo_v1";
const DELIVERY_STORAGE_KEY = "wbk_delivery_v1";

// Delivery options matching Wall Bed King standard
export const DELIVERY_OPTIONS = {
  delivery_option_economy: {
    id: "delivery_option_economy",
    key: "delivery_option_economy",
    label: "Free delivery",
    menu: "Free delivery",
    cost: 0,
    code: 1,
    message: "Delivery within 2 - 4 weeks",
  },
  delivery_option_standard: {
    id: "delivery_option_standard",
    key: "delivery_option_standard",
    label: "Standard delivery",
    menu: "Standard delivery £49",
    cost: 49,
    code: 2,
    message: "Delivery within 1 - 2 weeks",
  },
  delivery_option_express: {
    id: "delivery_option_express",
    key: "delivery_option_express",
    label: "Express delivery",
    menu: "Express delivery £79",
    cost: 79,
    code: 3,
    message: "Delivery within 2 - 5 working days",
  },
  delivery_option_pickup: {
    id: "delivery_option_pickup",
    key: "delivery_option_pickup",
    label: "Warehouse Collection",
    menu: "Collection (Free)",
    cost: 0,
    code: 1,
    address: "Wall Bed King, Harlow, CM20 2HU. Mon - Fri, 10am - 4pm. Must be arranged by contacting us.",
    message: "To be collected from our warehouse in Harlow, CM20 2HU. Mon - Fri, 10am - 4pm. Must be arranged by contacting us.",
  },
};

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
  const [deliveryOption, setDeliveryOption] = useState("delivery_option_economy");
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

  // Save delivery option to localStorage on changes
  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem(DELIVERY_STORAGE_KEY, deliveryOption);
    } catch (e) {
      console.warn("Could not save delivery option to localStorage", e);
    }
  }, [deliveryOption, isMounted]);

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

  // Shipping option details
  const selectedDeliveryDetails = useMemo(() => {
    return DELIVERY_OPTIONS[deliveryOption] || DELIVERY_OPTIONS.delivery_option_economy;
  }, [deliveryOption]);

  const shipping = useMemo(() => {
    return selectedDeliveryDetails?.cost ?? 0;
  }, [selectedDeliveryDetails]);

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
    const taxableTotal = Math.max(0, subtotal - discount + shipping);
    return Math.round(taxableTotal - taxableTotal / 1.2);
  }, [subtotal, discount, shipping]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discount + shipping);
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
    deliveryOption,
    setDeliveryOption,
    selectedDeliveryDetails,
    deliveryOptions: DELIVERY_OPTIONS,
    customCartId,
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
