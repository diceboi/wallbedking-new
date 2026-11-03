"use client";

import { useState, useEffect } from "react";
import posthog from "posthog-js";

/**
 * PostHog Feature Flag Hook for Desktop Menu A/B Test
 * Feature Flag name: "desktop-menu-ab-test"
 * Variants:
 *  - 'control': Default / standard horizontal swiper mega-menu
 *  - 'test': Split interactive hover-preview desktop menu
 *
 * Supports URL override for immediate QA/testing:
 *  - ?menu=control (or ?menu=a)  -> Variant A: Horizontal Swiper mega-menu
 *  - ?menu=test    (or ?menu=b)  -> Variant B: Split interactive hover-preview menu
 *  - ?menu=reset   (or ?menu=auto) -> Clears localStorage override & restores PostHog flag
 */
export function useDesktopMenuABTest() {
  const [variant, setVariant] = useState("control");

  useEffect(() => {
    // 1. URL and LocalStorage overrides for instant testing & QA
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const rawOverride = (
        searchParams.get("menu") ||
        searchParams.get("ab_menu") ||
        ""
      )
        .trim()
        .toLowerCase();

      if (rawOverride === "reset" || rawOverride === "auto" || rawOverride === "clear") {
        try {
          localStorage.removeItem("posthog_menu_override");
        } catch (e) {}
      } else if (
        rawOverride === "test" ||
        rawOverride === "b" ||
        rawOverride === "control" ||
        rawOverride === "a"
      ) {
        const normalized = rawOverride === "test" || rawOverride === "b" ? "test" : "control";
        setVariant(normalized);
        try {
          localStorage.setItem("posthog_menu_override", normalized);
        } catch (e) {}
        return;
      }

      try {
        const stored = localStorage.getItem("posthog_menu_override");
        if (stored === "test" || stored === "control") {
          setVariant(stored);
          return;
        }
      } catch (e) {}
    }

    // 2. PostHog Feature Flag evaluation
    const checkFlag = () => {
      try {
        if (typeof posthog !== "undefined" && typeof posthog.getFeatureFlag === "function") {
          const flag = posthog.getFeatureFlag("desktop-menu-ab-test");
          if (
            flag === "test" ||
            flag === "treatment" ||
            flag === "variant-1" ||
            flag === "variant_1" ||
            flag === "variant" ||
            flag === true ||
            (typeof flag === "string" && flag !== "control" && flag !== "off" && flag !== "false")
          ) {
            setVariant("test");
            return;
          }
        }
        setVariant("control");
      } catch (e) {
        setVariant("control");
      }
    };

    checkFlag();

    let unsubscribe;
    if (typeof posthog !== "undefined" && typeof posthog.onFeatureFlags === "function") {
      unsubscribe = posthog.onFeatureFlags(checkFlag);
    }

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  return variant;
}
