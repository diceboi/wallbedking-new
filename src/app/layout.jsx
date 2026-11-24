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

  return (
    <html lang="en" className={`${poppins.variable} antialiased`}>
      <body className="min-h-screen flex flex-col bg-wbk-white">
        {/* Google Consent Mode v2 & DataLayer Early Initialization (must live in RootLayout for beforeInteractive) */}
        <Script id="wbk-consent-mode-init" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
            var gtag = window.gtag;

            var storedConsent = null;
            try {
              var raw = localStorage.getItem('wbk_cookie_consent_v1');
              if (raw) storedConsent = JSON.parse(raw);
            } catch(e) {}

            var isAnalytics = storedConsent && storedConsent.analytics === true;
            var isMarketing = storedConsent && storedConsent.marketing === true;

            gtag('consent', 'default', {
              'ad_storage': isMarketing ? 'granted' : 'denied',
              'ad_user_data': isMarketing ? 'granted' : 'denied',
              'ad_personalization': isMarketing ? 'granted' : 'denied',
              'analytics_storage': isAnalytics ? 'granted' : 'denied',
              'wait_for_update': 500
            });
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
