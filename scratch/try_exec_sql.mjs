import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function tryExecSql() {
  const sql = `
    CREATE TABLE IF NOT EXISTS public.product_waitlist (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID,
      customer_email TEXT NOT NULL,
      product_id INT,
      product_slug TEXT NOT NULL,
      product_name TEXT NOT NULL,
      product_image TEXT,
      variant_name TEXT,
      options JSONB DEFAULT '{}'::jsonb,
      locale TEXT DEFAULT 'en',
      status TEXT DEFAULT 'waiting',
      notified_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  // Try /pg/query or /rest/v1/rpc
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ query: sql }),
    });
    console.log("RPC exec_sql status:", res.status);
    const txt = await res.text();
    console.log("RPC exec_sql response:", txt);
  } catch (e) {
    console.log("RPC failed:", e.message);
  }
}

tryExecSql();
