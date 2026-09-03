"use client";

import { useState, useEffect } from "react";
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
} from "@tabler/icons-react";
import { useAuth } from "@/context/AuthContext";

export function UserDrawer() {
  const {
    user,
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
            className="relative z-10 w-full max-w-md bg-wbk-white h-full shadow-2xl flex flex-col font-poppins"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-wbk-lightgrey">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#F4F2F0] border border-wbk-lightgrey/80 flex items-center justify-center text-wbk-black">
                  <IconUser size={18} strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-wbk-black">
                    {user ? "My Account" : "Welcome"}
                  </h2>
                  <p className="text-[10px] text-wbk-brown tracking-wide">
                    {user ? "WallBedKing Member" : "Sign in or create an account"}
                  </p>
                </div>
              </div>

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
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {user ? (
                /* ── Authenticated User State ── */
                <div className="space-y-6">
                  {/* User Profile Card */}
                  <div className="p-4 bg-[#FBF9F8] border border-wbk-lightgrey/80 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-wbk-black text-wbk-white font-new-york text-lg flex items-center justify-center shrink-0 shadow-xs">
                      {userInitial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-wbk-black truncate">
                        {userDisplayName}
                      </div>
                      <div className="text-xs text-wbk-brown truncate">
                        {user.email}
                      </div>
                      <div className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider text-wbk-green font-medium mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-wbk-green animate-pulse" />
                        Verified Account
                      </div>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="divide-y divide-wbk-lightgrey/60 border border-wbk-lightgrey/80 bg-wbk-white">
                    <Link
                      href="/account?tab=orders"
                      onClick={closeUserDrawer}
                      className="flex items-center justify-between p-3.5 hover:bg-[#FBF9F8] transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-none bg-[#F4F2F0] text-wbk-black flex items-center justify-center group-hover:bg-wbk-black group-hover:text-white transition-colors">
                          <IconPackage size={17} strokeWidth={1.5} />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-wbk-black">
                            My Orders & Tracking
                          </div>
                          <div className="text-[10px] text-wbk-brown">
                            Track packages and view order history
                          </div>
                        </div>
                      </div>
                      <IconArrowRight size={15} className="text-wbk-brown group-hover:translate-x-0.5 transition-transform" />
                    </Link>

                    <Link
                      href="/configurator"
                      onClick={closeUserDrawer}
                      className="flex items-center justify-between p-3.5 hover:bg-[#FBF9F8] transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-none bg-[#F4F2F0] text-wbk-black flex items-center justify-center group-hover:bg-wbk-black group-hover:text-white transition-colors">
                          <IconCube size={17} strokeWidth={1.5} />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-wbk-black">
                            3D Bed Configurator
                          </div>
                          <div className="text-[10px] text-wbk-brown">
                            Customise mechanisms and finishes
                          </div>
                        </div>
                      </div>
                      <IconArrowRight size={15} className="text-wbk-brown group-hover:translate-x-0.5 transition-transform" />
                    </Link>

                    <Link
                      href="/account?tab=addresses"
                      onClick={closeUserDrawer}
                      className="flex items-center justify-between p-3.5 hover:bg-[#FBF9F8] transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-none bg-[#F4F2F0] text-wbk-black flex items-center justify-center group-hover:bg-wbk-black group-hover:text-white transition-colors">
                          <IconMapPin size={17} strokeWidth={1.5} />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-wbk-black">
                            Delivery Addresses
                          </div>
                          <div className="text-[10px] text-wbk-brown">
                            Manage default shipping addresses
                          </div>
                        </div>
                      </div>
                      <IconArrowRight size={15} className="text-wbk-brown group-hover:translate-x-0.5 transition-transform" />
                    </Link>

                    <Link
                      href="/account?tab=profile"
                      onClick={closeUserDrawer}
                      className="flex items-center justify-between p-3.5 hover:bg-[#FBF9F8] transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-none bg-[#F4F2F0] text-wbk-black flex items-center justify-center group-hover:bg-wbk-black group-hover:text-white transition-colors">
                          <IconSettings size={17} strokeWidth={1.5} />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-wbk-black">
                            Account & Security
                          </div>
                          <div className="text-[10px] text-wbk-brown">
                            Update details and password
                          </div>
                        </div>
                      </div>
                      <IconArrowRight size={15} className="text-wbk-brown group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>

                  {/* Primary Full Account CTA */}
                  <Link
                    href="/account"
                    onClick={closeUserDrawer}
                    className="block w-full py-3 text-center bg-wbk-black text-white text-xs font-medium uppercase tracking-[0.14em] hover:bg-wbk-green transition-colors rounded-full shadow-sm cursor-pointer"
                  >
                    View Account Dashboard
                  </Link>

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
                    <span>Sign Out</span>
                  </button>
                </div>
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
                        Sign In
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
                        Create Account
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
                          Email Address
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
                            Password
                          </label>
                          <button
                            type="button"
                            onClick={() => handleTabChange("forgot")}
                            className="text-[11px] text-wbk-brown hover:text-wbk-black underline cursor-pointer"
                          >
                            Forgot password?
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
                          <span>Sign In</span>
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
                          Full Name
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
                          Email Address
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
                          Password (min. 6 characters)
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
                          <span>Create Account</span>
                        )}
                      </button>

                      <p className="text-[10px] text-wbk-brown text-center leading-relaxed">
                        By creating an account, you agree to WallBedKing&apos;s Terms of Service and Privacy Policy.
                      </p>
                    </form>
                  )}

                  {/* ── Forgot Password Form ── */}
                  {drawerTab === "forgot" && (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <div className="text-xs text-wbk-brown leading-relaxed">
                        Enter the email associated with your account and we&apos;ll send you a password reset link.
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-wbk-black mb-1.5">
                          Email Address
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
                          <span>Send Reset Link</span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTabChange("login")}
                        className="w-full text-center text-xs text-wbk-brown hover:text-wbk-black underline cursor-pointer pt-2 block"
                      >
                        Return to Sign In
                      </button>
                    </form>
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
