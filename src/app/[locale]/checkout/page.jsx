"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import {
  IconLock,
  IconArrowLeft,
  IconTruck,
  IconCreditCard,
  IconShieldCheck,
  IconCheck,
  IconChevronRight,
  IconSparkles,
  IconPrinter,
  IconBrandPaypal,
  IconUser,
  IconUserCheck,
  IconChevronDown,
  IconChevronUp,
  IconEye,
  IconEyeOff,
  IconAlertCircle,
  IconLoader2,
  IconBookmark,
  IconHome,
} from "@tabler/icons-react";
import { useCart } from "@/context/CartContext";
import { useLocale } from "@/context/LocaleContext";
import { useAuth } from "@/context/AuthContext";
import { StripeCheckoutButton } from "@/components/checkout/StripeCheckoutButton";
import { PayPalCheckoutButton } from "@/components/checkout/PayPalCheckoutButton";
import { formatSizeLabel } from "@/lib/i18n";

export default function CheckoutPage() {
  const { t, formatPrice, localizedHref, locale } = useLocale();
  const { user, signInWithPassword, signUpWithPassword, signOut, saveAddress } =
    useAuth();
  const {
    items,
    subtotal,
    discount,
    vatIncluded,
    shipping,
    total,
    deliveryOption,
    setDeliveryOption,
    deliveryOptions,
    selectedDeliveryDetails,
    promoCode,
    activePromoDetails,
    clearCart,
    isMounted,
  } = useCart();

  const finalTotal = total;

  // Form states
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    city: "",
    postcode: "",
    country: "United Kingdom",
    paymentMethod: "card", // 'card' | 'klarna' | 'paypal'
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    cardName: "",
    agreeTerms: true,
  });

  // Non-blocking Inline Auth States
  const [isAuthExpanded, setIsAuthExpanded] = useState(false);
  const [authTab, setAuthTab] = useState("login"); // 'login' | 'register'
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authFullName, setAuthFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  // Saved Addresses State
  const savedAddresses = useMemo(() => {
    return Array.isArray(user?.user_metadata?.addresses)
      ? user.user_metadata.addresses
      : [];
  }, [user]);

  const [selectedSavedAddrIndex, setSelectedSavedAddrIndex] = useState(0);
  const [addressAppliedFeedback, setAddressAppliedFeedback] = useState("");
  const [saveAddressToAccount, setSaveAddressToAccount] = useState(false);
  const [addressSaveFeedback, setAddressSaveFeedback] = useState("");

  // When user is signed in with no saved address, default "Save to account" checkbox to true
  useEffect(() => {
    if (user && savedAddresses.length === 0) {
      setSaveAddressToAccount(true);
    }
  }, [user, savedAddresses.length]);

  // If user is authenticated, sync email and name to checkout form if not yet entered
  useEffect(() => {
    if (user) {
      setFormData((prev) => {
        const next = { ...prev };
        let changed = false;
        if (!prev.email && user.email) {
          next.email = user.email;
          changed = true;
        }
        if (
          user.user_metadata?.full_name &&
          !prev.firstName &&
          !prev.lastName
        ) {
          const parts = user.user_metadata.full_name.trim().split(" ");
          next.firstName = parts[0] || "";
          next.lastName = parts.slice(1).join(" ") || "";
          changed = true;
        }
        return changed ? next : prev;
      });
      if (user.email && !authEmail) {
        setAuthEmail(user.email);
      }
    }
  }, [user]);

  // Selected address object
  const activeSavedAddr =
    savedAddresses[selectedSavedAddrIndex] || savedAddresses[0] || null;

  // Handler to apply saved address to form
  const handleApplySavedAddress = (addr) => {
    if (!addr) return;
    let fName = formData.firstName;
    let lName = formData.lastName;
    if (addr.recipient) {
      const parts = addr.recipient.trim().split(" ");
      fName = parts[0] || "";
      lName = parts.slice(1).join(" ") || "";
    }
    setFormData((prev) => ({
      ...prev,
      firstName: fName || prev.firstName,
      lastName: lName || prev.lastName,
      address1: addr.street || prev.address1,
      address2: addr.apartment || "",
      city: addr.city || prev.city,
      postcode: addr.postcode || prev.postcode,
      country: addr.country || prev.country,
      phone: addr.phone || prev.phone,
    }));
    setAddressAppliedFeedback(
      t(
        "checkout.addressAppliedSuccess",
        "Saved address applied! You can adjust any field below.",
      ),
    );
    setTimeout(() => setAddressAppliedFeedback(""), 4500);
  };

  // Helper to persist address to account if checkbox was selected
  const persistAddressToAccountIfNeeded = async () => {
    if (!user || !saveAddressToAccount) return;
    if (
      !formData.address1?.trim() ||
      !formData.city?.trim() ||
      !formData.postcode?.trim()
    )
      return;

    try {
      const recipientName =
        `${formData.firstName || ""} ${formData.lastName || ""}`.trim() ||
        user.user_metadata?.full_name ||
        "Valued Customer";
      await saveAddress({
        name: `${formData.city} Delivery`,
        recipient: recipientName,
        street: formData.address1.trim(),
        apartment: formData.address2?.trim() || "",
        city: formData.city.trim(),
        postcode: formData.postcode.trim().toUpperCase(),
        country: formData.country || "United Kingdom",
        phone: formData.phone?.trim() || "",
        isDefault: savedAddresses.length === 0,
      });
      setAddressSaveFeedback(
        t(
          "checkout.addressSavedSuccess",
          "Address saved to your account profile!",
        ),
      );
      setTimeout(() => setAddressSaveFeedback(""), 4000);
    } catch (err) {
      console.warn("Could not save address to account:", err);
    }
  };

  // Inline Authentication Handlers
  const handleInlineLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    const targetEmail = (authEmail || formData.email || "").trim();
    if (!targetEmail || !authPassword) {
      setAuthError(
        t("auth.enterEmailPassword", "Please enter both email and password."),
      );
      return;
    }
    setAuthLoading(true);
    try {
      await signInWithPassword(targetEmail, authPassword);
      setAuthSuccess(t("auth.loginSuccess", "Logged in successfully!"));
      setFormData((prev) => ({
        ...prev,
        email: prev.email || targetEmail.toLowerCase(),
      }));
      setTimeout(() => {
        setIsAuthExpanded(false);
        setAuthSuccess("");
        setAuthPassword("");
      }, 1000);
    } catch (err) {
      console.error("Inline login error:", err);
      setAuthError(
        err.message ||
          t("auth.invalidCredentials", "Invalid email or password."),
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const handleInlineRegister = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    const targetEmail = (authEmail || formData.email || "").trim();
    if (!targetEmail || !authPassword) {
      setAuthError(
        t("auth.enterEmailPassword", "Please enter email and password."),
      );
      return;
    }
    if (authPassword.length < 6) {
      setAuthError(
        t("auth.passwordMinLength", "Password must be at least 6 characters."),
      );
      return;
    }
    setAuthLoading(true);
    try {
      const data = await signUpWithPassword(
        targetEmail,
        authPassword,
        authFullName,
      );
      setAuthSuccess(
        data?.user && !data.session
          ? t(
              "auth.confirmEmailSent",
              "Account created! Please check your email to verify.",
            )
          : t("auth.accountCreated", "Account created successfully!"),
      );
      setFormData((prev) => ({
        ...prev,
        email: prev.email || targetEmail.toLowerCase(),
      }));
      if (authFullName.trim() && !formData.firstName) {
        const parts = authFullName.trim().split(" ");
        setFormData((prev) => ({
          ...prev,
          firstName: prev.firstName || parts[0] || "",
          lastName: prev.lastName || parts.slice(1).join(" ") || "",
        }));
      }
      setTimeout(() => {
        setIsAuthExpanded(false);
        setAuthSuccess("");
        setAuthPassword("");
      }, 1200);
    } catch (err) {
      console.error("Inline register error:", err);
      setAuthError(
        err.message ||
          t("auth.signupFailed", "Could not create account. Please try again."),
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // Basic validation
    if (
      !formData.email ||
      !formData.firstName ||
      !formData.lastName ||
      !formData.address1 ||
      !formData.city ||
      !formData.postcode
    ) {
      setErrorMessage(
        t(
          "checkout.requiredFieldsError",
          "Please complete all required shipping address fields.",
        ),
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // If requested, persist new address to account
      await persistAddressToAccountIfNeeded();

      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          customer: {
            email: formData.email,
            phone: formData.phone,
            name: `${formData.firstName} ${formData.lastName}`.trim(),
          },
          shippingAddress: formData,
          deliveryOption,
          promoCode,
          paymentMethod: formData.paymentMethod,
          userId: user?.id || null,
        }),
      });

      const data = await res.json();
      if (data.success && data.orderId) {
        setOrderNumber(data.orderId);
        setIsSubmitting(false);
        setOrderComplete(true);
        clearCart();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        throw new Error(data.error || "Failed to process order.");
      }
    } catch (err) {
      console.error("Submit order error:", err);
      setErrorMessage(
        err.message ||
          "There was an error creating your order. Please try again.",
      );
      setIsSubmitting(false);
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center font-poppins text-sm text-wbk-brown">
        Loading checkout...
      </div>
    );
  }

  // If order is completed, show Thank You / Confirmation Screen
  if (orderComplete) {
    return (
      <div className="bg-wbk-white min-h-screen font-poppins py-16">
        <Container size="md" className="max-w-2xl text-center space-y-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-wbk-green/20 text-wbk-black flex items-center justify-center">
            <IconCheck size={40} className="text-wbk-green" strokeWidth={2.5} />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-wbk-gold block">
              {t("checkout.orderConfirmed", "Order Confirmed")}
            </span>
            <h1 className="font-new-york text-3xl sm:text-4xl text-wbk-black">
              {t("checkout.thankYouOrder", "Thank you for your order")},{" "}
              {formData.firstName}!
            </h1>
            <p className="text-sm text-wbk-brown max-w-md mx-auto leading-relaxed">
              We have received your order and our dispatch team is preparing
              your precision-engineered wall bed.
            </p>
          </div>

          {/* Order Details Card */}
          <div className="bg-[#FBF9F8] border border-wbk-lightgrey p-6 sm:p-8 text-left space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-wbk-lightgrey">
              <div>
                <span className="text-[11px] text-wbk-brown uppercase tracking-wider block">
                  {t("checkout.orderReference", "Order Reference")}
                </span>
                <span className="font-bold text-lg text-wbk-black font-poppins">
                  {orderNumber}
                </span>
              </div>
              <div className="sm:text-right">
                <span className="text-[11px] text-wbk-brown uppercase tracking-wider block">
                  {t("checkout.confirmationSentTo", "Confirmation Sent To")}
                </span>
                <span className="text-xs font-medium text-wbk-black">
                  {formData.email}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-wbk-brown">
              <div>
                <h4 className="font-semibold uppercase tracking-wider text-wbk-black text-[11px] mb-1.5">
                  {t("checkout.shippingAddress", "Delivery Address")}
                </h4>
                <p className="text-wbk-black font-medium">
                  {formData.firstName} {formData.lastName}
                </p>
                <p>{formData.address1}</p>
                {formData.address2 && <p>{formData.address2}</p>}
                <p>
                  {formData.city}, {formData.postcode}
                </p>
                <p>{formData.country}</p>
                <p className="pt-1">Tel: {formData.phone || "Not provided"}</p>
              </div>

              <div>
                <h4 className="font-semibold uppercase tracking-wider text-wbk-black text-[11px] mb-1.5">
                  {t("checkout.shippingMethod", "Shipping & Service")}
                </h4>
                <p className="text-wbk-black font-medium">
                  {selectedDeliveryDetails?.label ||
                    "Standard UK Mainland Delivery"}
                </p>
                <p className="pt-2 text-[11px] leading-relaxed">
                  Our courier will contact you 24 hours prior to dispatch with
                  an exact 2-hour delivery window.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-wbk-lightgrey flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-wider text-wbk-black">
                {t("checkout.totalPaid", "Total Paid")}
              </span>
              <span className="font-bold text-xl text-wbk-black font-poppins">
                {formatPrice(finalTotal)}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={() => window.print()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-wbk-lightgrey bg-white text-xs font-medium uppercase tracking-wider text-wbk-black hover:border-wbk-black transition-colors"
            >
              <IconPrinter size={15} />
              <span>{t("checkout.printReceipt", "Print Receipt")}</span>
            </button>
            <Link
              href={localizedHref("/")}
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 bg-wbk-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-wbk-green hover:text-wbk-black transition-colors"
            >
              {t("checkout.returnHome", "Return to Homepage")}
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  // If cart is empty and not completed order
  if (items.length === 0) {
    return (
      <div className="bg-wbk-white min-h-[60vh] flex flex-col items-center justify-center text-center font-poppins py-20 px-4">
        <h2 className="font-new-york text-2xl text-wbk-black mb-2">
          {t("cart.empty", "Your cart is empty")}
        </h2>
        <p className="text-xs text-wbk-brown max-w-sm mb-6">
          {t(
            "cart.emptyDesc",
            "Please add a wall bed or accessory to your cart before proceeding to checkout.",
          )}
        </p>
        <Link
          href={localizedHref("/products/beds")}
          className="px-6 py-3 bg-wbk-black text-white text-xs font-medium uppercase tracking-wider hover:bg-wbk-green hover:text-wbk-black transition-colors"
        >
          {t("categories.classicBeds", "Browse Products")}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-wbk-white min-h-screen font-poppins pb-24">
      {/* Minimal Checkout Header */}
      <header className="border-b border-wbk-lightgrey bg-[#FBF9F8] py-4">
        <Container size="xl" className="flex items-center justify-between">
          <Link
            href={localizedHref("/cart")}
            className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-wbk-brown hover:text-wbk-black transition-colors"
          >
            <IconArrowLeft size={16} />
            <span>{t("checkout.returnToBasket", "Return to Cart")}</span>
          </Link>

          <Link
            href={localizedHref("/")}
            className="font-new-york text-xl sm:text-2xl text-wbk-black"
          >
            WallBedKing
          </Link>

          <div className="flex items-center gap-1.5 text-xs text-wbk-brown">
            <IconLock size={14} className="text-wbk-green" />
            <span className="hidden sm:inline font-medium">
              {t("checkout.secureBadge", "256-Bit SSL Secure Checkout")}
            </span>
          </div>
        </Container>
      </header>

      {/* Main Checkout Form Layout */}
      <Container size="xl" className="pt-8 sm:pt-12">
        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-16 items-start">
            {/* Left Column: Checkout Steps (7 cols) */}
            <div className="lg:col-span-7 space-y-10">
              {/* Optional / Non-blocking Authentication Section */}
              {!user ? (
                <div className="border border-wbk-lightgrey bg-[#FBF9F8] p-4 sm:p-5 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white border border-wbk-lightgrey flex items-center justify-center text-wbk-black shrink-0 shadow-2xs">
                        <IconUser size={20} />
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-wbk-black">
                          {t(
                            "checkout.authPromptTitle",
                            "Already have an account, or want to create one?",
                          )}
                        </h3>
                        <p className="text-[11px] text-wbk-brown mt-0.5 leading-relaxed">
                          {t(
                            "checkout.authPromptDesc",
                            "Log in to use saved addresses and track orders, or simply continue below as a guest.",
                          )}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsAuthExpanded(!isAuthExpanded)}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold uppercase tracking-wider border border-wbk-black bg-white hover:bg-wbk-black hover:text-white transition-colors shrink-0"
                    >
                      <span>
                        {isAuthExpanded
                          ? t("checkout.hideAuth", "Close")
                          : t("checkout.showAuth", "Log in / Register")}
                      </span>
                      {isAuthExpanded ? (
                        <IconChevronUp size={14} />
                      ) : (
                        <IconChevronDown size={14} />
                      )}
                    </button>
                  </div>

                  {/* Expandable In-Place Authentication Form */}
                  {isAuthExpanded && (
                    <div className="mt-4 pt-4 border-t border-wbk-lightgrey/80 animate-fadeIn">
                      {/* Tabs */}
                      <div className="flex items-center gap-2 mb-4 border-b border-wbk-lightgrey/60 pb-2">
                        <button
                          type="button"
                          onClick={() => {
                            setAuthTab("login");
                            setAuthError("");
                            setAuthSuccess("");
                          }}
                          className={`text-xs font-semibold uppercase tracking-wider pb-1 px-1 transition-colors ${
                            authTab === "login"
                              ? "border-b-2 border-wbk-black text-wbk-black"
                              : "text-wbk-brown hover:text-wbk-black"
                          }`}
                        >
                          {t("auth.loginTab", "Log In")}
                        </button>
                        <span className="text-xs text-wbk-lightgrey">|</span>
                        <button
                          type="button"
                          onClick={() => {
                            setAuthTab("register");
                            setAuthError("");
                            setAuthSuccess("");
                          }}
                          className={`text-xs font-semibold uppercase tracking-wider pb-1 px-1 transition-colors ${
                            authTab === "register"
                              ? "border-b-2 border-wbk-black text-wbk-black"
                              : "text-wbk-brown hover:text-wbk-black"
                          }`}
                        >
                          {t("auth.registerTab", "Create Account")}
                        </button>
                      </div>

                      {/* Error & Success Messages */}
                      {authError && (
                        <div className="mb-3.5 p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                          <IconAlertCircle size={16} className="shrink-0" />
                          <span>{authError}</span>
                        </div>
                      )}
                      {authSuccess && (
                        <div className="mb-3.5 p-3 bg-green-50 border border-green-200 text-green-800 text-xs flex items-center gap-2">
                          <IconCheck size={16} className="shrink-0" />
                          <span>{authSuccess}</span>
                        </div>
                      )}

                      {/* Form */}
                      {authTab === "login" ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <label className="block text-[11px] font-medium uppercase tracking-wider text-wbk-black mb-1">
                                {t("checkout.email", "Email Address")}
                              </label>
                              <input
                                type="email"
                                value={authEmail || formData.email}
                                onChange={(e) => {
                                  setAuthEmail(e.target.value);
                                  handleChange("email", e.target.value);
                                }}
                                placeholder="john.smith@example.com"
                                className="w-full px-3 py-2 text-xs border border-wbk-lightgrey focus:border-wbk-black focus:outline-none bg-white"
                              />
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="block text-[11px] font-medium uppercase tracking-wider text-wbk-black">
                                  {t("auth.password", "Password")}
                                </label>
                              </div>
                              <div className="relative">
                                <input
                                  type={showPassword ? "text" : "password"}
                                  value={authPassword}
                                  onChange={(e) =>
                                    setAuthPassword(e.target.value)
                                  }
                                  placeholder="••••••••"
                                  className="w-full px-3 py-2 text-xs border border-wbk-lightgrey focus:border-wbk-black focus:outline-none bg-white pr-9"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-wbk-brown hover:text-wbk-black"
                                >
                                  {showPassword ? (
                                    <IconEyeOff size={15} />
                                  ) : (
                                    <IconEye size={15} />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[11px] text-wbk-brown">
                              {t(
                                "checkout.guestNotice",
                                "Or simply continue below without signing in.",
                              )}
                            </span>
                            <button
                              type="button"
                              onClick={handleInlineLogin}
                              disabled={authLoading}
                              className="inline-flex items-center gap-2 px-5 py-2.5 bg-wbk-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-wbk-green hover:text-wbk-black transition-colors disabled:opacity-50"
                            >
                              {authLoading && (
                                <IconLoader2
                                  size={14}
                                  className="animate-spin"
                                />
                              )}
                              <span>{t("auth.signInBtn", "Log In")}</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div>
                              <label className="block text-[11px] font-medium uppercase tracking-wider text-wbk-black mb-1">
                                {t("checkout.fullName", "Full Name")}
                              </label>
                              <input
                                type="text"
                                value={authFullName}
                                onChange={(e) =>
                                  setAuthFullName(e.target.value)
                                }
                                placeholder="John Smith"
                                className="w-full px-3 py-2 text-xs border border-wbk-lightgrey focus:border-wbk-black focus:outline-none bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-medium uppercase tracking-wider text-wbk-black mb-1">
                                {t("checkout.email", "Email Address")}
                              </label>
                              <input
                                type="email"
                                value={authEmail || formData.email}
                                onChange={(e) => {
                                  setAuthEmail(e.target.value);
                                  handleChange("email", e.target.value);
                                }}
                                placeholder="john.smith@example.com"
                                className="w-full px-3 py-2 text-xs border border-wbk-lightgrey focus:border-wbk-black focus:outline-none bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-medium uppercase tracking-wider text-wbk-black mb-1">
                                {t("auth.password", "Password")} (min 6 chars)
                              </label>
                              <div className="relative">
                                <input
                                  type={showPassword ? "text" : "password"}
                                  value={authPassword}
                                  onChange={(e) =>
                                    setAuthPassword(e.target.value)
                                  }
                                  placeholder="••••••••"
                                  className="w-full px-3 py-2 text-xs border border-wbk-lightgrey focus:border-wbk-black focus:outline-none bg-white pr-9"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-wbk-brown hover:text-wbk-black"
                                >
                                  {showPassword ? (
                                    <IconEyeOff size={15} />
                                  ) : (
                                    <IconEye size={15} />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[11px] text-wbk-brown">
                              {t(
                                "checkout.guestNotice",
                                "Or simply continue below without signing in.",
                              )}
                            </span>
                            <button
                              type="button"
                              onClick={handleInlineRegister}
                              disabled={authLoading}
                              className="inline-flex items-center gap-2 px-5 py-2.5 bg-wbk-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-wbk-green hover:text-wbk-black transition-colors disabled:opacity-50"
                            >
                              {authLoading && (
                                <IconLoader2
                                  size={14}
                                  className="animate-spin"
                                />
                              )}
                              <span>
                                {t("auth.createAccountBtn", "Create Account")}
                              </span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="border border-wbk-green/40 bg-[#F4F9F4] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-wbk-green text-white flex items-center justify-center shrink-0">
                      <IconUserCheck size={18} />
                    </div>
                    <div>
                      <div className="text-xs text-wbk-black font-semibold">
                        {t("checkout.signedInAs", "Signed in as")}{" "}
                        <span className="font-bold underline">
                          {user.email}
                        </span>
                      </div>
                      <div className="text-[11px] text-wbk-brown">
                        {user.user_metadata?.full_name
                          ? `Welcome back, ${user.user_metadata.full_name}! `
                          : ""}
                        {t(
                          "checkout.signedInBenefit",
                          "Your order will be linked to your Wall Bed King account.",
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => signOut()}
                    className="text-xs text-wbk-brown hover:text-wbk-black underline font-medium text-left sm:text-right shrink-0"
                  >
                    {t("checkout.switchAccount", "Sign out / Switch account")}
                  </button>
                </div>
              )}

              {/* Step 1: Customer Contact */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-wbk-lightgrey/80">
                  <h2 className="font-new-york text-xl text-wbk-black flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-wbk-black text-white text-xs flex items-center justify-center font-poppins">
                      1
                    </span>
                    <span>
                      {t("checkout.contactInfo", "Contact Information")}
                    </span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="email"
                      className="block text-xs font-medium uppercase tracking-wider text-wbk-black mb-1"
                    >
                      {t("checkout.email", "Email Address")} *
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="e.g. john.smith@example.com"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs border border-wbk-lightgrey focus:border-wbk-black focus:outline-none bg-white transition-colors"
                    />
                    <span className="text-[10.5px] text-wbk-brown mt-1 block">
                      We'll send your invoice, dimensions guide, and tracking
                      link here.
                    </span>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="phone"
                      className="block text-xs font-medium uppercase tracking-wider text-wbk-black mb-1"
                    >
                      {t("checkout.phone", "Mobile Phone Number")} *
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      placeholder="e.g. 07123 456789"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs border border-wbk-lightgrey focus:border-wbk-black focus:outline-none bg-white transition-colors"
                    />
                    <span className="text-[10.5px] text-wbk-brown mt-1 block">
                      For courier delivery scheduling SMS notifications.
                    </span>
                  </div>
                </div>
              </div>

              {/* Step 2: Shipping Address */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-wbk-lightgrey/80">
                  <h2 className="font-new-york text-xl text-wbk-black flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-wbk-black text-white text-xs flex items-center justify-center font-poppins">
                      2
                    </span>
                    <span>
                      {t("checkout.shippingAddress", "Delivery Address")}
                    </span>
                  </h2>
                </div>

                {/* Saved Address Selection Banner & Button if User Has Saved Addresses */}
                {user && savedAddresses.length > 0 && (
                  <div className="p-4 sm:p-5 border-2 border-dashed border-wbk-gold/60 bg-[#FBF9F8] space-y-3 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-wbk-lightgrey/80">
                      <div className="flex items-center gap-2 text-xs font-semibold text-wbk-black">
                        <IconBookmark size={16} className="text-wbk-gold" />
                        <span>
                          {t(
                            "checkout.savedAddressAvailable",
                            "Saved delivery address available",
                          )}
                        </span>
                      </div>
                      {savedAddresses.length > 1 && (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-wbk-brown">
                            {t("checkout.selectAddress", "Select:")}
                          </span>
                          <select
                            value={selectedSavedAddrIndex}
                            onChange={(e) =>
                              setSelectedSavedAddrIndex(Number(e.target.value))
                            }
                            className="text-xs bg-white border border-wbk-lightgrey px-2.5 py-1 focus:outline-none focus:border-wbk-black font-medium"
                          >
                            {savedAddresses.map((addr, idx) => (
                              <option key={addr.id || idx} value={idx}>
                                {addr.name || `Address ${idx + 1}`}{" "}
                                {addr.isDefault ? "(Default)" : ""}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {activeSavedAddr && (
                      <div className="bg-white border border-wbk-lightgrey/80 p-3 text-xs text-wbk-brown space-y-1">
                        <div className="font-semibold text-wbk-black flex items-center justify-between">
                          <span>
                            {activeSavedAddr.recipient ||
                              activeSavedAddr.name ||
                              "Saved Recipient"}
                          </span>
                          {activeSavedAddr.isDefault && (
                            <span className="text-[10px] uppercase font-bold text-wbk-gold tracking-wider bg-wbk-gold/10 px-1.5 py-0.5 border border-wbk-gold/30">
                              Default
                            </span>
                          )}
                        </div>
                        <div>
                          {activeSavedAddr.street}
                          {activeSavedAddr.apartment
                            ? `, ${activeSavedAddr.apartment}`
                            : ""}
                        </div>
                        <div>
                          {activeSavedAddr.city}, {activeSavedAddr.postcode}
                        </div>
                        <div>{activeSavedAddr.country}</div>
                        {activeSavedAddr.phone && (
                          <div className="text-[11px] text-wbk-brown/90 pt-0.5">
                            Tel: {activeSavedAddr.phone}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => handleApplySavedAddress(activeSavedAddr)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-wbk-black text-white hover:bg-wbk-green hover:text-wbk-black text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs rounded-full"
                      >
                        <span>
                          {t(
                            "checkout.useThisSavedAddress",
                            "Use this saved address",
                          )}
                        </span>
                      </button>

                      {addressAppliedFeedback && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-wbk-green font-medium animate-fadeIn">
                          <IconCheck size={16} />
                          <span>{addressAppliedFeedback}</span>
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block font-medium uppercase tracking-wider text-wbk-black mb-1"
                    >
                      {t("checkout.firstName", "First Name")} *
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) =>
                        handleChange("firstName", e.target.value)
                      }
                      className="w-full px-3.5 py-2.5 border border-wbk-lightgrey focus:border-wbk-black focus:outline-none bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="block font-medium uppercase tracking-wider text-wbk-black mb-1"
                    >
                      {t("checkout.lastName", "Last Name")} *
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-wbk-lightgrey focus:border-wbk-black focus:outline-none bg-white transition-colors"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="address1"
                      className="block font-medium uppercase tracking-wider text-wbk-black mb-1"
                    >
                      {t("checkout.address", "Address Line 1")} *
                    </label>
                    <input
                      id="address1"
                      type="text"
                      required
                      placeholder="House name / number and street"
                      value={formData.address1}
                      onChange={(e) => handleChange("address1", e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-wbk-lightgrey focus:border-wbk-black focus:outline-none bg-white transition-colors"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="address2"
                      className="block font-medium uppercase tracking-wider text-wbk-black mb-1"
                    >
                      {t("checkout.address2", "Address Line 2 (Optional)")}
                    </label>
                    <input
                      id="address2"
                      type="text"
                      placeholder="Apartment, suite, unit, building floor"
                      value={formData.address2}
                      onChange={(e) => handleChange("address2", e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-wbk-lightgrey focus:border-wbk-black focus:outline-none bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="city"
                      className="block font-medium uppercase tracking-wider text-wbk-black mb-1"
                    >
                      {t("checkout.city", "Town / City")} *
                    </label>
                    <input
                      id="city"
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-wbk-lightgrey focus:border-wbk-black focus:outline-none bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="postcode"
                      className="block font-medium uppercase tracking-wider text-wbk-black mb-1"
                    >
                      {t("checkout.postalCode", "Postcode")} *
                    </label>
                    <input
                      id="postcode"
                      type="text"
                      required
                      placeholder="e.g. SW1A 1AA"
                      value={formData.postcode}
                      onChange={(e) => handleChange("postcode", e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-wbk-lightgrey focus:border-wbk-black focus:outline-none bg-white uppercase transition-colors"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="country"
                      className="block font-medium uppercase tracking-wider text-wbk-black mb-1"
                    >
                      {t("checkout.country", "Country")}
                    </label>
                    <select
                      id="country"
                      value={formData.country}
                      onChange={(e) => handleChange("country", e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-wbk-lightgrey focus:border-wbk-black focus:outline-none bg-white transition-colors"
                    >
                      <option value="United Kingdom">
                        United Kingdom (Free UK Delivery)
                      </option>
                      <option value="Isle of Man">Isle of Man</option>
                      <option value="Channel Islands">Channel Islands</option>
                      <option value="Ireland">Republic of Ireland</option>
                    </select>
                  </div>

                  {/* Save Address to Account Checkbox */}
                  {user && (
                    <div className="sm:col-span-2 pt-2 border-t border-wbk-lightgrey/60 mt-1">
                      <label className="flex items-center gap-2.5 cursor-pointer text-xs text-wbk-black select-none">
                        <input
                          type="checkbox"
                          checked={saveAddressToAccount}
                          onChange={(e) =>
                            setSaveAddressToAccount(e.target.checked)
                          }
                          className="w-4 h-4 accent-wbk-black cursor-pointer rounded"
                        />
                        <span className="font-medium">
                          {t(
                            "checkout.saveAddressCheckbox",
                            "Save this delivery address to my account for future orders",
                          )}
                        </span>
                      </label>
                      {addressSaveFeedback && (
                        <span className="text-[11px] text-wbk-green font-medium flex items-center gap-1 mt-1">
                          <IconCheck size={14} />
                          <span>{addressSaveFeedback}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3: Shipping Method Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-wbk-lightgrey/80">
                  <h2 className="font-new-york text-xl text-wbk-black flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-wbk-black text-white text-xs flex items-center justify-center font-poppins">
                      3
                    </span>
                    <span>
                      {t("checkout.shippingMethod", "Shipping Method")}
                    </span>
                  </h2>
                </div>

                <div className="space-y-3">
                  {Object.values(deliveryOptions).map((opt) => {
                    const isSelected = deliveryOption === opt.id;
                    return (
                      <label
                        key={opt.id}
                        onClick={() => setDeliveryOption(opt.id)}
                        className={`flex items-start justify-between p-4 border cursor-pointer transition-all ${
                          isSelected
                            ? "border-wbk-black bg-[#FBF9F8] shadow-xs"
                            : "border-wbk-lightgrey bg-white hover:border-wbk-brown"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="shippingOption"
                            checked={isSelected}
                            onChange={() => setDeliveryOption(opt.id)}
                            className="mt-0.5 accent-wbk-black cursor-pointer"
                          />
                          <div>
                            <span className="block text-xs font-semibold text-wbk-black">
                              {opt.label}
                            </span>
                            <span className="block text-[11px] text-wbk-brown mt-0.5">
                              {opt.message}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`text-xs font-bold uppercase tracking-wider shrink-0 ml-2 ${
                            opt.cost === 0
                              ? "text-wbk-green"
                              : "text-wbk-black font-poppins"
                          }`}
                        >
                          {opt.cost === 0
                            ? t("cart.shippingFree", "Free")
                            : formatPrice(opt.cost)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Step 4: Secure Payment */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-wbk-lightgrey/80">
                  <h2 className="font-new-york text-xl text-wbk-black flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-wbk-black text-white text-xs flex items-center justify-center font-poppins">
                      4
                    </span>
                    <span>{t("checkout.payment", "Secure Payment")}</span>
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Payment method selector tabs */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleChange("paymentMethod", "card")}
                      className={`p-3 text-center border text-xs font-medium transition-all cursor-pointer ${
                        formData.paymentMethod === "card"
                          ? "border-wbk-black bg-[#FBF9F8] font-semibold text-wbk-black shadow-xs"
                          : "border-wbk-lightgrey bg-white text-wbk-brown hover:border-wbk-black"
                      }`}
                    >
                      <IconCreditCard
                        size={20}
                        className="mx-auto mb-1 text-wbk-black"
                      />
                      <span className="block">
                        {t("checkout.paymentCard", "Credit / Debit Card")}
                      </span>
                      <span className="text-[10px] text-wbk-brown font-normal">
                        Stripe & Apple Pay
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleChange("paymentMethod", "paypal")}
                      className={`p-3 text-center border text-xs font-medium transition-all cursor-pointer ${
                        formData.paymentMethod === "paypal"
                          ? "border-wbk-black bg-[#FBF9F8] font-semibold text-wbk-black shadow-xs"
                          : "border-wbk-lightgrey bg-white text-wbk-brown hover:border-wbk-black"
                      }`}
                    >
                      <IconBrandPaypal
                        size={20}
                        className="mx-auto mb-1 text-[#003087]"
                      />
                      <span className="block font-semibold text-[#003087]">
                        {t("checkout.paymentPaypal", "PayPal")}
                      </span>
                      <span className="text-[10px] text-wbk-brown font-normal">
                        Express & Pay in 3
                      </span>
                    </button>
                  </div>

                  {/* Stripe Payment Box */}
                  {formData.paymentMethod === "card" && (
                    <div className="p-6 bg-[#FBF9F8] border border-wbk-lightgrey space-y-4">
                      <div className="flex items-center justify-between text-xs text-wbk-black border-b border-wbk-lightgrey pb-3">
                        <div className="flex items-center gap-2 font-semibold">
                          <IconLock size={16} className="text-wbk-green" />
                          <span>
                            {t(
                              "checkout.directStripe",
                              "Direct Stripe Checkout",
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-wbk-brown font-mono">
                          <span className="px-1.5 py-0.5 bg-white border border-wbk-lightgrey">
                            VISA
                          </span>
                          <span className="px-1.5 py-0.5 bg-white border border-wbk-lightgrey">
                            Mastercard
                          </span>
                          <span className="px-1.5 py-0.5 bg-white border border-wbk-lightgrey">
                            AMEX
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-wbk-brown leading-relaxed">
                        You will be redirected to Stripe’s secure 256-bit
                        encrypted checkout to complete your transaction with
                        card or Apple Pay.
                      </p>

                      <div className="pt-2">
                        <StripeCheckoutButton
                          label={`Pay ${formatPrice(finalTotal)} with Stripe`}
                          customerDetails={{
                            ...formData,
                            userId: user?.id || null,
                          }}
                          onBeforeCheckout={persistAddressToAccountIfNeeded}
                        />
                      </div>
                    </div>
                  )}

                  {/* PayPal Payment Box */}
                  {formData.paymentMethod === "paypal" && (
                    <div className="p-6 bg-[#FBF9F8] border border-wbk-lightgrey space-y-4">
                      <div className="flex items-center justify-between text-xs text-wbk-black border-b border-wbk-lightgrey pb-3">
                        <span className="font-semibold text-wbk-black">
                          PayPal Checkout
                        </span>
                        <span className="text-[10px] text-wbk-brown">
                          Pay with balance, card, or Pay in 3
                        </span>
                      </div>

                      <p className="text-xs text-wbk-brown leading-relaxed">
                        Click the PayPal button below to log into your PayPal
                        account and confirm your payment safely.
                      </p>

                      <div className="pt-2">
                        <PayPalCheckoutButton
                          customerDetails={{
                            ...formData,
                            userId: user?.id || null,
                          }}
                          onBeforeCheckout={persistAddressToAccountIfNeeded}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Terms agreement */}
                <div className="pt-3 text-[11px] text-wbk-brown leading-relaxed">
                  {t(
                    "checkout.agreeTerms",
                    "By confirming payment, you agree to the Wall Bed King",
                  )}{" "}
                  <Link
                    href={localizedHref("/terms")}
                    className="text-wbk-black underline hover:text-wbk-green"
                  >
                    Terms & Conditions
                  </Link>{" "}
                  and{" "}
                  <Link
                    href={localizedHref("/privacy")}
                    className="text-wbk-black underline hover:text-wbk-green"
                  >
                    Privacy Policy
                  </Link>
                  .
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary (5 cols) */}
            <div className="lg:col-span-5 sticky top-20 space-y-6">
              <div className="bg-[#FBF9F8] border border-wbk-lightgrey p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-wbk-lightgrey">
                  <h2 className="font-new-york text-xl text-wbk-black">
                    {t("checkout.yourOrder", "Your Order")}
                  </h2>
                  <span className="text-xs text-wbk-brown font-poppins">
                    {items.length} {items.length === 1 ? "item" : "items"}
                  </span>
                </div>

                {/* Items List Preview */}
                <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative w-14 h-14 bg-white border border-wbk-lightgrey shrink-0 overflow-hidden">
                        <Image
                          src={item.image || "/sofa1.webp"}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                        <span className="absolute top-0 right-0 bg-wbk-black text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-wbk-black truncate">
                          {item.title}
                        </h4>
                        <span className="text-[11px] text-wbk-brown block truncate">
                          {item.options?.size
                            ? formatSizeLabel(item.options.size, locale)
                            : ""}{" "}
                          {item.options?.orientation &&
                            `(${item.options.orientation})`}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-wbk-black font-poppins">
                        {formatPrice(
                          Number(item.price || 0) * Number(item.quantity || 1),
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Breakdown */}
                <div className="space-y-2.5 pt-4 border-t border-wbk-lightgrey text-xs text-wbk-brown font-poppins">
                  <div className="flex items-center justify-between">
                    <span>{t("checkout.subtotal", "Items Subtotal")}</span>
                    <span className="font-semibold text-wbk-black">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex items-center justify-between text-wbk-green font-medium">
                      <span>
                        {t("checkout.discount", "Promo Discount")} (
                        {activePromoDetails?.code})
                      </span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span>{t("checkout.shipping", "Delivery Option")}</span>
                    <span className="font-semibold text-wbk-black">
                      {shipping === 0
                        ? t("cart.shippingFree", "Free Delivery")
                        : `${formatPrice(shipping)} (${selectedDeliveryDetails?.label})`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-wbk-brown/80 pt-1">
                    <span>Includes 20% UK VAT</span>
                    <span>{formatPrice(vatIncluded)}</span>
                  </div>
                </div>

                {/* Total */}
                <div className="pt-4 border-t border-wbk-lightgrey flex items-baseline justify-between">
                  <span className="text-sm font-semibold uppercase tracking-wider text-wbk-black">
                    {t("checkout.total", "Total Due")}
                  </span>
                  <span className="font-bold text-2xl text-wbk-black font-poppins">
                    {formatPrice(finalTotal)}
                  </span>
                </div>
              </div>

              {/* Guarantees Box */}
              <div className="p-6 bg-white border border-wbk-lightgrey space-y-3 text-xs text-wbk-brown">
                <div className="flex items-center gap-2.5">
                  <IconShieldCheck
                    size={18}
                    className="text-wbk-gold shrink-0"
                  />
                  <span className="text-wbk-black font-medium">
                    {t("product.warrantyInfo", "Lifetime Mechanism Guarantee")}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <IconTruck size={18} className="text-wbk-green shrink-0" />
                  <span className="text-wbk-black font-medium">
                    {t(
                      "checkout.guaranteeDispatch",
                      "Precision Packed & Insured Dispatch",
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <IconLock size={16} className="text-wbk-black shrink-0" />
                  <span className="text-wbk-black font-medium">
                    {t(
                      "checkout.guaranteeSecure",
                      "Safe 256-Bit Encrypted Checkout",
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Container>
    </div>
  );
}
