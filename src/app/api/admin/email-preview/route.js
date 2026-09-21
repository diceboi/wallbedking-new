import { NextResponse } from "next/server";
import {
  getOrderConfirmationHtml,
  getAdminOrderAlertHtml,
  getShippingNotificationHtml,
  getContactFormHtml,
  getReviewRequestHtml,
  getAdminNewReviewAlertHtml,
  SAMPLE_ORDER,
  SAMPLE_SHIPPING,
  SAMPLE_CONTACT,
  SAMPLE_REVIEW,
  DEFAULT_FROM,
  CONFIRMATION_I18N,
  REVIEW_REQUEST_I18N,
} from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/email-preview?type=order_confirmation|shipping|admin_alert|contact|review_request|review_alert&locale=en|de|fr|es|it|por|us
 * Renders raw HTML directly in the browser for instant visual preview
 */
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const origin = url.origin;
    const type = searchParams.get("type") || "order_confirmation";
    const locale = searchParams.get("locale") || "en";

    let html = "";

    switch (type) {
      case "shipping":
        html = getShippingNotificationHtml(
          SAMPLE_SHIPPING.order,
          SAMPLE_SHIPPING.trackingNumber,
          SAMPLE_SHIPPING.carrier
        );
        break;
      case "admin_alert":
        html = getAdminOrderAlertHtml(SAMPLE_ORDER);
        break;
      case "contact":
        html = getContactFormHtml(SAMPLE_CONTACT);
        break;
      case "review_request":
        html = getReviewRequestHtml({ ...SAMPLE_ORDER, locale }, null, origin);
        break;
      case "review_alert":
        html = getAdminNewReviewAlertHtml(SAMPLE_REVIEW);
        break;
      case "order_confirmation":
      default:
        html = getOrderConfirmationHtml(SAMPLE_ORDER, locale);
        break;
    }

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/admin/email-preview
 * Sends a real test email to an address specified by the user
 */
export async function POST(request) {
  try {
    const url = new URL(request.url);
    const origin = url.origin;
    const body = await request.json();
    const { type, recipientEmail, locale = "en" } = body || {};

    if (!recipientEmail || !recipientEmail.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: "RESEND_API_KEY is not configured in .env.local.",
      });
    }

    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    let subject = "";
    let html = "";

    switch (type) {
      case "shipping":
        subject = `[TEST] 🚚 Your Wall Bed King Order #${SAMPLE_SHIPPING.order.id} Has Shipped!`;
        html = getShippingNotificationHtml(
          SAMPLE_SHIPPING.order,
          SAMPLE_SHIPPING.trackingNumber,
          SAMPLE_SHIPPING.carrier
        );
        break;
      case "admin_alert":
        subject = `[TEST] 🚨 NEW ORDER RECEIVED: #${SAMPLE_ORDER.id} (£${SAMPLE_ORDER.total_amount.toFixed(2)})`;
        html = getAdminOrderAlertHtml({ ...SAMPLE_ORDER, customer_email: recipientEmail });
        break;
      case "contact":
        subject = `[TEST] 📩 Contact Form Submission from ${SAMPLE_CONTACT.name}`;
        html = getContactFormHtml(SAMPLE_CONTACT);
        break;
      case "review_request": {
        const i18n = REVIEW_REQUEST_I18N[locale.toLowerCase()] || REVIEW_REQUEST_I18N.en;
        subject = `[TEST] ${i18n.headline} (Order #${SAMPLE_ORDER.id})`;
        html = getReviewRequestHtml(
          { ...SAMPLE_ORDER, customer_email: recipientEmail, locale },
          null,
          origin
        );
        break;
      }
      case "review_alert":
        subject = `[TEST] ⭐ NEW REVIEW SUBMITTED: ${SAMPLE_REVIEW.author_name} (${SAMPLE_REVIEW.rating} Stars)`;
        html = getAdminNewReviewAlertHtml(SAMPLE_REVIEW);
        break;
      case "order_confirmation":
      default: {
        const i18n = CONFIRMATION_I18N[locale.toLowerCase()] || CONFIRMATION_I18N.en;
        subject = `[TEST] ${i18n.subjectPrefix} - #${SAMPLE_ORDER.id}`;
        html = getOrderConfirmationHtml(
          { ...SAMPLE_ORDER, customer_email: recipientEmail },
          locale
        );
        break;
      }
    }

    const data = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [recipientEmail],
      subject,
      html,
    });

    if (data?.error) {
      return NextResponse.json(
        {
          success: false,
          error: data.error.message || "Failed to send email via Resend.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Test email (${type} - ${locale.toUpperCase()}) sent successfully to ${recipientEmail}!`,
      data,
    });
  } catch (error) {
    console.error("[Test Email Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to send test email.",
      },
      { status: 500 }
    );
  }
}
