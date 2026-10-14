export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.wallbedking.com";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/thanks", "/*?*session_id=*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
