import { LOCALES } from "@/lib/i18n";
import { RAW_CATALOG } from "@/data/products";
import { getStorefrontProducts } from "@/lib/products-db";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.wallbedking.com";
  const routes = [
    "",
    "/products/beds",
    "/products/accessories",
    "/products/mattresses",
    "/configurator",
    "/about",
    "/contact",
    "/support",
    "/reviews",
    "/terms",
    "/privacy",
  ];

  const sitemapEntries = [];
  const catalog = (await getStorefrontProducts()) || RAW_CATALOG;

  // Generate localized static routes
  for (const locale of LOCALES) {
    for (const route of routes) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === "" ? "daily" : "weekly",
        priority: route === "" ? 1.0 : 0.8,
      });
    }

    // Generate localized product pages
    if (Array.isArray(catalog)) {
      for (const prod of catalog) {
        const isHidden =
          prod.visibility === "Hidden" ||
          prod.visibility === "hidden" ||
          prod.visibility === false ||
          prod.is_visible === false;
        if (prod.slug && !isHidden) {
          const rawCat = prod.parent_category || "beds";
          const category =
            rawCat === "morphy-beds" || rawCat === "traditional-beds"
              ? "beds"
              : rawCat;
          sitemapEntries.push({
            url: `${baseUrl}/${locale}/products/${category}/${prod.slug}`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.7,
          });
        }
      }
    }
  }

  return sitemapEntries;
}
