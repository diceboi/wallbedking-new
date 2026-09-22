import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function testDispatchEmail() {
  console.log("Testing dispatch email send via Resend...");
  const emailModule = await import("../src/lib/email.js");
  const testOrder = {
    id: "WBK-842190",
    customer_name: "Szabolcs Szász",
    customer_email: "szasz.szabolcs1995@gmail.com",
  };

  const res = await emailModule.sendShippingNotificationEmail(testOrder, "DXF-99882211GB", "DX Freight");
  console.log("Resend API response:", res);
}

testDispatchEmail();
