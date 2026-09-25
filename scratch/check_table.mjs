import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: class DummyWS {} },
});

async function checkWaitlistTable() {
  const { data, error } = await supabase.from("product_waitlist").select("*").limit(1);
  if (error) {
    console.log("Table check error (probably not created yet):", error.message);
  } else {
    console.log("Table exists! Rows count:", data?.length);
  }
}

checkWaitlistTable();
