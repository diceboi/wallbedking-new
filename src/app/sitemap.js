import { LOCALES } from "@/lib/i18n";
import { RAW_CATALOG } from "@/data/products";

export default async function sitemap() {
  const baseUrl = "https://www.wallbedking.co.uk";
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
    if (Array.isArray(RAW_CATALOG)) {
      for (const prod of RAW_CATALOG.slice(0, 100)) {
        if (prod.slug) {
          const category = prod.parent_category || "beds";
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
