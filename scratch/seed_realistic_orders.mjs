import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: class DummyWS {} },
});

async function seedOrders() {
  const sampleOrders = [
    {
      id: "WBK-842190",
      user_id: null,
      status: "paid",
      payment_status: "paid",
      payment_method: "card",
      payment_id: "ch_3PxxxxxxTESTxxxxxx",
      customer_name: "Oliver Smith (Sample Buyer)",
      customer_email: "oliver.smith@example.co.uk",
      customer_phone: "+44 7700 900123",
      shipping_address: {
        firstName: "Oliver",
        lastName: "Smith",
        address1: "42 Richmond High Street",
        address2: "Flat 3B",
        city: "London",
        postcode: "TW9 1SX",
        country: "United Kingdom",
      },
      billing_address: {
        firstName: "Oliver",
        lastName: "Smith",
        address1: "42 Richmond High Street",
        address2: "Flat 3B",
        city: "London",
        postcode: "TW9 1SX",
        country: "United Kingdom",
      },
      items: [
        {
          id: 4,
          rawId: 4,
          title: "Small Double Vertical Classic Bed",
          slug: "small-double-vertical-classic-bed-120x190",
          price: 849,
          quantity: 1,
          itemTotal: 849,
          image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
          options: {
            size: "Small Double (120 x 190 cm)",
            finish: "Classic Metal Carbon Steel",
            mechanism: "Gas Piston Hydraulic",
          },
        },
        {
          id: 187,
          rawId: 187,
          title: "Single Luxury Mattress (25cm Pocket Sprung)",
          slug: "single-luxury-mattress-90x190x25",
          price: 499,
          quantity: 1,
          itemTotal: 499,
          image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
          options: {
            firmness: "Medium-Firm",
            depth: "25 cm",
          },
        },
      ],
      currency: "GBP",
      subtotal: 1348,
      discount_amount: 134.8,
      promo_code: "WBK10",
      shipping_amount: 0,
      vat_amount: 202.2,
      total_amount: 1213.2,
      delivery_option: "delivery_option_economy",
      delivery_label: "Free UK Mainland Delivery",
      delivery_message: "Estimated delivery within 2 - 4 weeks with two-man room of choice service",
      customer_notes: "Please call 1 hour before arrival. Building access code is 4920.",
      admin_notes: "Verified stock in Harlow warehouse. Piston kit box 1 and frame box 2 ready for dispatch.",
      tracking_number: "DXF-99882211GB",
      tracking_carrier: "DX Freight",
      created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35 mins ago
      updated_at: new Date().toISOString(),
    },
    {
      id: "WBK-629511",
      user_id: null,
      status: "pending",
      payment_status: "unpaid",
      payment_method: "paypal",
      customer_name: "Emma Watson",
      customer_email: "emma.watson@example.com",
      customer_phone: "+44 7890 123456",
      shipping_address: {
        firstName: "Emma",
        lastName: "Watson",
        address1: "15 Oxford Crescent",
        city: "Manchester",
        postcode: "M1 4BT",
        country: "United Kingdom",
      },
      billing_address: {
        firstName: "Emma",
        lastName: "Watson",
        address1: "15 Oxford Crescent",
        city: "Manchester",
        postcode: "M1 4BT",
        country: "United Kingdom",
      },
      items: [
        {
          id: 16,
          rawId: 16,
          title: "European Small Double Horizontal Classic Bed",
          slug: "european-small-double-horizontal-classic-bed-200x120",
          price: 849,
          quantity: 1,
          itemTotal: 849,
          image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
          options: {
            size: "European Small Double (200 x 120 cm)",
            orientation: "Horizontal",
          },
        },
      ],
      currency: "GBP",
      subtotal: 849,
      discount_amount: 0,
      promo_code: null,
      shipping_amount: 49,
      vat_amount: 149.67,
      total_amount: 898,
      delivery_option: "delivery_option_standard",
      delivery_label: "Standard Delivery",
      delivery_message: "Delivery within 1 - 2 weeks",
      customer_notes: "",
      admin_notes: "Awaiting PayPal confirmation.",
      tracking_number: null,
      tracking_carrier: "DX Freight",
      created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
      updated_at: new Date().toISOString(),
    },
  ];

  const { data, error } = await supabase.from("orders").insert(sampleOrders).select();
  if (error) {
    console.error("Error seeding orders:", error);
  } else {
    console.log("Successfully created test orders:", data.map((o) => o.id));
  }
}

seedOrders();
