import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: class DummyWS {} },
});

async function updateCustomerEmails() {
  console.log("Updating Order WBK-842190 to szasz.szabolcs1995@gmail.com...");
  const { data: o1, error: e1 } = await supabase
    .from("orders")
    .update({
      customer_name: "Szabolcs Szász",
      customer_email: "szasz.szabolcs1995@gmail.com",
      status: "paid", // Set to paid so you can switch it to "shipped" in admin
      shipping_address: {
        firstName: "Szabolcs",
        lastName: "Szász",
        address1: "42 Richmond High Street",
        address2: "Flat 3B",
        city: "London",
        postcode: "TW9 1SX",
        country: "United Kingdom",
      },
      billing_address: {
        firstName: "Szabolcs",
        lastName: "Szász",
        address1: "42 Richmond High Street",
        address2: "Flat 3B",
        city: "London",
        postcode: "TW9 1SX",
        country: "United Kingdom",
      },
      tracking_number: "DXF-99882211GB",
      tracking_carrier: "DX Freight",
    })
    .eq("id", "WBK-842190")
    .select()
    .single();

  if (e1) console.error("Error updating order 1:", e1);
  else console.log("Order 1 updated:", o1.id, "->", o1.customer_email, "status:", o1.status);

  console.log("Updating Order WBK-629511 to diceboii13@gmail.com...");
  const { data: o2, error: e2 } = await supabase
    .from("orders")
    .update({
      customer_name: "Diceboii",
      customer_email: "diceboii13@gmail.com",
      status: "processing", // Set to in production so you can switch it to "shipped" in admin
      shipping_address: {
        firstName: "Dice",
        lastName: "Boii",
        address1: "15 Oxford Crescent",
        city: "Manchester",
        postcode: "M1 4BT",
        country: "United Kingdom",
      },
      billing_address: {
        firstName: "Dice",
        lastName: "Boii",
        address1: "15 Oxford Crescent",
        city: "Manchester",
        postcode: "M1 4BT",
        country: "United Kingdom",
      },
      tracking_number: "DXF-77441100GB",
      tracking_carrier: "DX Freight",
    })
    .eq("id", "WBK-629511")
    .select()
    .single();

  if (e2) console.error("Error updating order 2:", e2);
  else console.log("Order 2 updated:", o2.id, "->", o2.customer_email, "status:", o2.status);
}

updateCustomerEmails();
