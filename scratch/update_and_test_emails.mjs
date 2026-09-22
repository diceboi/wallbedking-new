import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: class DummyWS {} },
});

// Import email sending function
import { sendOrderConfirmationEmail } from "../src/lib/email.js";

async function updateAndSend() {
  console.log("Updating Order WBK-842190 for szasz.szabolcs1995@gmail.com...");
  const { data: order1, error: err1 } = await supabase
    .from("orders")
    .update({
      customer_name: "Szabolcs Szász",
      customer_email: "szasz.szabolcs1995@gmail.com",
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
    })
    .eq("id", "WBK-842190")
    .select()
    .single();

  if (err1) {
    console.error("Error updating order 1:", err1);
  } else {
    console.log("Order 1 updated successfully. Sending confirmation email...");
    const res1 = await sendOrderConfirmationEmail(order1);
    console.log("Result for szasz.szabolcs1995@gmail.com:", res1);
  }

  console.log("\nUpdating Order WBK-629511 for diceboii13@gmail.com...");
  const { data: order2, error: err2 } = await supabase
    .from("orders")
    .update({
      customer_name: "Diceboii (Test Account)",
      customer_email: "diceboii13@gmail.com",
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
    })
    .eq("id", "WBK-629511")
    .select()
    .single();

  if (err2) {
    console.error("Error updating order 2:", err2);
  } else {
    console.log("Order 2 updated successfully. Sending confirmation email...");
    const res2 = await sendOrderConfirmationEmail(order2);
    console.log("Result for diceboii13@gmail.com:", res2);
  }
}

updateAndSend();
