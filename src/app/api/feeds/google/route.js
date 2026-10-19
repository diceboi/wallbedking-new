import { NextResponse } from "next/server";
import {
  GOOGLE_FEED_COUNTRIES,
  resolveCountryConfig,
  getFeedBaseUrl,
  getGoogleFeedItems,
  generateGoogleXmlFeed,
  generateGoogleTsvFeed,
} from "@/lib/google-merchant-feed";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const countryParam = searchParams.get("country");
    const baseUrl = getFeedBaseUrl(request);

    // If specific country is requested via query param (e.g. /api/feeds/google?country=de&format=xml)
    if (countryParam) {
      const format = (searchParams.get("format") || "xml").toLowerCase();
      const shouldDownload = searchParams.get("download") === "1";
      const countryConfig = resolveCountryConfig(countryParam);
      const items = await getGoogleFeedItems(countryConfig, baseUrl);

      if (format === "tsv" || format === "txt") {
        const tsv = generateGoogleTsvFeed(countryConfig, items);
        const headers = {
          "Content-Type": "text/tab-separated-values; charset=utf-8",
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        };
        if (shouldDownload) {
          headers["Content-Disposition"] = `attachment; filename="google-feed-${countryConfig.code}.tsv"`;
        }
        return new NextResponse(tsv, { status: 200, headers });
      }

      if (format === "json") {
        return NextResponse.json({
          success: true,
          country: countryConfig.name,
          countryCode: countryConfig.code,
          locale: countryConfig.locale,
          currency: countryConfig.currency,
          count: items.length,
          items,
        });
      }

      const xml = generateGoogleXmlFeed(countryConfig, items, baseUrl);
      const headers = {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      };
      if (shouldDownload) {
        headers["Content-Disposition"] = `attachment; filename="google-feed-${countryConfig.code}.xml"`;
      }
      return new NextResponse(xml, { status: 200, headers });
    }

    // Otherwise return index of all available country feeds and instructions
    const feeds = Object.values(GOOGLE_FEED_COUNTRIES).map((country) => ({
      code: country.code,
      countryCode: country.countryCode,
      name: country.name,
      nameHu: country.nameHu,
      flag: country.flag,
      locale: country.locale,
      currency: country.currency,
      xmlFeedUrl: `${baseUrl}/api/feeds/google/${country.code}`,
      tsvFeedUrl: `${baseUrl}/api/feeds/google/${country.code}?format=tsv`,
      xmlDirectFile: `${baseUrl}/api/feeds/google/${country.code}.xml`,
      tsvDirectFile: `${baseUrl}/api/feeds/google/${country.code}.tsv`,
    }));

    return NextResponse.json({
      success: true,
      service: "Google Merchant Center Live Product Feed Service",
      description: "Automated, auto-updating Google Merchant Center feeds separated by country/market.",
      protocol: "Scheduled Fetch (HTTP GET)",
      supportedFormats: ["XML (RSS 2.0 with g: namespace)", "TSV (Tab-Separated Values)"],
      baseUrl,
      feeds,
      instructions: {
        step1: "Open Google Merchant Center (merchants.google.com)",
        step2: "Go to Products > Feeds and click Add Primary Feed",
        step3: "Select your target country and language",
        step4: "Choose 'Scheduled fetch' as your upload method",
        step5: "Paste the XML or TSV Feed URL corresponding to your target country",
        step6: "Set the fetch schedule (e.g. daily at 02:00)",
      },
    });
  } catch (error) {
    console.error("[Google Feed Index Error]", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
