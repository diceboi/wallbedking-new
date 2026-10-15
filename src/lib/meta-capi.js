import crypto from "crypto";

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "1241080515923812";
const META_CAPI_ACCESS_TOKEN =
  process.env.META_CAPI_ACCESS_TOKEN ||
  "EAAVFYJQxIqwBRy11kfxemrKPhD8xCmxR5r7noxXZCupFGLGMJ99X0UvWkFIQ1vp3syFiXpoeIHtDaCUGLEbVOonHHB8jFlo5FyfUCwlLP81HBE7XDTyJxTZA2AZBNJJGfqUrTO4FISTL1FURadtH0ZAFHWRTkHXO4WBSBpL4S4AgNAB3AV5d72eGMZC5V074yWQZDZD";

/**
 * Hash string using SHA-256 according to Meta CAPI specification
 */
function sha256(val) {
  if (!val) return "";
  return crypto.createHash("sha256").update(val.trim().toLowerCase()).digest("hex");
}

/**
 * Sends a server-side Purchase event to Meta Conversions API (CAPI)
 * Deduplicated with browser-side pixel via identical `event_id` (orderId)
 */
export async function sendMetaCapiPurchase({
  orderId,
  amount,
  currency = "EUR",
  email = "",
  phone = "",
  firstName = "",
  lastName = "",
  clientIp = "",
  userAgent = "",
  sourceUrl = "https://www.wallbedking.com",
}) {
  if (!orderId || !amount) {
    console.warn("⚠️ Meta CAPI: Missing orderId or amount, skipping event.");
    return false;
  }

  try {
    const userData = {};

    if (email && email !== "MISSING") {
      userData.em = [sha256(email)];
    }

    if (phone && phone !== "MISSING") {
      const cleanPhone = phone.replace(/[^0-9]/g, "");
      if (cleanPhone) {
        userData.ph = [sha256(cleanPhone)];
      }
    }

    if (firstName && firstName !== "MISSING") {
      userData.fn = [sha256(firstName)];
    }

    if (lastName && lastName !== "MISSING") {
      userData.ln = [sha256(lastName)];
    }

    if (clientIp) {
      userData.client_ip_address = clientIp;
    }

    if (userAgent) {
      userData.client_user_agent = userAgent;
    }

    const eventData = {
      event_name: "Purchase",
      event_time: Math.floor(Date.now() / 1000),
      event_id: String(orderId), // Matches browser fbq Purchase eventID
      event_source_url: sourceUrl,
      action_source: "website",
      user_data: userData,
      custom_data: {
        currency: currency.toUpperCase(),
        value: Number(amount),
      },
    };

    const apiUrl = `https://graph.facebook.com/v19.0/${META_PIXEL_ID}/events?access_token=${META_CAPI_ACCESS_TOKEN}`;

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [eventData] }),
    });

    const result = await res.json();
    if (result.events_received) {
      console.log(`✅ Meta CAPI: Purchase event sent successfully for order #${orderId}`);
      return true;
    } else {
      console.warn("⚠️ Meta CAPI warning response:", result);
      return false;
    }
  } catch (err) {
    console.warn("❌ Meta CAPI request error:", err);
    return false;
  }
}
