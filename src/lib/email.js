/**
 * Centralized Email Notification Utility
 * 
 * Note: Currently in development/pre-configuration mode.
 * Set RESEND_API_KEY in .env.local to activate automated outbound emails.
 */

export async function sendOrderConfirmationEmail(order) {
  if (!order || !order.customer_email) return { success: false, error: "Missing recipient" };

  console.log(`[Email Service: Mock] Order Confirmation for ${order.id} to ${order.customer_email}`);

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      success: true,
      mode: "mock",
      message: "Email logged in dev mode (RESEND_API_KEY not configured).",
    };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || "Wall Bed King <orders@wallbedking.co.uk>",
      to: [order.customer_email],
      subject: `Wall Bed King Order Confirmation - ${order.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #111; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #eaeaea;">
          <h1 style="color: #1a1a1a; font-size: 24px;">Thank you for your order, ${order.customer_name}!</h1>
          <p style="color: #666; font-size: 14px;">Your order <strong>${order.id}</strong> has been received and our dispatch team is preparing your precision-engineered wall bed.</p>
          <div style="background-color: #f9f9f9; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 13px;"><strong>Total Paid:</strong> £${Number(order.total_amount).toFixed(2)}</p>
            <p style="margin: 8px 0 0; font-size: 13px;"><strong>Delivery Method:</strong> ${order.delivery_label || "Standard UK Delivery"}</p>
          </div>
          <p style="color: #888; font-size: 12px;">Wall Bed King • Precision Space-Saving Furniture • 30-Year Mechanism Guarantee</p>
        </div>
      `,
    });

    return { success: true, data };
  } catch (error) {
    console.error("[Email Service Error]", error);
    return { success: false, error: error.message };
  }
}

export async function sendShippingNotificationEmail(order, trackingNumber, carrier) {
  if (!order || !order.customer_email) return { success: false, error: "Missing recipient" };

  console.log(`[Email Service: Mock] Dispatch Notification for ${order.id} (Tracking: ${trackingNumber}) to ${order.customer_email}`);

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      success: true,
      mode: "mock",
      message: "Shipping notification logged in dev mode (RESEND_API_KEY not configured).",
    };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || "Wall Bed King <shipping@wallbedking.co.uk>",
      to: [order.customer_email],
      subject: `Your Wall Bed King Order ${order.id} Has Been Dispatched!`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #111; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #eaeaea;">
          <h1 style="color: #1a1a1a; font-size: 24px;">Your Order is On Its Way!</h1>
          <p style="color: #666; font-size: 14px;">Great news! Your wall bed order <strong>${order.id}</strong> has been carefully packed and handed over to our courier.</p>
          <div style="background-color: #f9f9f9; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 13px;"><strong>Carrier:</strong> ${carrier || "DX Freight"}</p>
            <p style="margin: 8px 0 0; font-size: 13px;"><strong>Tracking Number:</strong> ${trackingNumber}</p>
          </div>
          <p style="color: #666; font-size: 13px;">The courier will contact you prior to delivery with an exact delivery window.</p>
          <p style="color: #888; font-size: 12px; margin-top: 24px;">Wall Bed King Support: 0800 028 8940</p>
        </div>
      `,
    });

    return { success: true, data };
  } catch (error) {
    console.error("[Email Service Error]", error);
    return { success: false, error: error.message };
  }
}
