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

const getLocalCategories = () => {
  const filePath = path.join(process.cwd(), "src", "data", "categories.json");
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (err) {
    return [];
  }
};

const saveLocalCategories = (categories) => {
  try {
    const filePath = path.join(process.cwd(), "src", "data", "categories.json");
    fs.writeFileSync(filePath, JSON.stringify(categories, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Categories ID API] File is read-only (serverless environment):", err.message);
  }
};

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const local = getLocalCategories();
    const found = local.find((c) => c.id === id || c.slug === id);

    if (SUPABASE_URL && SERVICE_KEY) {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/categories?id=eq.${id}`, {
          headers,
          cache: "no-store",
        });
        if (res.ok) {
          const rows = await res.json();
          if (rows && rows.length > 0) {
            return NextResponse.json({ success: true, category: rows[0] });
          }
        }
      } catch (err) {
        console.warn("Supabase fetch error:", err.message);
      }
    }

    if (found) {
      return NextResponse.json({ success: true, category: found });
    }

    return NextResponse.json(
      { success: false, error: "Category not found" },
      { status: 404 }
    );
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updates = {
      ...body,
      updated_at: new Date().toISOString(),
    };

    if (updates.subcategories && typeof updates.subcategories === "string") {
      updates.subcategories = updates.subcategories
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    // Update local JSON
    const local = getLocalCategories();
    const idx = local.findIndex((c) => c.id === id || c.slug === id);
    let updatedCat = updates;

    if (idx !== -1) {
      local[idx] = { ...local[idx], ...updates };
      updatedCat = local[idx];
      saveLocalCategories(local);
    }

    // Update Supabase
    let sbSuccess = false;
    if (SUPABASE_URL && SERVICE_KEY) {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/categories?id=eq.${id}`, {
          method: "PATCH",
          headers: {
            ...headers,
            Prefer: "return=representation",
          },
          body: JSON.stringify(updates),
        });
        if (res.ok) {
          sbSuccess = true;
          const rows = await res.json();
          if (rows?.[0]) updatedCat = { ...updatedCat, ...rows[0] };
        }
      } catch (err) {
        console.warn("Supabase patch error:", err.message);
      }
    }

    return NextResponse.json({
      success: true,
      category: updatedCat,
      syncedWithSupabase: sbSuccess,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Remove from local JSON
    const local = getLocalCategories();
    const filtered = local.filter((c) => c.id !== id && c.slug !== id);
    saveLocalCategories(filtered);

    // Remove from Supabase
    if (SUPABASE_URL && SERVICE_KEY) {
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/categories?id=eq.${id}`, {
          method: "DELETE",
          headers,
        });
      } catch (err) {
        console.warn("Supabase delete error:", err.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Category ${id} removed successfully`,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
