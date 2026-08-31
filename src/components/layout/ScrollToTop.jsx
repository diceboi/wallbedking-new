"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * ScrollToTop ensures that whenever the route (pathname) changes,
 * the window scroll position is reliably and immediately reset to the very top (0, 0),
 * avoiding any partial scroll offsets caused by sticky headers or asynchronous layout shifts.
 */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Disable browser's auto scroll restoration if supported
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // Immediately scroll to the very top
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });

    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Run once more on the next animation frame in case async layout rendering altered height
    const rafId = window.requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });

    return () => window.cancelAnimationFrame(rafId);
  }, [pathname]);

  return null;
}
