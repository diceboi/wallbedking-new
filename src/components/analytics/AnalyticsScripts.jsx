"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { useLocale } from "@/context/LocaleContext";
import {
  META_PIXEL_ID,
  getGtmContainerId,
  trackPageView,
  updateConsent,
} from "@/lib/analytics";

export function AnalyticsScripts() {
  const { locale } = useLocale();
  const pathname = usePathname();
  const hasTrackedInitialRef = useRef(false);
  const gtmId = getGtmContainerId(locale);

  // Ensure the active market's GTM container is always loaded (including after SPA locale transitions)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (/^\/admin(\/|$)/i.test(pathname || "")) return;

    window.__wbkGtmLoaded = window.__wbkGtmLoaded || {};
    if (!window.__wbkGtmLoaded[gtmId]) {
      window.__wbkGtmLoaded[gtmId] = true;
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
      const scriptEl = document.createElement("script");
      scriptEl.async = true;
      scriptEl.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
      (document.head || document.body).appendChild(scriptEl);
    }

    // If navigating client-side onto /us without an explicit stored opt-out, grant US default consent
    if (locale === "us") {
      try {
        const raw = localStorage.getItem("wbk_cookie_consent_v1");
        if (!raw) {
          updateConsent({ analytics: true, marketing: true });
        }
      } catch {
        // ignore storage restrictions
      }
    }
  }, [gtmId, locale, pathname]);

  // Track client-side SPA route changes (initial PageView is fired by the inline Pixel script & GTM)
  useEffect(() => {
    if (!hasTrackedInitialRef.current) {
      hasTrackedInitialRef.current = true;
      return;
    }
    if (pathname) {
      trackPageView(pathname);
    }
  }, [pathname]);

  return (
    <>
      {/* 1. Meta (Facebook) Pixel */}
      <Script id="wbk-meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');

          var isUsPath = /^\\/us(\\/|$)/i.test((window.location && window.location.pathname) || '');
          var storedConsent = null;
          try {
            var raw = localStorage.getItem('wbk_cookie_consent_v1');
            if (raw) storedConsent = JSON.parse(raw);
          } catch(e) {}
          var isMarketing = storedConsent ? storedConsent.marketing === true : isUsPath;

          fbq('consent', isMarketing ? 'grant' : 'revoke');
          fbq('init', '${META_PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>

      {/* 2. Noscript Fallbacks */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
        />
      </noscript>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
