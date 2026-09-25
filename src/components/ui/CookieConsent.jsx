"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { IconCookie, IconX, IconCheck, IconSettings } from "@tabler/icons-react";

const COOKIE_CONSENT_KEY = "wbk_cookie_consent_v1";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: true,
    marketing: false,
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!stored) {
        // Delay showing slightly for smoother UX
        const timer = setTimeout(() => setIsVisible(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // LocalStorage access restricted
    }
  }, []);

  const handleAcceptAll = () => {
    const consent = { necessary: true, analytics: true, marketing: true, timestamp: Date.now() };
    saveConsent(consent);
  };

  const handleRejectNonEssential = () => {
    const consent = { necessary: true, analytics: false, marketing: false, timestamp: Date.now() };
    saveConsent(consent);
  };

  const handleSavePreferences = () => {
    const consent = { ...preferences, necessary: true, timestamp: Date.now() };
    saveConsent(consent);
  };

  const saveConsent = (consent) => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
    } catch (e) {
      console.warn("Could not store cookie consent", e);
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Cookie consent banner"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 bg-white/95 backdrop-blur-md border-t border-wbk-lightgrey shadow-2xl transition-all duration-300 font-poppins text-wbk-black animate-in fade-in slide-in-from-bottom-4"
    >
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
        <div className="flex items-start gap-3.5 max-w-3xl">
          <div className="w-9 h-9 rounded-full bg-wbk-gold/15 text-wbk-gold flex items-center justify-center shrink-0 mt-0.5">
            <IconCookie size={20} />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-wbk-black">
              We value your privacy
            </h3>
            <p className="text-xs text-wbk-brown leading-relaxed">
              Wall Bed King uses cookies to ensure our precision bed configurator, shopping cart, and secure checkout work seamlessly, and to analyse site traffic in compliance with UK & EU GDPR. You can accept all or customize your preferences.{" "}
              <Link href="/privacy" className="underline hover:text-wbk-green transition-colors">
                Read Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0 justify-end">
          <button
            type="button"
            onClick={() => setShowPreferences((p) => !p)}
            className="px-3.5 py-2 text-xs font-medium border border-wbk-lightgrey text-wbk-brown hover:text-wbk-black hover:border-wbk-black transition-colors flex items-center gap-1.5"
          >
            <IconSettings size={14} />
            <span>Preferences</span>
          </button>

          <button
            type="button"
            onClick={handleRejectNonEssential}
            className="px-4 py-2 text-xs font-medium border border-wbk-lightgrey bg-white text-wbk-black hover:border-wbk-black transition-colors"
          >
            Reject Non-Essential
          </button>

          <button
            type="button"
            onClick={handleAcceptAll}
            className="px-5 py-2 text-xs font-semibold uppercase tracking-wider bg-wbk-black text-white hover:bg-wbk-green hover:text-wbk-black transition-colors shadow-xs"
          >
            Accept All Cookies
          </button>
        </div>
      </div>

      {/* Preferences Drawer / Modal Details */}
      {showPreferences && (
        <div className="max-w-6xl mx-auto mt-4 pt-4 border-t border-wbk-lightgrey/60 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <label className="flex items-start gap-2.5 p-2 bg-[#FBF9F8] border border-wbk-lightgrey/60">
            <input type="checkbox" checked disabled className="mt-0.5 accent-wbk-black" />
            <div>
              <span className="font-semibold block text-wbk-black">Necessary (Always Active)</span>
              <span className="text-[11px] text-wbk-brown">Cart, session security, and language settings.</span>
            </div>
          </label>

          <label className="flex items-start gap-2.5 p-2 bg-white border border-wbk-lightgrey/60 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.analytics}
              onChange={(e) => setPreferences((p) => ({ ...p, analytics: e.target.checked }))}
              className="mt-0.5 accent-wbk-black"
            />
            <div>
              <span className="font-semibold block text-wbk-black">Analytics & Performance</span>
              <span className="text-[11px] text-wbk-brown">Helps us understand how customers navigate our site.</span>
            </div>
          </label>

          <div className="flex items-center justify-end sm:col-span-3 pt-2">
            <button
              type="button"
              onClick={handleSavePreferences}
              className="px-5 py-2 text-xs font-semibold bg-wbk-black text-white hover:bg-wbk-green hover:text-wbk-black transition-colors"
            >
              Save My Preferences
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
