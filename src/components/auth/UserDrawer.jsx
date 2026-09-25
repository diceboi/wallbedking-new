"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  IconX,
  IconUser,
  IconMail,
  IconLock,
  IconArrowRight,
  IconLogout,
  IconPackage,
  IconCube,
  IconMapPin,
  IconSettings,
  IconCheck,
  IconAlertCircle,
  IconLoader2,
  IconShieldCheck,
  IconShieldLock,
  IconBell,
  IconArrowLeft,
  IconTrash,
  IconClock,
  IconExternalLink,
} from "@tabler/icons-react";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";

export function UserDrawer() {
  const { t, localizedHref } = useLocale();
  const {
    user,
    role,
    isAdmin,
    isUserDrawerOpen,
    closeUserDrawer,
    drawerTab,
    setDrawerTab,
    signInWithPassword,
    signUpWithPassword,
    signOut,
    resetPassword,
  } = useAuth();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Waitlist sub-view states
  const [subView, setSubView] = useState("main"); // "main" | "waitlist"
  const [waitlistItems, setWaitlistItems] = useState([]);
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const fetchWaitlist = useCallback(async () => {
    if (!user?.email) return;
    setWaitlistLoading(true);
    try {
      const res = await fetch(
        `/api/waitlist?email=${encodeURIComponent(user.email)}${
          user?.id ? `&user_id=${encodeURIComponent(user.id)}` : ""
        }`
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setWaitlistItems(data.items);
      }
    } catch (err) {
      console.error("[UserDrawer] Failed to fetch waitlist:", err);
    } finally {
      setWaitlistLoading(false);
    }
  }, [user?.email, user?.id]);

  useEffect(() => {
    if (isUserDrawerOpen && user?.email) {
      fetchWaitlist();
    }
  }, [isUserDrawerOpen, user?.email, fetchWaitlist]);

  // Reset to main view whenever drawer is closed
  useEffect(() => {
    if (!isUserDrawerOpen) {
      setSubView("main");
    }
  }, [isUserDrawerOpen]);

  const handleRemoveWaitlistItem = async (id) => {
    setRemovingId(id);
    try {
      const res = await fetch(`/api/waitlist?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setWaitlistItems((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete waitlist item:", err);
    } finally {
      setRemovingId(null);
    }
  };

  // Lock body scroll when open
  useEffect(() => {
    if (isUserDrawerOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isUserDrawerOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isUserDrawerOpen) {
        closeUserDrawer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isUserDrawerOpen, closeUserDrawer]);

  // Reset errors when switching tabs
  const handleTabChange = (tab) => {
    setErrorMsg("");
    setSuccessMsg("");
    setDrawerTab(tab);
  };

  // Sign In Handler
  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email.trim() || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      await signInWithPassword(email, password);
      setSuccessMsg("Signed in successfully!");
      setTimeout(() => {
        setSuccessMsg("");
      }, 1500);
    } catch (err) {
      console.error("[UserDrawer] Login error:", err);
      setErrorMsg(err.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Up Handler
  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email.trim() || !password) {
      setErrorMsg("Please enter email and password.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const data = await signUpWithPassword(email, password, fullName);
      if (data?.user && !data.session) {
        // Confirmation email required
        setSuccessMsg("Account created! Please check your email inbox to verify your account.");
      } else {
        setSuccessMsg("Account created successfully!");
      }
    } catch (err) {
      console.error("[UserDrawer] Signup error:", err);
      setErrorMsg(err.message || "Could not create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password Handler
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email.trim()) {
      setErrorMsg("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(email);
      setSuccessMsg("Password reset link has been sent to your email.");
    } catch (err) {
      console.error("[UserDrawer] Reset error:", err);
      setErrorMsg(err.message || "Could not send reset email. Please check the address.");
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Demo Login helper (convenience for evaluation)
  const handleDemoSignIn = async () => {
    setEmail("customer@wallbedking.com");
    setPassword("WallBedKing2026!");
    setErrorMsg("");
    setIsLoading(true);
    try {
      await signInWithPassword("customer@wallbedking.com", "WallBedKing2026!");
      setSuccessMsg("Signed in as Demo User!");
    } catch (err) {
      // If user doesn't exist, try creating it automatically
      try {
        await signUpWithPassword("customer@wallbedking.com", "WallBedKing2026!", "James Harrington");
        await signInWithPassword("customer@wallbedking.com", "WallBedKing2026!");
        setSuccessMsg("Demo account ready & signed in!");
      } catch (signupErr) {
        setErrorMsg(signupErr.message || "Demo login failed.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const userDisplayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Valued Customer";

  const userInitial = (userDisplayName[0] || "U").toUpperCase();

  return (
    <AnimatePresence>
      {isUserDrawerOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Dimmed backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeUserDrawer}
            className="fixed inset-0 bg-wbk-black/60 backdrop-blur-xs cursor-pointer"
            aria-hidden="true"
          />

          {/* Slide-over panel */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative z-10 w-full max-w-[340px] sm:max-w-[380px] md:max-w-md bg-wbk-white h-full shadow-2xl flex flex-col font-poppins"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-wbk-lightgrey">
              {subView === "waitlist" ? (
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSubView("main")}
                    className="w-8 h-8 rounded-full bg-[#F4F2F0] hover:bg-wbk-black hover:text-white border border-wbk-lightgrey flex items-center justify-center text-wbk-black transition-colors cursor-pointer"
                    title="Back to account menu"
                  >
                    <IconArrowLeft size={16} />
                  </button>
                  <div>
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-wbk-black flex items-center gap-2">
                      <span>{t("waitlist.myWaitlist", "My Waitlist")}</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-wbk-gold/20 text-wbk-black border border-wbk-gold/30 text-[10px] font-mono font-bold">
                        {waitlistItems.length}
                      </span>
                    </h2>
                    <p className="text-[10px] text-wbk-brown tracking-wide">
                      {t("waitlist.myWaitlistSub", "Stock alerts & saved items")}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#F4F2F0] border border-wbk-lightgrey/80 flex items-center justify-center text-wbk-black">
                    <IconUser size={18} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-wbk-black">
                      {user ? t("auth.customerAccount", "My Account") : t("auth.welcomeBack", "Welcome")}
                    </h2>
                    <p className="text-[10px] text-wbk-brown tracking-wide">
                      {user ? "WallBedKing Member" : t("auth.signIn", "Sign in or create an account")}
                    </p>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={closeUserDrawer}
                className="w-8 h-8 flex items-center justify-center border border-wbk-lightgrey bg-white text-wbk-black hover:bg-wbk-black hover:text-white transition-colors cursor-pointer"
                aria-label="Close user menu"
              >
                <IconX size={16} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
              {user ? (
                /* ── Authenticated User State ── */
                subView === "waitlist" ? (
                  /* ── Sub-view: My Waitlist & Stock Alerts ── */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-wbk-lightgrey/60">
                      <div className="text-xs font-semibold uppercase tracking-wider text-wbk-black">
                        {t("waitlist.trackedProducts", "Tracked Products & Stock Alerts")}
                      </div>
                      <div className="text-[11px] text-wbk-brown font-mono">
                        {waitlistItems.length} {waitlistItems.length === 1 ? t("waitlist.item", "item") : t("waitlist.items", "items")}
                      </div>
                    </div>

                    {waitlistLoading ? (
                      <div className="py-12 flex flex-col items-center justify-center text-wbk-brown gap-2.5">
                        <IconLoader2 size={24} className="animate-spin text-wbk-gold" />
                        <span className="text-xs font-medium">{t("waitlist.submitting", "Checking inventory & waitlist...")}</span>
                      </div>
                    ) : waitlistItems.length === 0 ? (
                      <div className="py-10 px-4 text-center border border-dashed border-wbk-lightgrey bg-[#FBF9F8] rounded-xl flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-wbk-gold/15 text-wbk-gold border border-wbk-gold/30 flex items-center justify-center mb-3">
                          <IconBell size={22} className="text-wbk-gold" />
                        </div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-wbk-black mb-1">
                          {t("waitlist.emptyTitle", "Your Waitlist is Empty")}
                        </h3>
                        <p className="text-[11px] text-wbk-brown leading-relaxed max-w-[260px] mb-4">
                          {t("waitlist.emptyDesc", "When an item or size is out of stock, join its waitlist to receive instant email notifications the moment inventory arrives.")}
                        </p>
                        <Link
                          href={localizedHref("/products")}
                          onClick={closeUserDrawer}
                          className="px-5 py-2.5 bg-wbk-gold hover:bg-wbk-black text-wbk-black hover:text-white border border-wbk-gold hover:border-wbk-black text-[11px] font-medium uppercase tracking-wider rounded-full transition-all shadow-sm"
                        >
                          {t("waitlist.exploreProducts", "Explore Products")}
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {waitlistItems.map((item) => {
                          const itemHref = item.product_slug
                            ? localizedHref(`/products/beds/${item.product_slug}${item.options?.size ? `?size=${encodeURIComponent(item.options.size)}` : ""}`)
                            : localizedHref("/products");
                          return (
                            <div
                              key={item.id}
                              className="p-3 bg-white border border-wbk-lightgrey/80 hover:border-wbk-gold/60 transition-all flex flex-col gap-2.5 shadow-2xs"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-16 h-16 rounded-none bg-[#F4F2F0] border border-wbk-lightgrey/60 overflow-hidden shrink-0 flex items-center justify-center">
                                  <img
                                    src={item.product_image || "/sofa1.webp"}
                                    alt={item.product_name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-xs font-semibold text-wbk-black truncate leading-tight">
                                    {item.product_name}
                                  </h4>
                                  <div className="text-[11px] text-wbk-brown truncate mt-0.5">
                                    {item.variant_name || item.options?.size || "Standard Size"}
                                  </div>
                                  <div className="mt-1.5 flex items-center gap-1.5">
                                    {item.is_in_stock ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-wbk-gold/15 border border-wbk-gold/40 text-wbk-black text-[10px] font-semibold">
                                        <span className="w-1.5 h-1.5 rounded-full bg-wbk-gold animate-pulse" />
                                        {t("waitlist.backInStock", "Back in Stock!")}
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F4F2F0] border border-wbk-lightgrey/80 text-wbk-brown text-[10px] font-medium">
                                        <IconClock size={11} className="text-wbk-gold" />
                                        {t("waitlist.waitingForRestock", "Waiting for Restock")}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveWaitlistItem(item.id)}
                                  disabled={removingId === item.id}
                                  className="p-1 text-wbk-brown/60 hover:text-red-600 transition-colors cursor-pointer shrink-0"
                                  title="Remove from waitlist"
                                >
                                  {removingId === item.id ? (
                                    <IconLoader2 size={15} className="animate-spin text-red-500" />
                                  ) : (
                                    <IconTrash size={15} />
                                  )}
                                </button>
                              </div>

                              {item.is_in_stock && (
                                <div className="pt-2 border-t border-wbk-lightgrey/40 flex items-center justify-between">
                                  <span className="text-[10px] text-wbk-black font-medium">
                                    {t("waitlist.readyToDispatch", "Ready to order & dispatch")}
                                  </span>
                                  <Link
                                    href={itemHref}
                                    onClick={closeUserDrawer}
                                    className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-wbk-gold hover:bg-wbk-black text-wbk-black hover:text-white border border-wbk-gold hover:border-wbk-black text-[10px] font-semibold uppercase tracking-wider rounded-full transition-all shadow-xs"
                                  >
                                    <span>{t("waitlist.orderNow", "Order Now")}</span>
                                    <IconArrowRight size={11} />
                                  </Link>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="pt-2 space-y-2">
                      <Link
                        href={localizedHref("/account?tab=waitlist")}
                        onClick={closeUserDrawer}
                        className="w-full py-2.5 bg-[#F4F2F0] hover:bg-wbk-gold hover:text-wbk-black text-xs font-semibold uppercase tracking-wider text-wbk-black transition-colors rounded-full text-center flex items-center justify-center gap-1.5"
                      >
                        <IconExternalLink size={14} />
                        <span>Manage in Account Dashboard</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => setSubView("main")}
                        className="w-full py-2.5 border border-wbk-lightgrey text-xs font-semibold uppercase tracking-wider text-wbk-black hover:bg-wbk-gold/10 hover:border-wbk-gold transition-colors rounded-full cursor-pointer text-center"
                      >
                        {t("waitlist.backToProfile", "Back to Profile Menu")}
                      </button>
                    </div>
                  </div>
                ) : (
                /* ── Main View: Authenticated User ── */
                <div className="space-y-6">
                  {/* User Profile Card */}
                  <div className="p-4 bg-[#FBF9F8] border border-wbk-lightgrey/80 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-wbk-black text-wbk-white font-new-york text-lg flex items-center justify-center shrink-0 shadow-xs">
                      {userInitial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-wbk-black truncate flex items-center gap-2">
                        <span className="truncate">{userDisplayName}</span>
                        {isAdmin && (
                          <span className="px-2 py-0.5 rounded-full bg-wbk-black text-wbk-gold border border-wbk-gold/40 text-[9px] font-bold uppercase tracking-wider font-mono shrink-0">
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-wbk-brown truncate">
                        {user.email}
                      </div>
                      <div className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-medium mt-1">
                        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isAdmin ? "bg-wbk-gold" : "bg-wbk-green"}`} />
                        <span className={isAdmin ? "text-wbk-black font-semibold" : "text-wbk-green"}>
                          {isAdmin ? "Administrator Privileges" : "Verified Account"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="divide-y divide-wbk-lightgrey/60 border border-wbk-lightgrey/80 bg-wbk-white">
                    {/* Dedicated Admin Console item if user has admin privileges */}
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={closeUserDrawer}
                        className="flex items-center justify-between p-3.5 bg-[#090A0A] text-white hover:bg-wbk-gold hover:text-wbk-black transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-none bg-white/10 text-wbk-gold group-hover:bg-wbk-black group-hover:text-white flex items-center justify-center transition-colors">
                            <IconShieldLock size={17} strokeWidth={1.5} />
                          </div>
                          <div>
                            <div className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                              <span>Admin Console</span>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            </div>
                            <div className="text-[10px] text-white/70 group-hover:text-wbk-black/80">
                              Catalog, orders, pricing & feeds
                            </div>
                          </div>
                        </div>
                        <IconArrowRight size={15} className="text-wbk-gold group-hover:text-wbk-black group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    )}

                    <Link
                      href={localizedHref("/account?tab=orders")}
                      onClick={closeUserDrawer}
                      className="flex items-center justify-between p-3.5 hover:bg-[#FBF9F8] transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-none bg-[#F4F2F0] text-wbk-black flex items-center justify-center group-hover:bg-wbk-black group-hover:text-white transition-colors">
                          <IconPackage size={17} strokeWidth={1.5} />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-wbk-black">
                            {t("auth.myOrders", "My Orders & Tracking")}
                          </div>
                          <div className="text-[10px] text-wbk-brown">
                            Track packages and view order history
                          </div>
                        </div>
                      </div>
                      <IconArrowRight size={15} className="text-wbk-brown group-hover:translate-x-0.5 transition-transform" />
                    </Link>

                    {/* Waitlist Navigation Button */}
                    <button
                      type="button"
                      onClick={() => setSubView("waitlist")}
                      className="w-full flex items-center justify-between p-3.5 hover:bg-[#FBF9F8] transition-colors group cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-none bg-[#F4F2F0] text-wbk-black flex items-center justify-center group-hover:bg-wbk-gold group-hover:text-wbk-black transition-colors">
                          <IconBell size={17} strokeWidth={1.5} />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-wbk-black flex items-center gap-2">
                            <span>{t("waitlist.myWaitlist", "My Waitlist & Alerts")}</span>
                            {waitlistItems.length > 0 && (
                              <span className="px-1.5 py-0.2 rounded-full bg-wbk-gold/20 text-wbk-black border border-wbk-gold/40 text-[10px] font-bold font-mono">
                                {waitlistItems.length}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-wbk-brown">
                            {t("waitlist.myWaitlistSub", "Stock alerts and saved notifications")}
                          </div>
                        </div>
                      </div>
                      <IconArrowRight size={15} className="text-wbk-brown group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    <Link
                      href={localizedHref("/configurator")}
                      onClick={closeUserDrawer}
                      className="flex items-center justify-between p-3.5 hover:bg-[#FBF9F8] transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-none bg-[#F4F2F0] text-wbk-black flex items-center justify-center group-hover:bg-wbk-black group-hover:text-white transition-colors">
                          <IconCube size={17} strokeWidth={1.5} />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-wbk-black">
                            {t("auth.savedConfigs", "3D Bed Configurator")}
                          </div>
                          <div className="text-[10px] text-wbk-brown">
                            Customise mechanisms and finishes
                          </div>
                        </div>
                      </div>
                      <IconArrowRight size={15} className="text-wbk-brown group-hover:translate-x-0.5 transition-transform" />
                    </Link>

                    <Link
                      href={localizedHref("/account?tab=addresses")}
                      onClick={closeUserDrawer}
                      className="flex items-center justify-between p-3.5 hover:bg-[#FBF9F8] transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-none bg-[#F4F2F0] text-wbk-black flex items-center justify-center group-hover:bg-wbk-black group-hover:text-white transition-colors">
                          <IconMapPin size={17} strokeWidth={1.5} />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-wbk-black">
                            {t("auth.deliveryAddresses", "Delivery Addresses")}
                          </div>
                          <div className="text-[10px] text-wbk-brown">
                            Manage default shipping addresses
                          </div>
                        </div>
                      </div>
                      <IconArrowRight size={15} className="text-wbk-brown group-hover:translate-x-0.5 transition-transform" />
                    </Link>

                    <Link
                      href={localizedHref("/account?tab=profile")}
                      onClick={closeUserDrawer}
                      className="flex items-center justify-between p-3.5 hover:bg-[#FBF9F8] transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-none bg-[#F4F2F0] text-wbk-black flex items-center justify-center group-hover:bg-wbk-black group-hover:text-white transition-colors">
                          <IconSettings size={17} strokeWidth={1.5} />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-wbk-black">
                            {t("auth.accountSettings", "Account & Security")}
                          </div>
                          <div className="text-[10px] text-wbk-brown">
                            Update details and password
                          </div>
                        </div>
                      </div>
                      <IconArrowRight size={15} className="text-wbk-brown group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>

                  {/* Primary Full Account & Admin Actions */}
                  <div className="space-y-2.5">
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={closeUserDrawer}
                        className="flex items-center justify-center gap-2 w-full py-3 text-center bg-[#090A0A] hover:bg-wbk-gold hover:text-wbk-black text-white text-xs font-semibold uppercase tracking-[0.14em] transition-all rounded-full shadow-md cursor-pointer"
                      >
                        <IconShieldLock size={16} className="text-wbk-gold" />
                        <span>Open Admin Dashboard</span>
                      </Link>
                    )}

                    <Link
                      href={localizedHref("/account")}
                      onClick={closeUserDrawer}
                      className="block w-full py-3 text-center bg-wbk-black text-white text-xs font-medium uppercase tracking-[0.14em] hover:bg-wbk-green transition-colors rounded-full shadow-sm cursor-pointer"
                    >
                      {t("auth.customerAccount", "View Account Dashboard")}
                    </Link>
                  </div>

                  {/* Sign Out Button */}
                  <button
                    type="button"
                    onClick={async () => {
                      await signOut();
                      closeUserDrawer();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 border border-wbk-lightgrey text-xs font-medium uppercase tracking-wider text-wbk-brown hover:text-wbk-black hover:border-wbk-black transition-colors rounded-full cursor-pointer"
                  >
                    <IconLogout size={15} />
                    <span>{t("auth.signOut", "Sign Out")}</span>
                  </button>
                </div>
                )
              ) : (
                /* ── Guest / Authentication State ── */
                <div className="space-y-5">
                  {/* Tabs */}
                  {drawerTab !== "forgot" && (
                    <div className="grid grid-cols-2 p-1 bg-[#F4F2F0] border border-wbk-lightgrey/80">
                      <button
                        type="button"
                        onClick={() => handleTabChange("login")}
                        className={`py-2 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                          drawerTab === "login"
                            ? "bg-wbk-white text-wbk-black shadow-2xs"
                            : "text-wbk-brown hover:text-wbk-black"
                        }`}
                      >
                        {t("auth.signIn", "Sign In")}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTabChange("register")}
                        className={`py-2 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                          drawerTab === "register"
                            ? "bg-wbk-white text-wbk-black shadow-2xs"
                            : "text-wbk-brown hover:text-wbk-black"
                        }`}
                      >
                        {t("auth.createAccount", "Create Account")}
                      </button>
                    </div>
                  )}

                  {/* Error & Success Messages */}
                  {errorMsg && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 rounded-none">
                      <IconAlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
                      <span>{errorMsg}</span>
                    </div>
                  )}
                  {successMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 rounded-none">
                      <IconCheck size={16} className="shrink-0 mt-0.5 text-emerald-600" />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  {/* ── Sign In Form ── */}
                  {drawerTab === "login" && (
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-wbk-black mb-1.5">
                          {t("auth.emailLabel", "Email Address")}
                        </label>
                        <div className="relative">
                          <IconMail
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-wbk-brown pointer-events-none"
                          />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            className="w-full h-10 pl-9 pr-3 text-xs bg-[#FBF9F8] border border-wbk-lightgrey text-wbk-black placeholder:text-wbk-brown/70 focus:outline-none focus:border-wbk-black transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-semibold uppercase tracking-wider text-wbk-black">
                            {t("auth.passwordLabel", "Password")}
                          </label>
                          <button
                            type="button"
                            onClick={() => handleTabChange("forgot")}
                            className="text-[11px] text-wbk-brown hover:text-wbk-black underline cursor-pointer"
                          >
                            {t("auth.forgotPassword", "Forgot password?")}
                          </button>
                        </div>
                        <div className="relative">
                          <IconLock
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-wbk-brown pointer-events-none"
                          />
                          <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full h-10 pl-9 pr-3 text-xs bg-[#FBF9F8] border border-wbk-lightgrey text-wbk-black placeholder:text-wbk-brown/70 focus:outline-none focus:border-wbk-black transition-colors"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-wbk-black text-white text-xs font-medium uppercase tracking-[0.14em] hover:bg-wbk-green transition-colors disabled:opacity-60 flex items-center justify-center gap-2 rounded-full cursor-pointer shadow-sm mt-2"
                      >
                        {isLoading ? (
                          <>
                            <IconLoader2 size={16} className="animate-spin" />
                            <span>Signing In...</span>
                          </>
                        ) : (
                          <span>{t("auth.signInBtn", "Sign In")}</span>
                        )}
                      </button>

                      {/* Demo User Shortcut */}
                      <div className="pt-2 border-t border-wbk-lightgrey/60">
                        <button
                          type="button"
                          onClick={handleDemoSignIn}
                          disabled={isLoading}
                          className="w-full py-2 bg-[#F4F2F0] hover:bg-[#E4E0DE] text-wbk-black text-[11px] font-medium tracking-wide transition-colors rounded-full cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>Fill Demo Account (Instant Test)</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* ── Register Form ── */}
                  {drawerTab === "register" && (
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-wbk-black mb-1.5">
                          {t("auth.fullNameLabel", "Full Name")}
                        </label>
                        <div className="relative">
                          <IconUser
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-wbk-brown pointer-events-none"
                          />
                          <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full h-10 pl-9 pr-3 text-xs bg-[#FBF9F8] border border-wbk-lightgrey text-wbk-black placeholder:text-wbk-brown/70 focus:outline-none focus:border-wbk-black transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-wbk-black mb-1.5">
                          {t("auth.emailLabel", "Email Address")}
                        </label>
                        <div className="relative">
                          <IconMail
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-wbk-brown pointer-events-none"
                          />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            className="w-full h-10 pl-9 pr-3 text-xs bg-[#FBF9F8] border border-wbk-lightgrey text-wbk-black placeholder:text-wbk-brown/70 focus:outline-none focus:border-wbk-black transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-wbk-black mb-1.5">
                          {t("auth.passwordLabel", "Password")}
                        </label>
                        <div className="relative">
                          <IconLock
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-wbk-brown pointer-events-none"
                          />
                          <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full h-10 pl-9 pr-3 text-xs bg-[#FBF9F8] border border-wbk-lightgrey text-wbk-black placeholder:text-wbk-brown/70 focus:outline-none focus:border-wbk-black transition-colors"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-wbk-black text-white text-xs font-medium uppercase tracking-[0.14em] hover:bg-wbk-green transition-colors disabled:opacity-60 flex items-center justify-center gap-2 rounded-full cursor-pointer shadow-sm mt-2"
                      >
                        {isLoading ? (
                          <>
                            <IconLoader2 size={16} className="animate-spin" />
                            <span>Creating Account...</span>
                          </>
                        ) : (
                          <span>{t("auth.createAccountBtn", "Create Account")}</span>
                        )}
                      </button>

                      <p className="text-[10px] text-wbk-brown text-center leading-relaxed">
                        By creating an account, you agree to WallBedKing&apos;s Terms of Service and Privacy Policy.
                      </p>
                    </form>
                  )}

                  {/* ── Forgot Password Form ── */}
                  {drawerTab === "forgot" && (
                    <div className="space-y-4">
                      {successMsg ? (
                        <div className="space-y-4 py-2">
                          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2">
                            <div className="flex items-center gap-2 font-semibold">
                              <IconCheck size={18} className="text-emerald-600 shrink-0" />
                              <span>Reset Link Dispatched</span>
                            </div>
                            <p className="text-[11px] text-emerald-800 leading-relaxed">
                              We&apos;ve sent a password reset link to <strong className="font-semibold">{email}</strong>. Please check your inbox (and spam folder) and click the link to set a new password.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setSuccessMsg("");
                              handleTabChange("login");
                            }}
                            className="w-full py-3 bg-wbk-black text-white text-xs font-medium uppercase tracking-[0.14em] hover:bg-wbk-green transition-colors rounded-full cursor-pointer shadow-sm text-center block"
                          >
                            {t("auth.signIn", "Return to Sign In")}
                          </button>

                          <button
                            type="button"
                            onClick={() => setSuccessMsg("")}
                            className="w-full text-center text-[11px] text-wbk-brown hover:text-wbk-black underline cursor-pointer"
                          >
                            Didn&apos;t receive the email? Try again
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleForgotPassword} className="space-y-4">
                          <div className="text-xs text-wbk-brown leading-relaxed">
                            Enter the email associated with your account and we&apos;ll send you a password reset link to create a new password.
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold uppercase tracking-wider text-wbk-black mb-1.5">
                              {t("auth.emailLabel", "Email Address")}
                            </label>
                            <div className="relative">
                              <IconMail
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-wbk-brown pointer-events-none"
                              />
                              <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full h-10 pl-9 pr-3 text-xs bg-[#FBF9F8] border border-wbk-lightgrey text-wbk-black placeholder:text-wbk-brown/70 focus:outline-none focus:border-wbk-black transition-colors"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-wbk-black text-white text-xs font-medium uppercase tracking-[0.14em] hover:bg-wbk-green transition-colors disabled:opacity-60 flex items-center justify-center gap-2 rounded-full cursor-pointer shadow-sm"
                          >
                            {isLoading ? (
                              <>
                                <IconLoader2 size={16} className="animate-spin" />
                                <span>Sending Link...</span>
                              </>
                            ) : (
                              <span>{t("auth.resetPasswordBtn", "Send Reset Link")}</span>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleTabChange("login")}
                            className="w-full text-center text-xs text-wbk-brown hover:text-wbk-black underline cursor-pointer pt-2 block"
                          >
                            {t("auth.signIn", "Return to Sign In")}
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Assurances */}
            <div className="px-6 py-3 bg-[#F4F2F0] border-t border-wbk-lightgrey/80 flex items-center justify-center gap-2 text-[10px] text-wbk-brown">
              <IconShieldCheck size={14} className="text-wbk-gold" />
              <span>Secure authentication powered by Supabase</span>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
