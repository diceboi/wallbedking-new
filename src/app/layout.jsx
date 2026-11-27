import { Poppins } from "next/font/google";
import Script from "next/script";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { MenuContextProvider } from "@/context/MenuContext";
import { CartProvider } from "@/context/CartContext";
import { WholesaleProvider } from "@/context/WholesaleContext";
import { AuthProvider } from "@/context/AuthContext";
import { LocaleProvider } from "@/context/LocaleContext";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { WholesaleCartDrawer } from "@/components/wholesale/WholesaleCartDrawer";
import { InfluencerOfferBanner } from "@/components/affiliate/InfluencerOfferBanner";
import { UserDrawer } from "@/components/auth/UserDrawer";
import { PasswordResetModal } from "@/components/auth/PasswordResetModal";
import { CookieConsent } from "@/components/ui/CookieConsent";
import { getStorefrontProducts, getStorefrontBundles } from "@/lib/products-db";
import { getStorefrontCategories } from "@/lib/categories-db";
import { ProductCatalogProvider } from "@/context/ProductCatalogContext";
import { CategoriesProvider } from "@/context/CategoriesContext";
import { PromotionsProvider } from "@/context/PromotionsContext";
import { getCampaigns, isCampaignActive } from "@/lib/promotions";
import { cookies } from "next/headers";
import { AnalyticsScripts } from "@/components/analytics/AnalyticsScripts";
import { PostHogProvider } from "@/components/providers/PostHogProvider";
import { ZendeskChat } from "@/components/chat/ZendeskChat";
import "./globals.css";

/* ── Google Font: Poppins ─────────────────────────────────── */
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata = {
  title: {
    default: "WallBedKing – Modular Murphy Beds & Furniture",
    template: "%s | WallBedKing",
  },
  description:
    "Discover WallBedKing's premium modular murphy beds, sofas, mattresses and furniture. Space-saving solutions crafted for modern living.",
  keywords: ["murphy bed", "wall bed", "modular bed", "space saving furniture", "WallBedKing"],
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "WallBedKing",
  },
  verification: {
    google: ["googleef87f60405111b90", "googlefbbb56ed99e358dd"],
  },
};

export default async function RootLayout({ children }) {
  const [initialProducts, initialCategories, initialBundles, allCampaigns] = await Promise.all([
    getStorefrontProducts(),
    getStorefrontCategories(),
    getStorefrontBundles(),
    getCampaigns().catch(() => []),
  ]);

  const now = new Date();
  let isAdmin = false;
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
    isAdmin =
      cookieStore.get("wbk_admin")?.value === "1" ||
      cookieStore.get("admin")?.value === "1" ||
      /sb-[a-z0-9]+-auth-token/i.test(cookieHeader);
  } catch {
    // ignore
  }

  const initialActiveCampaigns = (allCampaigns || [])
    .filter((c) => {
      if (!c) return false;
      if (c.status === "inactive") return false;
      if (c.end_date && new Date(c.end_date).getTime() < now.getTime()) return false;
      if (c.status === "preview" && !isAdmin) return false;
      return isCampaignActive(c, now);
    })
    .map((c) => ({
      ...c,
      isPreview: c.status === "preview",
    }));

  const gtmIdUk = process.env.NEXT_PUBLIC_GTM_ID_UK || "GTM-NF5VPKX";
  const gtmIdEu = process.env.NEXT_PUBLIC_GTM_ID_EU || "GTM-WBV7QDZL";
  const gtmIdUs = process.env.NEXT_PUBLIC_GTM_ID_US || "GTM-NFQT94XD";

  return (
    <html lang="en" className={`${poppins.variable} antialiased`}>
      <body className="min-h-screen flex flex-col bg-wbk-white">
        {/* Google Consent Mode v2 + Early GTM Bootstrap (runs beforeInteractive in initial HTML for all detectors & Tag Assistant) */}
        <Script id="wbk-consent-mode-init" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
            var gtag = window.gtag;

            var pathname = (window.location && window.location.pathname) || '';
            var hostname = (window.location && window.location.hostname) || '';
            var isUsPath = /^\\/us(\\/|$)/i.test(pathname);
            var isUkPath = /^\\/en(\\/|$)/i.test(pathname) || (hostname.indexOf('wallbedking.co.uk') !== -1 && !/^\\/(de|fr|es|it|por|pt|us)(\\/|$)/i.test(pathname));

            var storedConsent = null;
            try {
              var raw = localStorage.getItem('wbk_cookie_consent_v1');
              if (raw) storedConsent = JSON.parse(raw);
            } catch(e) {}

            // US does not require GDPR opt-in before firing tags; respect explicit stored choice if user opted out
            var isAnalytics = storedConsent ? storedConsent.analytics === true : isUsPath;
            var isMarketing = storedConsent ? storedConsent.marketing === true : isUsPath;

            gtag('consent', 'default', {
              'ad_storage': isMarketing ? 'granted' : 'denied',
              'ad_user_data': isMarketing ? 'granted' : 'denied',
              'ad_personalization': isMarketing ? 'granted' : 'denied',
              'analytics_storage': isAnalytics ? 'granted' : 'denied',
              'wait_for_update': 500
            });

            // Immediately bootstrap the exact market GTM container (skips /admin routes)
            if (!/^\\/admin(\\/|$)/i.test(pathname)) {
              var activeGtmId = isUsPath ? '${gtmIdUs}' : (isUkPath ? '${gtmIdUk}' : '${gtmIdEu}');
              window.__wbkGtmLoaded = window.__wbkGtmLoaded || {};
              if (!window.__wbkGtmLoaded[activeGtmId]) {
                window.__wbkGtmLoaded[activeGtmId] = true;
                window.dataLayer.push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
                var j = document.createElement('script');
                j.async = true;
                j.src = 'https://www.googletagmanager.com/gtm.js?id=' + activeGtmId;
                var target = document.head || document.getElementsByTagName('script')[0].parentNode;
                target.appendChild(j);
              }
            }
          `}
        </Script>
        <ScrollToTop />
        <AuthProvider>
          <PostHogProvider>
            <LocaleProvider>
              <AnalyticsScripts />
              <ProductCatalogProvider initialProducts={initialProducts} initialBundles={initialBundles}>
                <CategoriesProvider initialCategories={initialCategories}>
                  <PromotionsProvider initialCampaigns={initialActiveCampaigns}>
                    <CartProvider>
                      <WholesaleProvider>
                        <MenuContextProvider>
                          <Header />
                          <InfluencerOfferBanner />
                          <main className="flex-1">{children}</main>
                          <Footer />
                          <CartDrawer />
                          <WholesaleCartDrawer />
                          <UserDrawer />
                          <PasswordResetModal />
                          <CookieConsent />
                          <ZendeskChat />
                        </MenuContextProvider>
                      </WholesaleProvider>
                    </CartProvider>
                  </PromotionsProvider>
                </CategoriesProvider>
              </ProductCatalogProvider>
            </LocaleProvider>
          </PostHogProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
