export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/thanks", "/*?*session_id=*"],
      },
    ],
    sitemap: "https://www.wallbedking.co.uk/sitemap.xml",
  };
}
