import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function testAdminPatch() {
  console.log("Sending PATCH request to http://localhost:3000/api/admin/orders...");
  try {
    const res = await fetch("http://localhost:3000/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: "WBK-842190",
        status: "shipped",
        trackingNumber: "DXF-99882211GB",
        trackingCarrier: "DX Freight",
        adminNotes: "Test dispatch triggered for szasz.szabolcs1995@gmail.com",
      }),
    });

    const data = await res.json();
    console.log("API response status:", res.status);
    console.log("API response data:", data);
  } catch (err) {
    console.error("Fetch error:", err.message);
  }
}

testAdminPatch();
