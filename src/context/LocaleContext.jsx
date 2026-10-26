"use client";

import { createContext, useContext, useMemo, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LOCALES,
  DEFAULT_LOCALE,
  MARKETS,
  normalizeLocale,
  formatPrice as formatPriceUtil,
  localizedHref as localizedHrefUtil,
} from "@/lib/i18n";
import { mapUrlToLocale } from "@/data/slugs";

import enDict from "@/data/dictionaries/en.json";
import usDict from "@/data/dictionaries/us.json";
import deDict from "@/data/dictionaries/de.json";
import frDict from "@/data/dictionaries/fr.json";
import esDict from "@/data/dictionaries/es.json";
import porDict from "@/data/dictionaries/por.json";
import itDict from "@/data/dictionaries/it.json";

const DICTIONARIES = {
  en: enDict,
  us: usDict,
  de: deDict,
  fr: frDict,
  es: esDict,
  por: porDict,
  it: itDict,
};

const LocaleContext = createContext(null);

export function LocaleProvider({ children, initialLocale = DEFAULT_LOCALE }) {
  const pathname = usePathname() || "";
  const router = useRouter();

  // Extract locale from the current URL path (e.g. /de/... -> 'de')
  const currentLocale = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const firstSegment = segments[0]?.toLowerCase();
    if (firstSegment === "pt") return "por";
    if (LOCALES.includes(firstSegment)) return firstSegment;
    return normalizeLocale(initialLocale);
  }, [pathname, initialLocale]);

  const currentMarket = useMemo(() => {
    return MARKETS[currentLocale] || MARKETS.en;
  }, [currentLocale]);

  const dictionary = useMemo(() => {
    return DICTIONARIES[currentLocale] || DICTIONARIES.en;
  }, [currentLocale]);

  // Translation helper: t('nav.beds', 'Murphy Beds')
  const t = useCallback(
    (keyPath, fallback = "") => {
      if (!keyPath) return fallback;
      const parts = keyPath.split(".");
      let val = dictionary;
      for (const part of parts) {
        if (val && typeof val === "object" && part in val) {
          val = val[part];
        } else {
          val = undefined;
          break;
        }
      }
      return typeof val === "string" ? val : fallback || keyPath;
    },
    [dictionary]
  );

  // Switch locale while preserving the remaining path
  const switchLocale = useCallback(
    (targetLocale) => {
      const normTarget = normalizeLocale(targetLocale);
      const isTargetUk = normTarget === "en";

      if (typeof window !== "undefined") {
        const isCurrentHostUk = window.location.hostname.includes("wallbedking.co.uk");
        const isDevOrPreview =
          window.location.hostname.includes("localhost") ||
          window.location.hostname.includes("127.0.0.1") ||
          window.location.hostname.includes("vercel.app");

        const newPath = mapUrlToLocale(pathname, normTarget);

        // Set cookie for persistence (1 year)
        document.cookie = `NEXT_LOCALE=${normTarget}; path=/; max-age=31536000; SameSite=Lax`;

        // 1. Switching to UK while on .com -> Cross-domain redirect to wallbedking.co.uk
        if (isTargetUk && !isCurrentHostUk && !isDevOrPreview) {
          window.location.href = `https://wallbedking.co.uk${newPath}`;
          return;
        }

        // 2. Switching to non-UK while on .co.uk -> Cross-domain redirect to wallbedking.com
        if (!isTargetUk && isCurrentHostUk && !isDevOrPreview) {
          window.location.href = `https://www.wallbedking.com${newPath}`;
          return;
        }

        if (normTarget === currentLocale) return;

        router.push(newPath);
      }
    },
    [currentLocale, pathname, router]
  );

  const formatPrice = useCallback(
    (amount) => {
      return formatPriceUtil(amount, currentLocale);
    },
    [currentLocale]
  );

  const value = useMemo(
    () => ({
      locale: currentLocale,
      market: currentMarket,
      locales: LOCALES,
      markets: MARKETS,
      t,
      switchLocale,
      formatPrice,
      localizedHref: (path) => mapUrlToLocale(path, currentLocale),
    }),
    [currentLocale, currentMarket, t, switchLocale, formatPrice]
  );

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    // Fallback safe context if called outside provider
    const norm = DEFAULT_LOCALE;
    return {
      locale: norm,
      market: MARKETS[norm],
      locales: LOCALES,
      markets: MARKETS,
      t: (_, fallback = "") => fallback,
      switchLocale: () => {},
      formatPrice: (amount) => formatPriceUtil(amount, norm),
      localizedHref: (path) => localizedHrefUtil(path, norm),
    };
  }
  return ctx;
}
