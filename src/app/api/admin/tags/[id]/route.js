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

const getLocalTags = () => {
  const filePath = path.join(process.cwd(), "src", "data", "tags.json");
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (err) {
    return [];
  }
};

const saveLocalTags = (tags) => {
  const filePath = path.join(process.cwd(), "src", "data", "tags.json");
  fs.writeFileSync(filePath, JSON.stringify(tags, null, 2), "utf-8");
};

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const local = getLocalTags();
    const found = local.find((t) => t.id === id || t.slug === id);

    if (SUPABASE_URL && SERVICE_KEY) {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/tags?id=eq.${id}`, {
          headers,
          cache: "no-store",
        });
        if (res.ok) {
          const rows = await res.json();
          if (rows && rows.length > 0) {
            return NextResponse.json({ success: true, tag: rows[0] });
          }
        }
      } catch (err) {
        console.warn("Supabase tag fetch error:", err.message);
      }
    }

    if (found) {
      return NextResponse.json({ success: true, tag: found });
    }

    return NextResponse.json(
      { success: false, error: "Tag not found" },
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

    // Update local JSON
    const local = getLocalTags();
    const idx = local.findIndex((t) => t.id === id || t.slug === id);
    let updatedTag = updates;

    if (idx !== -1) {
      local[idx] = { ...local[idx], ...updates };
      updatedTag = local[idx];
      saveLocalTags(local);
    }

    // Update Supabase
    let sbSuccess = false;
    if (SUPABASE_URL && SERVICE_KEY) {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/tags?id=eq.${id}`, {
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
          if (rows?.[0]) updatedTag = { ...updatedTag, ...rows[0] };
        }
      } catch (err) {
        console.warn("Supabase tag patch error:", err.message);
      }
    }

    return NextResponse.json({
      success: true,
      tag: updatedTag,
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
    const local = getLocalTags();
    const filtered = local.filter((t) => t.id !== id && t.slug !== id);
    saveLocalTags(filtered);

    // Remove from Supabase
    if (SUPABASE_URL && SERVICE_KEY) {
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/tags?id=eq.${id}`, {
          method: "DELETE",
          headers,
        });
      } catch (err) {
        console.warn("Supabase tag delete error:", err.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Tag ${id} removed successfully`,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
