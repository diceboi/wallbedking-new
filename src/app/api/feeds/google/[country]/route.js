import { NextResponse } from "next/server";
import {
  resolveCountryConfig,
  getFeedBaseUrl,
  getGoogleFeedItems,
  generateGoogleXmlFeed,
  generateGoogleTsvFeed,
} from "@/lib/google-merchant-feed";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const { country: rawCountry } = await params;
    const { searchParams } = new URL(request.url);

    // Support extensions in route param (e.g. "gb.xml", "de.tsv")
    let countryCode = rawCountry;
    let formatFromParam = null;
    if (rawCountry && rawCountry.includes(".")) {
      const parts = rawCountry.split(".");
      countryCode = parts[0];
      formatFromParam = parts[1].toLowerCase();
    }

    const format = (formatFromParam || searchParams.get("format") || "xml").toLowerCase();
    const shouldDownload = searchParams.get("download") === "1";

    const countryConfig = resolveCountryConfig(countryCode);
    const baseUrl = getFeedBaseUrl(request);

    // Fetch and filter live public products
    const items = await getGoogleFeedItems(countryConfig, baseUrl);

    // TSV or TXT output
    if (format === "tsv" || format === "txt") {
      const tsvContent = generateGoogleTsvFeed(countryConfig, items);
      const headers = {
        "Content-Type": "text/tab-separated-values; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      };

      if (shouldDownload) {
        headers["Content-Disposition"] = `attachment; filename="google-feed-${countryConfig.code}.tsv"`;
      }

      return new NextResponse(tsvContent, { status: 200, headers });
    }

    // JSON format (useful for inspection and admin debugging)
    if (format === "json") {
      return NextResponse.json({
        success: true,
        country: countryConfig.name,
        countryCode: countryConfig.code,
        locale: countryConfig.locale,
        currency: countryConfig.currency,
        count: items.length,
        generatedAt: new Date().toISOString(),
        items,
      });
    }

    // Default: Official Google XML (RSS 2.0 with g: namespace)
    const xmlContent = generateGoogleXmlFeed(countryConfig, items, baseUrl);
    const headers = {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    };

    if (shouldDownload) {
      headers["Content-Disposition"] = `attachment; filename="google-feed-${countryConfig.code}.xml"`;
    }

    return new NextResponse(xmlContent, { status: 200, headers });
  } catch (error) {
    console.error("[Google Feed Error]", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
