import { NextResponse } from "next/server";

import fs from "fs";
import path from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Prevent overwriting id
    delete body.id;

    // Update local JSON catalog first so enriched data is persisted immediately
    try {
      const catalogPath = path.join(process.cwd(), "src", "data", "products-catalog.json");
      if (fs.existsSync(catalogPath)) {
        const raw = fs.readFileSync(catalogPath, "utf-8");
        const list = JSON.parse(raw);
        const idx = list.findIndex((p) => String(p.id) === String(id));
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...body, id: Number(id) };
          fs.writeFileSync(catalogPath, JSON.stringify(list, null, 2), "utf-8");
        }
      }
    } catch (localErr) {
      console.warn("Could not sync local products-catalog.json:", localErr.message);
    }

    let res = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
      method: "PATCH",
      headers: {
        ...headers,
        Prefer: "return=representation",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      // If column does not exist yet in Supabase table (before SQL migration)
      if (err.includes("does not exist") || err.includes("Could not find")) {
        const safePayload = { ...body };
        delete safePayload.sku;
        delete safePayload.ean_uk;
        delete safePayload.ean_us;
        delete safePayload.ean_de;
        delete safePayload.ean_fr;
        delete safePayload.ean_es;
        delete safePayload.ean_it;
        delete safePayload.ean_pt;
        delete safePayload.pack_1;
        delete safePayload.pack_2;
        delete safePayload.pack_3;
        delete safePayload.pack_4;

        res = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
          method: "PATCH",
          headers: {
            ...headers,
            Prefer: "return=representation",
          },
          body: JSON.stringify(safePayload),
        });
      } else {
        return NextResponse.json({ success: false, error: err }, { status: res.status });
      }
    }

    const updated = await res.json();
    const finalProduct = { ...body, ...(updated[0] || updated), id: Number(id) };
    return NextResponse.json({
      success: true,
      product: finalProduct,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
      method: "DELETE",
      headers,
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ success: false, error: err }, { status: res.status });
    }

    return NextResponse.json({
      success: true,
      message: `Product ${id} deleted successfully.`,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
