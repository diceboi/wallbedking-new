async function testCarriers() {
  console.log("Testing UPS dispatch with tracking link...");
  const res1 = await fetch("http://localhost:3000/api/admin/orders", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId: "WBK-842190",
      status: "shipped",
      trackingCarrier: "UPS",
      trackingNumber: "1Z9999999999999999",
      adminNotes: "Dispatched via UPS Express with live tracking link.",
    }),
  });
  const data1 = await res1.json();
  console.log("UPS dispatch result:", data1);

  console.log("\nTesting Own Delivery (Saját kiszállítás) without tracking link...");
  const res2 = await fetch("http://localhost:3000/api/admin/orders", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId: "WBK-629511",
      status: "shipped",
      trackingCarrier: "Own Delivery",
      trackingNumber: "",
      adminNotes: "Dispatched with Wall Bed King dedicated van fleet.",
    }),
  });
  const data2 = await res2.json();
  console.log("Own Delivery dispatch result:", data2);
}

testCarriers();
