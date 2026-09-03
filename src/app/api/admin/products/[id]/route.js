import { NextResponse } from "next/server";

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

    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
      method: "PATCH",
      headers: {
        ...headers,
        Prefer: "return=representation",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ success: false, error: err }, { status: res.status });
    }

    const updated = await res.json();
    return NextResponse.json({
      success: true,
      product: updated[0] || updated,
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
