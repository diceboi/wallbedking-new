import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { line_items, cartId, success_url, cancel_url } = body;

    if (!line_items || !Array.isArray(line_items) || line_items.length === 0) {
      return NextResponse.json(
        { error: "Missing or empty line_items in request." },
        { status: 400 }
      );
    }

    // Forward request to Wall Bed King OnRender Stripe microservice with required headers
    const response = await fetch("https://stripe-uk.onrender.com/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Origin": "https://www.wallbedking.co.uk",
        "Referer": "https://www.wallbedking.co.uk/cart",
      },
      body: JSON.stringify({
        line_items,
        success_url: success_url || "https://www.wallbedking.co.uk/thanks",
        cancel_url: cancel_url || "https://www.wallbedking.co.uk/cart",
        cartId: cartId || "WBK-CART",
        collect_phone: true,
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      console.error("Stripe microservice response error:", data);
      return NextResponse.json(
        { error: data.error || `Payment gateway responded with status ${response.status}` },
        { status: response.status || 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Internal Stripe route error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error connecting to payment gateway" },
      { status: 500 }
    );
  }
}
