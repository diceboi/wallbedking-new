import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import catalog from "@/data/products-catalog.json";

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
    console.error("Error reading local tags.json:", err);
    return [];
  }
};

const saveLocalTags = (tags) => {
  const filePath = path.join(process.cwd(), "src", "data", "tags.json");
  fs.writeFileSync(filePath, JSON.stringify(tags, null, 2), "utf-8");
};

// Calculate product counts per tag
const enrichTagCounts = (tags) => {
  const counts = {};
  if (Array.isArray(catalog)) {
    catalog.forEach((p) => {
      if (Array.isArray(p.tags)) {
        p.tags.forEach((tagId) => {
          counts[tagId] = (counts[tagId] || 0) + 1;
        });
      }
    });
  }
  return tags.map((t) => ({
    ...t,
    count: counts[t.id] || counts[t.slug] || 0,
  }));
};

export async function GET() {
  try {
    let tags = [];
    let fromSupabase = false;

    // Try Supabase first
    if (SUPABASE_URL && SERVICE_KEY) {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/tags?select=*&order=name.asc`,
          { headers, cache: "no-store" }
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            tags = data;
            fromSupabase = true;
          }
        }
      } catch (sbErr) {
        console.warn("[Admin Tags API] Supabase query warning:", sbErr.message);
      }
    }

    // Fallback to local tags.json
    if (tags.length === 0) {
      tags = getLocalTags();
    }

    const enriched = enrichTagCounts(tags);

    return NextResponse.json({
      success: true,
      tags: enriched,
      count: enriched.length,
      fromSupabase,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, color, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Tag name is required." },
        { status: 400 }
      );
    }

    const tagSlug = (body.id || body.slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const newTag = {
      id: tagSlug,
      name: name.trim(),
      slug: tagSlug,
      icon: body.icon || "tag",
      color: color || "#090A0A",
      description: description || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save to local JSON
    const local = getLocalTags();
    const existingIdx = local.findIndex((t) => t.id === tagSlug);
    if (existingIdx !== -1) {
      local[existingIdx] = { ...local[existingIdx], ...newTag };
    } else {
      local.push(newTag);
    }
    saveLocalTags(local);

    // Try persisting to Supabase
    let sbSuccess = false;
    if (SUPABASE_URL && SERVICE_KEY) {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/tags`, {
          method: "POST",
          headers: {
            ...headers,
            Prefer: "resolution=merge-duplicates,return=representation",
          },
          body: JSON.stringify(newTag),
        });
        if (res.ok) {
          sbSuccess = true;
        } else {
          console.warn("[Admin Tags API] Supabase POST status:", res.status, await res.text());
        }
      } catch (sbErr) {
        console.warn("[Admin Tags API] Supabase POST warning:", sbErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      tag: newTag,
      syncedWithSupabase: sbSuccess,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
