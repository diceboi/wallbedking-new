"use client";

import { useEffect } from "react";
import Script from "next/script";
import { useLocale } from "@/context/LocaleContext";
import { usePathname } from "next/navigation";

// Official WallBedKing Zendesk / Zopim Chat Account Key
const ZOPIM_ACCOUNT_KEY = "h71OCp6k90A8wAbynqYDg4W3PJ89KXH6";

/**
 * Custom theme color for Zendesk Chat widget.
 * Set to a HEX code (e.g. "#090A0A" for sleek black, "#D2AA7C" for WBK gold,
 * "#A3A48C" for olive sage), or null to use Zendesk default green.
 */
export const CHAT_THEME_COLOR = "#090A0A";

/**
 * Global helper to open Zendesk Live Chat window from anywhere in the app
 */
export function openZendeskChat() {
  if (typeof window !== "undefined" && window.$zopim) {
    window.$zopim(() => {
      try {
        if (window.$zopim.livechat && window.$zopim.livechat.window) {
          window.$zopim.livechat.window.show();
        }
      } catch (e) {
        console.warn("Could not open Zendesk chat window:", e);
      }
    });
  }
}

export function ZendeskChat() {
  const { locale } = useLocale();
  const pathname = usePathname();

  // Don't render chat widget in admin dashboard
  const isAdmin = pathname?.startsWith("/admin");

  // Detect single product detail page: e.g. /[locale]/products/[category]/[product]
  const isProductPage = Boolean(
    pathname &&
    /\/products\/[^/]+\/[^/]+/.test(pathname)
  );

  // Initialize Zopim command queue & sync language, position and color
  useEffect(() => {
    if (isAdmin || typeof window === "undefined") return;

    // Initialize Zopim stub and queue if not present yet
    if (!window.$zopim) {
      const z = (window.$zopim = function (c) {
        z._.push(c);
      });
      z.set = function (o) {
        z.set._.push(o);
      };
      z._ = [];
      z.set._ = [];
      z.t = +new Date();
    }

    // Configure zESettings for Web Widget
    if (CHAT_THEME_COLOR) {
      window.zESettings = {
        ...window.zESettings,
        webWidget: {
          ...window.zESettings?.webWidget,
          color: {
            theme: CHAT_THEME_COLOR,
            launcher: CHAT_THEME_COLOR,
            launcherText: "#FFFFFF",
            button: CHAT_THEME_COLOR,
          },
        },
      };
    }

    const langMap = {
      de: "de",
      en: "en",
      us: "en",
      es: "es",
      fr: "fr",
      it: "it",
      por: "pt",
      pt: "pt",
    };
    const targetLang = langMap[locale] || "en";

    window.$zopim(() => {
      try {
        if (window.$zopim.livechat) {
          window.$zopim.livechat.setLanguage(targetLang);

          // Customize color if defined
          if (CHAT_THEME_COLOR) {
            if (window.$zopim.livechat.theme?.setColor) {
              window.$zopim.livechat.theme.setColor(CHAT_THEME_COLOR);
              window.$zopim.livechat.theme.reload?.();
            }
            if (window.$zopim.livechat.button?.setColor) {
              window.$zopim.livechat.button.setColor(CHAT_THEME_COLOR);
            }
          }

          // Adjust vertical offset on product pages so it sits above the sticky Add to Cart bar
          if (window.$zopim.livechat.button?.setOffsetVertical) {
            window.$zopim.livechat.button.setOffsetVertical(isProductPage ? 112 : 15);
          }
          if (window.$zopim.livechat.button?.setOffsetVerticalMobile) {
            window.$zopim.livechat.button.setOffsetVerticalMobile(isProductPage ? 92 : 10);
          }
        }
      } catch (err) {
        // Zopim not ready yet
      }
    });
  }, [locale, isAdmin, isProductPage]);

  if (isAdmin) return null;

  return (
    <>
      {/* 
        On product pages, the persistent bottom Add to Cart bar occupies the bottom area.
        Elevate the chat launcher widget cleanly above it on both mobile and desktop/small screens.
      */}
      {isProductPage && (
        <style
          dangerouslySetInnerHTML={{
            __html: `
              #launcher,
              iframe#launcher,
              .zEWidget-launcher,
              div[class*="zopim"]:not([class*="window"]) {
                bottom: 92px !important;
                transition: bottom 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
              }
              @media (min-width: 640px) {
                #launcher,
                iframe#launcher,
                .zEWidget-launcher,
                div[class*="zopim"]:not([class*="window"]) {
                  bottom: 112px !important;
                }
              }
            `,
          }}
        />
      )}

      <Script
        id="zopim-chat-loader"
        strategy="afterInteractive"
        src={`https://cdn.zopim.com/?${ZOPIM_ACCOUNT_KEY}`}
        onLoad={() => {
          if (typeof window !== "undefined" && window.$zopim) {
            window.$zopim(() => {
              try {
                const langMap = {
                  de: "de",
                  en: "en",
                  us: "en",
                  es: "es",
                  fr: "fr",
                  it: "it",
                  por: "pt",
                  pt: "pt",
                };
                const targetLang = langMap[locale] || "en";
                if (window.$zopim.livechat) {
                  window.$zopim.livechat.setLanguage(targetLang);

                  if (CHAT_THEME_COLOR) {
                    if (window.$zopim.livechat.theme?.setColor) {
                      window.$zopim.livechat.theme.setColor(CHAT_THEME_COLOR);
                      window.$zopim.livechat.theme.reload?.();
                    }
                    if (window.$zopim.livechat.button?.setColor) {
                      window.$zopim.livechat.button.setColor(CHAT_THEME_COLOR);
                    }
                  }

                  if (window.$zopim.livechat.button?.setOffsetVertical) {
                    window.$zopim.livechat.button.setOffsetVertical(isProductPage ? 112 : 15);
                  }
                  if (window.$zopim.livechat.button?.setOffsetVerticalMobile) {
                    window.$zopim.livechat.button.setOffsetVerticalMobile(isProductPage ? 92 : 10);
                  }
                }
              } catch (err) {
                // Ignore
              }
            });
          }
        }}
      />
    </>
  );
}
