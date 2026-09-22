import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: class DummyWS {} },
});

async function checkOrders() {
  const { data, error } = await supabase.from("orders").select("*").limit(3);
  if (error) {
    console.error("Error fetching orders:", error);
  } else {
    console.log("Current orders count:", data?.length);
    if (data?.length > 0) {
      console.log("Sample order keys:", Object.keys(data[0]));
      console.log("Sample order:", JSON.stringify(data[0], null, 2));
    }
  }
}

checkOrders();
