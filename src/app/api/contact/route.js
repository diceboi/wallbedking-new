import { NextResponse } from "next/server";
import { sendContactFormEmail } from "@/lib/email";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email and message are required." },
        { status: 400 }
      );
    }

    const result = await sendContactFormEmail({ name, email, phone, subject, message });

    if (!result.success) {
      console.error("Failed to send contact email:", result.error);
      return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Inquiry sent successfully." });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
