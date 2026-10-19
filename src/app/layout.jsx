import { Poppins } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { MenuContextProvider } from "@/context/MenuContext";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { LocaleProvider } from "@/context/LocaleContext";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { UserDrawer } from "@/components/auth/UserDrawer";
import { PasswordResetModal } from "@/components/auth/PasswordResetModal";
import { CookieConsent } from "@/components/ui/CookieConsent";
import { getStorefrontProducts } from "@/lib/products-db";
import { getStorefrontCategories } from "@/lib/categories-db";
import { ProductCatalogProvider } from "@/context/ProductCatalogContext";
import { CategoriesProvider } from "@/context/CategoriesContext";
import { AnalyticsScripts } from "@/components/analytics/AnalyticsScripts";
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
  const [initialProducts, initialCategories] = await Promise.all([
    getStorefrontProducts(),
    getStorefrontCategories(),
  ]);

  return (
    <html lang="en" className={`${poppins.variable} antialiased`}>
      <body className="min-h-screen flex flex-col bg-wbk-white">
        <ScrollToTop />
        <AuthProvider>
          <LocaleProvider>
            <AnalyticsScripts />
            <ProductCatalogProvider initialProducts={initialProducts}>
              <CategoriesProvider initialCategories={initialCategories}>
                <CartProvider>
                  <MenuContextProvider>
                    <Header />
                    <main className="flex-1">{children}</main>
                    <Footer />
                    <CartDrawer />
                    <UserDrawer />
                    <PasswordResetModal />
                    <CookieConsent />
                    <ZendeskChat />
                  </MenuContextProvider>
                </CartProvider>
              </CategoriesProvider>
            </ProductCatalogProvider>
          </LocaleProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
