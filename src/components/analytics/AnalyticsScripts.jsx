"use client";

import Script from "next/script";
import { useLocale } from "@/context/LocaleContext";
import {
  GTM_ID_EU,
  GTM_ID_US,
  META_PIXEL_ID,
  getGtmContainerId,
} from "@/lib/analytics";

export function AnalyticsScripts() {
  const { locale } = useLocale();
  const gtmId = getGtmContainerId(locale);

  return (
    <>
      {/* 1. Google Consent Mode v2 & DataLayer Early Initialization */}
      <Script id="wbk-consent-mode-init" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}

          // Check stored consent
          var storedConsent = null;
          try {
            var raw = localStorage.getItem('wbk_cookie_consent_v1');
            if (raw) storedConsent = JSON.parse(raw);
          } catch(e) {}

          var isAnalytics = storedConsent && storedConsent.analytics === true;
          var isMarketing = storedConsent && storedConsent.marketing === true;

          // Google Consent Mode v2 default
          gtag('consent', 'default', {
            'ad_storage': isMarketing ? 'granted' : 'denied',
            'ad_user_data': isMarketing ? 'granted' : 'denied',
            'ad_personalization': isMarketing ? 'granted' : 'denied',
            'analytics_storage': isAnalytics ? 'granted' : 'denied',
            'wait_for_update': 500
          });

          // Meta Pixel early consent queue
          window.fbq = window.fbq || function(){
            (window.fbq.q = window.fbq.q || []).push(arguments);
          };
          if (!isMarketing) {
            window.fbq('consent', 'revoke');
          } else {
            window.fbq('consent', 'grant');
          }
        `}
      </Script>

      {/* 2. Google Tag Manager */}
      <Script
        id="wbk-gtm"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtm.js?id=${gtmId}`}
      />

      {/* 3. Meta (Facebook) Pixel */}
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
          fbq('init', '${META_PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>

      {/* 4. Noscript Fallbacks */}
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
