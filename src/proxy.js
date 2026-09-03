import { NextResponse } from "next/server";
import { LOCALES, DEFAULT_LOCALE } from "./lib/i18n";
import { resolveStaticPage } from "./data/slugs";

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";
  const isUkDomain = host.includes("wallbedking.co.uk");

  // 1. Ignore Next.js internals, APIs, static files, and media
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/sofa-configurator") ||
    pathname.startsWith("/product-images") ||
    pathname.startsWith("/showroom") ||
    pathname.startsWith("/logos") ||
    pathname.startsWith("/favicon.ico") ||
    /\.(.*)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 2. Handle /pt alias -> redirect to /por
  if (pathname === "/pt" || pathname.startsWith("/pt/")) {
    const newPath = pathname.replace(/^\/pt/, "/por");
    request.nextUrl.pathname = newPath;
    return NextResponse.redirect(request.nextUrl);
  }

  // 3. Check if pathname already starts with a supported locale
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

  // 4. If missing locale:
  // On .co.uk domain, default is always 'en'
  // On .com domain, detect from cookie or default to 'en'
  let targetLocale = DEFAULT_LOCALE;
  if (!isUkDomain) {
    const savedLocale = request.cookies.get("NEXT_LOCALE")?.value;
    if (LOCALES.includes(savedLocale)) {
      targetLocale = savedLocale;
    }
  }

  const targetPath = pathname === "/" ? `/${targetLocale}` : `/${targetLocale}${pathname}`;
  request.nextUrl.pathname = targetPath;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    // Match all paths except explicit static assets and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
