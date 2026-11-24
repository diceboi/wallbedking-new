"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { useLocale } from "@/context/LocaleContext";
import {
  META_PIXEL_ID,
  getGtmContainerId,
  trackPageView,
} from "@/lib/analytics";

export function AnalyticsScripts() {
  const { locale } = useLocale();
  const pathname = usePathname();
  const hasTrackedInitialRef = useRef(false);
  const gtmId = getGtmContainerId(locale);

  // Track client-side SPA route changes (initial PageView is fired by the inline Pixel script)
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
      {/* 1. Google Tag Manager (official bootstrap with gtm.start & event: 'gtm.js') */}
      <Script id={`wbk-gtm-${gtmId}`} strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){
            w.__wbkGtmLoaded = w.__wbkGtmLoaded || {};
            if (w.__wbkGtmLoaded[i]) return;
            w.__wbkGtmLoaded[i] = true;
            w[l]=w[l]||[];
            w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
            var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
            j.async=true;
            j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
            f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${gtmId}');
        `}
      </Script>

      {/* 2. Meta (Facebook) Pixel */}
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

          var storedConsent = null;
          try {
            var raw = localStorage.getItem('wbk_cookie_consent_v1');
            if (raw) storedConsent = JSON.parse(raw);
          } catch(e) {}
          var isMarketing = storedConsent && storedConsent.marketing === true;

          fbq('consent', isMarketing ? 'grant' : 'revoke');
          fbq('init', '${META_PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>

      {/* 3. Noscript Fallbacks */}
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
