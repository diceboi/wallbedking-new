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
 *  - ?menu=test
 *  - ?menu=control
 */
export function useDesktopMenuABTest() {
  const [variant, setVariant] = useState("control");

  useEffect(() => {
    // 1. URL and LocalStorage overrides for instant testing & QA
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const urlOverride = searchParams.get("menu") || searchParams.get("ab_menu");
      if (urlOverride === "test" || urlOverride === "control") {
        setVariant(urlOverride);
        try {
          localStorage.setItem("posthog_menu_override", urlOverride);
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
          if (flag === "test") {
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
