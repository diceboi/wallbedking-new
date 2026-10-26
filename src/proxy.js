import { NextResponse } from "next/server";
import { LOCALES } from "./lib/i18n";
import { resolveStaticPage } from "./data/slugs";
import { resolveLegacyRedirect } from "./data/legacy-redirects";

// On .com, active locales are US and EU (UK is hosted separately on wallbedking.co.uk)
const COM_LOCALES = ["us", "de", "fr", "es", "por", "it"];
const DEFAULT_COM_LOCALE = "de"; // Default to Germany storefront for .com

function detectLocaleFromAcceptLanguage(acceptLanguageHeader) {
  if (!acceptLanguageHeader) return null;
  const tokens = acceptLanguageHeader
    .split(",")
    .map((part) => part.split(";")[0].trim().toLowerCase())
    .filter(Boolean);

  for (const token of tokens) {
    if (token.startsWith("de")) return "de";
    if (token.startsWith("fr")) return "fr";
    if (token.startsWith("es")) return "es";
    if (token.startsWith("it")) return "it";
    if (token.startsWith("pt")) return "por";
    if (token === "en-us" || token.startsWith("en-us")) return "us";
    if (token === "en-gb" || token === "en-ie") return "uk_redirect";
  }
  return null;
}

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";
  const isUkDomain = host.includes("wallbedking.co.uk");

  // 1. Ignore Next.js internals, APIs, and Admin
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin")
  ) {
    return NextResponse.next();
  }

  // 2. Check legacy redirects from old website (.com and .co.uk)
  const savedCookieLocale = request.cookies.get("NEXT_LOCALE")?.value?.toLowerCase();
  const acceptLangHeader = request.headers.get("accept-language");
  const detectedLang = detectLocaleFromAcceptLanguage(acceptLangHeader);
  const preferredLocale = savedCookieLocale || (detectedLang !== "uk_redirect" ? detectedLang : null) || null;

  const legacyTarget = resolveLegacyRedirect(pathname, isUkDomain, preferredLocale);
  if (
    legacyTarget &&
    legacyTarget !== pathname &&
    legacyTarget !== `${pathname}/` &&
    `${legacyTarget}/` !== pathname
  ) {
    const targetUrl = new URL(legacyTarget, request.url);
    if (request.nextUrl.search && !legacyTarget.includes("?")) {
      targetUrl.search = request.nextUrl.search;
    } else if (request.nextUrl.search && legacyTarget.includes("?")) {
      const existingParams = new URLSearchParams(targetUrl.search);
      for (const [key, val] of request.nextUrl.searchParams.entries()) {
        if (!existingParams.has(key)) {
          existingParams.append(key, val);
        }
      }
      targetUrl.search = existingParams.toString();
    }
    return NextResponse.redirect(targetUrl, 301);
  }

  // 3. Ignore explicit static assets and media files
  if (
    pathname.startsWith("/sofa-configurator") ||
    pathname.startsWith("/product-images") ||
    pathname.startsWith("/showroom") ||
    pathname.startsWith("/logos") ||
    pathname.startsWith("/favicon.ico") ||
    /\.(png|jpe?g|webp|gif|svg|ico|css|js|woff2?|ttf|eot|mp4|webm|pdf|json|txt|xml)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 2. Handle /pt alias -> redirect to /por
  if (pathname === "/pt" || pathname.startsWith("/pt/")) {
    const newPath = pathname.replace(/^\/pt/, "/por");
    request.nextUrl.pathname = newPath;
    return NextResponse.redirect(request.nextUrl);
  }

  // 3. For .com / non-UK storefronts: NEVER allow /en!
  // If user requests /en, redirect directly to the live UK storefront (wallbedking.co.uk)
  // (Skip redirect on localhost and Vercel preview / staging environments)
  const isDevOrPreview =
    host.includes("localhost") ||
    host.includes("127.0.0.1") ||
    host.includes("0.0.0.0") ||
    host.includes("vercel.app");
  if (!isUkDomain && !isDevOrPreview && (pathname === "/en" || pathname.startsWith("/en/"))) {
    return NextResponse.redirect(new URL(`https://wallbedking.co.uk${pathname}`));
  }

  // 4. Check if pathname already starts with a supported locale
  const pathnameHasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (pathnameHasLocale) {
    const segments = pathname.split("/").filter(Boolean);
    const currentLocale = segments[0];
    const restPath = segments.slice(1).join("/");

    // Rewrite localized static page slugs to canonical Next.js App Router paths
    // e.g. /de/ueber-uns -> rewrites internally to /de/about
    // e.g. /de/kontakt -> rewrites internally to /de/contact
    // e.g. /de/konfigurator -> rewrites internally to /de/configurator
    const canonicalStatic = resolveStaticPage(restPath, currentLocale);
    if (canonicalStatic && canonicalStatic !== restPath) {
      request.nextUrl.pathname = `/${currentLocale}/${canonicalStatic}`;
      const response = NextResponse.rewrite(request.nextUrl);
      response.headers.set("x-locale", currentLocale);
      response.headers.set("x-canonical-path", canonicalStatic);
      if (isUkDomain) response.headers.set("x-market-domain", "uk");
      return response;
    }

    const response = NextResponse.next();
    response.headers.set("x-locale", currentLocale);
    if (isUkDomain) response.headers.set("x-market-domain", "uk");
    return response;
  }

  // 5. If missing locale (e.g. root '/' or static path without locale prefix):
  // On .co.uk domain, default is always 'en'
  if (isUkDomain) {
    const targetPath = pathname === "/" ? "/en" : `/en${pathname}`;
    request.nextUrl.pathname = targetPath;
    return NextResponse.redirect(request.nextUrl);
  }

  // On .com / international domain:
  // A. Check saved cookie
  const savedLocale = request.cookies.get("NEXT_LOCALE")?.value?.toLowerCase();
  if (savedLocale === "en") {
    // If previously saved cookie was UK 'en', redirect to live UK site
    return NextResponse.redirect(new URL("https://wallbedking.co.uk/en"));
  }
  if (COM_LOCALES.includes(savedLocale)) {
    const targetPath = pathname === "/" ? `/${savedLocale}` : `/${savedLocale}${pathname}`;
    request.nextUrl.pathname = targetPath;
    return NextResponse.redirect(request.nextUrl);
  }

  // B. Check browser language (Accept-Language)
  const acceptLang = request.headers.get("accept-language");
  const detected = detectLocaleFromAcceptLanguage(acceptLang);
  if (detected === "uk_redirect") {
    return NextResponse.redirect(new URL("https://wallbedking.co.uk/en"));
  }
  if (detected && COM_LOCALES.includes(detected)) {
    const targetPath = pathname === "/" ? `/${detected}` : `/${detected}${pathname}`;
    request.nextUrl.pathname = targetPath;
    return NextResponse.redirect(request.nextUrl);
  }

  // C. Fallback: Default to Germany (/de) as requested
  const targetPath = pathname === "/" ? `/${DEFAULT_COM_LOCALE}` : `/${DEFAULT_COM_LOCALE}${pathname}`;
  request.nextUrl.pathname = targetPath;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    // Match all paths except explicit static assets and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
