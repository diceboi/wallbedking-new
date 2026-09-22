import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: class DummyWS {} },
});

async function listProducts() {
  const { data, error } = await supabase.from("products").select("id, name, slug, price_gbp, image, category").ilike("category", "%mattress%").limit(2);
  if (error) {
    console.error("Error fetching products:", error);
  } else {
    console.log("Found mattress:", data);
  }
}

listProducts();
