/**
 * Centralized Email Notification Utility using Resend
 * 
 * Configured sender: notifications.wallbedking.com
 * Set RESEND_API_KEY in .env.local to activate automated outbound emails.
 */

const DEFAULT_FROM = process.env.EMAIL_FROM || "Wall Bed King <orders@notifications.wallbedking.com>";
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "orders@wallbedking.com";

/**
 * 1. Customer Order Confirmation Email
 */
export async function sendOrderConfirmationEmail(order) {
  if (!order || !order.customer_email) return { success: false, error: "Missing recipient" };

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[Email Service: Mock] Order Confirmation for ${order.id} to ${order.customer_email}`);
    return {
      success: true,
      mode: "mock",
      message: "Email logged in dev mode (RESEND_API_KEY not configured).",
    };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    const itemsList = (order.items || [])
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-size: 13px; color: #111;">
            <strong>${item.name || "Wall Bed Item"}</strong> ${item.variant ? `<br><span style="color:#777; font-size:11px;">${item.variant}</span>` : ""}
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-size: 13px; color: #111; text-align: center;">
            ${item.quantity || 1}
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-size: 13px; color: #111; text-align: right;">
            £${Number(item.price || 0).toFixed(2)}
          </td>
        </tr>
      `
      )
      .join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f7f7f7; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 6px; overflow: hidden; border: 1px solid #e5e5e5; }
            .header { background: #111111; color: #ffffff; padding: 28px 24px; text-align: center; }
            .header h1 { margin: 0; font-size: 22px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; }
            .header p { margin: 6px 0 0; font-size: 12px; color: #b89c66; text-transform: uppercase; letter-spacing: 1.5px; }
            .content { padding: 28px 24px; color: #333333; }
            .order-box { background: #fbf9f8; border: 1px solid #eae5e0; padding: 16px; border-radius: 4px; margin: 20px 0; }
            .table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            .footer { background: #fafafa; border-top: 1px solid #eeeeee; padding: 20px; text-align: center; font-size: 11px; color: #888888; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Wall Bed King</h1>
              <p>Order Confirmation</p>
            </div>
            <div class="content">
              <h2 style="font-size: 18px; color: #111; margin-top: 0;">Thank you for your order, ${order.customer_name || "Customer"}!</h2>
              <p style="font-size: 14px; color: #555; line-height: 1.5;">
                We have received your order <strong style="color: #111;">#${order.id}</strong>. Our engineering and dispatch team is now preparing your space-saving solution.
              </p>
              
              <div class="order-box">
                <table style="width:100%; font-size: 13px;">
                  <tr>
                    <td><strong>Order Number:</strong> #${order.id}</td>
                    <td style="text-align: right;"><strong>Date:</strong> ${new Date().toLocaleDateString("en-GB")}</td>
                  </tr>
                  <tr>
                    <td><strong>Delivery Address:</strong> ${order.shipping_address?.city || ""}, ${order.shipping_address?.country || "UK"}</td>
                    <td style="text-align: right;"><strong>Payment:</strong> ${order.payment_method || "Online Card"}</td>
                  </tr>
                </table>
              </div>

              <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #111; margin-top: 24px;">Order Summary</h3>
              <table class="table">
                <thead>
                  <tr style="border-bottom: 2px solid #111; text-align: left; font-size: 11px; text-transform: uppercase; color: #777;">
                    <th style="padding-bottom: 8px;">Item</th>
                    <th style="padding-bottom: 8px; text-align: center;">Qty</th>
                    <th style="padding-bottom: 8px; text-align: right;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsList || '<tr><td colspan="3" style="padding:12px 0;">Murphy Bed & Accessories</td></tr>'}
                </tbody>
              </table>

              <div style="text-align: right; margin-top: 16px; font-size: 14px; border-top: 2px solid #111; padding-top: 12px;">
                <strong>Total Amount Paid: <span style="font-size: 18px; color: #111;">£${Number(order.total_amount || 0).toFixed(2)}</span></strong>
              </div>
            </div>
            <div class="footer">
              <p style="margin: 0 0 6px;">Wall Bed King • Premium Space-Saving Furniture • 30-Year Mechanism Guarantee</p>
              <p style="margin: 0;">Need assistance? Contact customer support at <a href="mailto:support@wallbedking.com" style="color: #b89c66;">support@wallbedking.com</a> or call 0800 028 8940.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const data = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [order.customer_email],
      subject: `Wall Bed King Order Confirmation - #${order.id}`,
      html: htmlContent,
    });

    // Also trigger admin notification in parallel
    await sendAdminOrderAlert(order).catch((err) => console.error("Admin order email alert failed:", err));

    return { success: true, data };
  } catch (error) {
    console.error("[Email Service Error]", error);
    return { success: false, error: error.message };
  }
}

/**
 * 2. Admin Alert Email for New Incoming Order
 */
export async function sendAdminOrderAlert(order) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { success: false, error: "No API Key" };

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    const data = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [ADMIN_EMAIL],
      subject: `🚨 NEW ORDER RECEIVED: #${order.id} (£${Number(order.total_amount || 0).toFixed(2)})`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>New Order #${order.id}</h2>
          <p><strong>Customer:</strong> ${order.customer_name} (${order.customer_email})</p>
          <p><strong>Phone:</strong> ${order.customer_phone || "N/A"}</p>
          <p><strong>Total:</strong> £${Number(order.total_amount || 0).toFixed(2)}</p>
          <p><strong>Payment Method:</strong> ${order.payment_method}</p>
          <p>Check admin dashboard to process this order.</p>
        </div>
      `,
    });

    return { success: true, data };
  } catch (error) {
    console.error("[Admin Email Error]", error);
    return { success: false, error: error.message };
  }
}

/**
 * 3. Customer Shipping / Tracking Notification Email
 */
export async function sendShippingNotificationEmail(order, trackingNumber, carrier) {
  if (!order || !order.customer_email) return { success: false, error: "Missing recipient" };

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[Email Service: Mock] Dispatch Notification for ${order.id} to ${order.customer_email}`);
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
      from: DEFAULT_FROM,
      to: [order.customer_email],
      subject: `Your Wall Bed King Order #${order.id} Has Been Dispatched!`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #111; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #eaeaea; border-radius: 6px;">
          <div style="background: #111; color: #fff; padding: 20px; text-align: center; border-radius: 4px 4px 0 0;">
            <h1 style="margin: 0; font-size: 20px; font-weight: 600; text-transform: uppercase;">Wall Bed King</h1>
            <p style="margin: 4px 0 0; font-size: 11px; color: #b89c66;">Dispatch Notification</p>
          </div>
          <div style="padding: 24px 12px;">
            <h2 style="color: #1a1a1a; font-size: 20px; margin-top: 0;">Your Order is On Its Way!</h2>
            <p style="color: #555; font-size: 14px; line-height: 1.5;">Great news! Your wall bed order <strong>#${order.id}</strong> has been carefully packed and handed over to our courier service.</p>
            <div style="background-color: #fcfbfa; padding: 18px; margin: 20px 0; border: 1px solid #e0dad3; border-radius: 4px;">
              <p style="margin: 0; font-size: 14px;"><strong>Courier / Carrier:</strong> ${carrier || "DX Freight"}</p>
              <p style="margin: 10px 0 0; font-size: 14px;"><strong>Tracking Number:</strong> <span style="font-size: 16px; color: #111; font-weight: bold;">${trackingNumber}</span></p>
            </div>
            <p style="color: #666; font-size: 13px;">The courier will contact you prior to delivery with an exact time slot.</p>
          </div>
          <div style="border-top: 1px solid #eee; padding-top: 16px; font-size: 11px; color: #888; text-align: center;">
            <p style="margin: 0;">Wall Bed King Support • Freephone: 0800 028 8940 • Email: support@wallbedking.com</p>
          </div>
        </div>
      `,
    });

    return { success: true, data };
  } catch (error) {
    console.error("[Email Service Error]", error);
    return { success: false, error: error.message };
  }
}

/**
 * 4. Contact Form Submission Email
 */
export async function sendContactFormEmail({ name, email, phone, subject, message }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { success: false, error: "No API Key" };

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    const data = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [ADMIN_EMAIL],
      replyTo: email,
      subject: `📩 Contact Form Submission: ${subject} from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; max-width: 600px;">
          <h3>New Inquiry via Contact Page</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
          <p><strong>Topic:</strong> ${subject}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;">
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap; background: #f9f9f9; padding: 12px; font-size: 13px;">${message}</p>
        </div>
      `,
    });

    return { success: true, data };
  } catch (error) {
    console.error("[Contact Email Error]", error);
    return { success: false, error: error.message };
  }
}

