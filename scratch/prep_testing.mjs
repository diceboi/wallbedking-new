import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: class DummyWS {} },
});

async function prepareForUserTesting() {
  // Order 1: Set to paid so user can switch to shipped anytime
  await supabase
    .from("orders")
    .update({
      status: "paid",
      dispatched_at: null,
      customer_email: "szasz.szabolcs1995@gmail.com",
    })
    .eq("id", "WBK-842190");

  // Order 2: Set to processing so user can test dispatch for diceboii13@gmail.com
  await supabase
    .from("orders")
    .update({
      status: "processing",
      dispatched_at: null,
      customer_email: "diceboii13@gmail.com",
    })
    .eq("id", "WBK-629511");

  console.log("Both orders are armed and ready for status change testing in the admin UI!");
}

prepareForUserTesting();
