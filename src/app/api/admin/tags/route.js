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
    console.error("Error reading local tags.json:", err);
    return [];
  }
};

const saveLocalTags = (tags) => {
  try {
    const filePath = path.join(process.cwd(), "src", "data", "tags.json");
    fs.writeFileSync(filePath, JSON.stringify(tags, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Tags API] File is read-only (serverless environment):", err.message);
  }
};

export async function GET() {
  try {
    let tags = [];
    let fromSupabase = false;

    // Fetch tags from Supabase
    if (SUPABASE_URL && SERVICE_KEY) {
      try {
        const [tagsRes, prodsRes] = await Promise.all([
          fetch(`${SUPABASE_URL}/rest/v1/tags?select=*&order=name.asc`, { headers, cache: "no-store" }),
          fetch(`${SUPABASE_URL}/rest/v1/products?select=tags`, { headers, cache: "no-store" }),
        ]);

        if (tagsRes.ok) {
          const data = await tagsRes.json();
          if (Array.isArray(data) && data.length > 0) {
            tags = data;
            fromSupabase = true;
          }
        }

        let counts = {};
        if (prodsRes.ok) {
          const prods = await prodsRes.json();
          if (Array.isArray(prods)) {
            prods.forEach((p) => {
              if (Array.isArray(p.tags)) {
                p.tags.forEach((tId) => {
                  counts[tId] = (counts[tId] || 0) + 1;
                });
              }
            });
          }
        }

        if (tags.length > 0) {
          const enriched = tags.map((t) => ({
            ...t,
            count: counts[t.id] || counts[t.slug] || 0,
          }));
          return NextResponse.json({
            success: true,
            tags: enriched,
            count: enriched.length,
            fromSupabase,
          });
        }
      } catch (sbErr) {
        console.warn("[Admin Tags API] Supabase query warning:", sbErr.message);
      }
    }

    // Fallback to local tags.json
    tags = getLocalTags();
    return NextResponse.json({
      success: true,
      tags: tags.map((t) => ({ ...t, count: 0 })),
      count: tags.length,
      fromSupabase: false,
    });

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
