import { NextResponse } from "next/server";
import { sendContactFormEmail } from "@/lib/email";
import { verifyFormProtection } from "@/lib/turnstile";

export async function POST(req) {
  try {
    const body = await req.json();

    const protection = await verifyFormProtection({
      request: req,
      body,
      formType: "contact",
      maxRequests: 5,
      windowMs: 10 * 60 * 1000,
      minFillMs: 600,
    });

    if (protection.silentDrop) {
      return NextResponse.json({
        success: true,
        message: "Inquiry sent successfully.",
      });
    }

    if (!protection.ok) {
      return NextResponse.json(
        { error: protection.error || "Security verification failed." },
        { status: protection.status || 400 }
      );
    }

    const { name, email, phone, subject, message } = body || {};

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email and message are required." },
        { status: 400 }
      );
    }

    const result = await sendContactFormEmail({
      name: String(name).trim(),
      email: String(email).trim(),
      phone: phone ? String(phone).trim() : "",
      subject: subject ? String(subject).trim() : "General Inquiry",
      message: String(message).trim(),
    });

    if (!result.success) {
      console.error("[Contact API] Failed to send contact email:", result.error);
      return NextResponse.json(
        { error: result.error || "Failed to send email." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Inquiry sent successfully." });
  } catch (err) {
    console.error("[Contact API] Unhandled error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
