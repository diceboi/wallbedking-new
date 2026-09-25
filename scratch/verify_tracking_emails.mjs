import { getShippingNotificationHtml, getCarrierTrackingUrl, isOwnDelivery } from "../src/lib/email.js";

const sampleOrder = {
  id: "WBK-842190",
  customer_name: "Szabolcs Szász",
  customer_email: "szasz.szabolcs1995@gmail.com",
};

// Test 1: UPS
console.log("=== TEST 1: UPS ===");
const upsUrl = getCarrierTrackingUrl("UPS", "1Z9999999999999999");
console.log("UPS Tracking URL:", upsUrl);
const upsHtml = getShippingNotificationHtml(sampleOrder, "1Z9999999999999999", "UPS");
console.log("UPS HTML has Track button:", upsHtml.includes("Track Your Parcel on UPS"));
console.log("UPS HTML has tracking link:", upsHtml.includes(upsUrl));

// Test 2: DHL
console.log("\n=== TEST 2: DHL ===");
const dhlUrl = getCarrierTrackingUrl("DHL", "1234567890");
console.log("DHL Tracking URL:", dhlUrl);
const dhlHtml = getShippingNotificationHtml(sampleOrder, "1234567890", "DHL");
console.log("DHL HTML has Track button:", dhlHtml.includes("Track Your Parcel on DHL"));
console.log("DHL HTML has tracking link:", dhlHtml.includes(dhlUrl));

// Test 3: Own Delivery
console.log("\n=== TEST 3: Own Delivery ===");
const isOwn = isOwnDelivery("Own Delivery");
console.log("isOwnDelivery('Own Delivery'):", isOwn);
const ownHtml = getShippingNotificationHtml(sampleOrder, "", "Own Delivery");
console.log("Own Delivery HTML has dedicated fleet box:", ownHtml.includes("Wall Bed King Dedicated Delivery"));
console.log("Own Delivery HTML has NO track button:", !ownHtml.includes("Track Your Parcel"));
console.log("Own Delivery HTML has NO tracking number label:", !ownHtml.includes("Tracking / Waybill Number"));
