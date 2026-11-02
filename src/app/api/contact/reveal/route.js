import { NextResponse } from "next/server";
import { getClientIp, checkRateLimit } from "@/lib/turnstile";

const BOT_UA_PATTERN =
  /curl\/|wget\/|python-requests|python-urllib|scrapy|go-http-client|libwww-perl|ahrefsbot|semrushbot|mj12bot|dotbot|petalbot|bytespider/i;

const UK_LOCAL_PHONE = "01928 583 469";
const INTL_PHONE = "+44 1928 583 469";
const TEL_HREF = "tel:+441928583469";

/**
 * POST /api/contact/reveal
 * Reveals WallBedKing email or phone number ONLY upon explicit 1-click human interaction.
 * Keeps raw contact details completely out of SSR HTML and client JavaScript bundles.
 */
export async function POST(request) {
  try {
    const userAgent = request.headers.get("user-agent") || "";
    if (!userAgent || BOT_UA_PATTERN.test(userAgent)) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const ip = getClientIp(request);
    const rate = checkRateLimit(`reveal:${ip}`, 30, 10 * 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again shortly." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { type, locale = "en", humanClick } = body || {};

    if (humanClick !== true || (type !== "email" && type !== "phone")) {
      return NextResponse.json(
        { success: false, error: "Invalid request." },
        { status: 400 }
      );
    }

    const headers = {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    };

    if (type === "email") {
      const supportEmail = (
        process.env.SUPPORT_EMAIL || "support@wallbedking.com"
      ).trim();

      return NextResponse.json(
        {
          success: true,
          type: "email",
          value: supportEmail,
          href: `mailto:${supportEmail}`,
        },
        { headers }
      );
    }

    const normLocale = String(locale || "en").toLowerCase();
    const isUk = normLocale === "en";

    return NextResponse.json(
      {
        success: true,
        type: "phone",
        value: isUk ? UK_LOCAL_PHONE : INTL_PHONE,
        ukLocal: UK_LOCAL_PHONE,
        international: INTL_PHONE,
        href: TEL_HREF,
      },
      { headers }
    );
  } catch (err) {
    console.error("[Reveal Contact API Error]", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

