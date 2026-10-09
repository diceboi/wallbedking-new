import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const BUCKET = "ProductImages";

export const dynamic = "force-dynamic";

/**
 * Natural comparison function for sorting image filenames (e.g. _1, _2, _10, _11)
 */
function naturalSortFiles(a, b) {
  return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
}

let cachedFolders = null;
let lastFoldersFetch = 0;

/**
 * Recursively discover all non-hidden folders in the bucket (up to 3 levels)
 */
async function discoverFolders(prefix = "", depth = 0) {
  if (depth > 3) return [];
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .list(prefix, { limit: 100 });
  if (error || !Array.isArray(data)) return [];
  const folders = [];
  for (const item of data) {
    if (!item.id && !item.metadata && !item.name.startsWith(".")) {
      const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
      folders.push(fullPath);
      const sub = await discoverFolders(fullPath, depth + 1);
      folders.push(...sub);
    }
  }
  return folders;
}

async function getAvailableFolders(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedFolders && now - lastFoldersFetch < 60000) {
    return cachedFolders;
  }
  const discovered = await discoverFolders("");
  // Ensure default expected categories exist in list if discovered is empty
  const folderSet = new Set(discovered);
  ["wallbeds/1K", "wallbeds/2K", "mattresses", "sofas", "tables", "cabinets"].forEach((d) => folderSet.add(d));
  const sorted = Array.from(folderSet).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  cachedFolders = sorted;
  lastFoldersFetch = now;
  return sorted;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetBucket = searchParams.get("bucket") || BUCKET;
    const folderParam = searchParams.get("folder");
    const defaultFolder = targetBucket === "SupportFiles" ? "InstallationManuals" : "wallbeds/1K";
    const folder = (folderParam === "root" || folderParam === "" ? "" : (folderParam || defaultFolder)).replace(/^\/+|\/+$/g, "");
    const search = searchParams.get("search") || "";
    const limit = parseInt(searchParams.get("limit") || "500", 10);
    const matchPrefix = searchParams.get("matchPrefix");
    const getPrefixes = searchParams.get("prefixes") === "true";
    const getFolders = searchParams.get("folders") === "true";
    const getManuals = searchParams.get("manuals") === "true";
    const forceRefresh = searchParams.get("refresh") === "true";

    // Dedicated Installation Manuals listing
    if (getManuals) {
      const { data, error } = await supabaseAdmin.storage
        .from("SupportFiles")
        .list("InstallationManuals", {
          limit: 200,
          sortBy: { column: "name", order: "asc" },
        });

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      const manuals = (data || [])
        .filter((item) => item.name && !item.name.startsWith("."))
        .map((item) => {
          const filePath = `InstallationManuals/${item.name}`;
          const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/SupportFiles/${filePath}`;
          return {
            name: item.name,
            path: filePath,
            url: publicUrl,
            size: item.metadata?.size || item.size || 0,
            updatedAt: item.updated_at || item.created_at,
          };
        });

      return NextResponse.json({
        success: true,
        bucket: "SupportFiles",
        folder: "InstallationManuals",
        manuals,
      });
    }

    // 0. Return all dynamically discovered folders
    if (getFolders) {
      const folders = await getAvailableFolders(forceRefresh);
      return NextResponse.json({
        success: true,
        folders,
      });
    }

    // 1. Return all available Morphy / Product image prefixes in the storage
    if (getPrefixes) {
      const { data, error } = await supabaseAdmin.storage
        .from(targetBucket)
        .list("wallbeds/1K", { limit: 1000 });

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      const prefixesSet = new Set();
      (data || []).forEach((file) => {
        if (!file.name || file.name.startsWith(".")) return;
        const match = file.name.match(/^([^_]+)/);
        if (match && match[1]) {
          prefixesSet.add(match[1]);
        }
      });

      const sortedPrefixes = Array.from(prefixesSet).sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true })
      );

      return NextResponse.json({
        success: true,
        prefixes: sortedPrefixes,
      });
    }

    // 2. Specific prefix matching for automatic product image assignment
    if (matchPrefix) {
      const cleanPrefix = matchPrefix.trim();
      const [res1K, res2K] = await Promise.all([
        supabaseAdmin.storage
          .from(BUCKET)
          .list("wallbeds/1K", { search: cleanPrefix, limit: 100 }),
        supabaseAdmin.storage
          .from(BUCKET)
          .list("wallbeds/2K", { search: cleanPrefix, limit: 100 }),
      ]);

      const files1K = (res1K.data || [])
        .filter((f) => f.name && f.name.startsWith(cleanPrefix) && !f.name.startsWith("."))
        .sort(naturalSortFiles);

      const files2K = (res2K.data || [])
        .filter((f) => f.name && f.name.startsWith(cleanPrefix) && !f.name.startsWith("."))
        .sort(naturalSortFiles);

      // Primary image: file matching prefix_1.webp (not -m)
      const primaryFile = files1K.find(
        (f) =>
          f.name === `${cleanPrefix}_1.webp` ||
          f.name.endsWith("_1.webp") ||
          (!f.name.includes("-m") && !f.name.includes("_m"))
      );

      // Hover image: file matching prefix_1-m.webp or _1_m.webp
      const hoverFile = files1K.find(
        (f) =>
          f.name === `${cleanPrefix}_1-m.webp` ||
          f.name === `${cleanPrefix}_1_m.webp` ||
          f.name.includes("-m") ||
          f.name.includes("_m")
      );

      const primaryUrl = primaryFile
        ? `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/wallbeds/1K/${primaryFile.name}`
        : null;

      const hoverUrl = hoverFile
        ? `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/wallbeds/1K/${hoverFile.name}`
        : null;

      // Gallery images: all 2K files except hover/mattress if desired, or all ordered
      // Let's include all non-m 2K files, starting with _1, _2, ..., _12
      const galleryFiles2K = files2K.filter(
        (f) => !f.name.includes("-m") && !f.name.includes("_m")
      );

      const galleryUrls = (galleryFiles2K.length > 0 ? galleryFiles2K : files2K).map(
        (f) => `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/wallbeds/2K/${f.name}`
      );

      return NextResponse.json({
        success: true,
        matched: {
          prefix: cleanPrefix,
          primaryUrl,
          hoverUrl,
          galleryUrls,
          total1K: files1K.length,
          total2K: files2K.length,
          files1K: files1K.map((f) => f.name),
          files2K: files2K.map((f) => f.name),
        },
      });
    }

    // 3. Regular folder browsing & search
    const { data, error } = await supabaseAdmin.storage
      .from(targetBucket)
      .list(folder, {
        limit,
        search: search.trim() || undefined,
        sortBy: { column: "name", order: "asc" },
      });

    if (error) {
      console.error("[Storage API] List error:", error);
      return NextResponse.json(
        { success: false, error: error.message || "Failed to list storage files." },
        { status: 500 }
      );
    }

    const subfolders = [];
    const files = [];

    (data || []).forEach((item) => {
      // Ignore hidden/placeholder files
      if (item.name.startsWith(".emptyFolderPlaceholder")) return;

      // Supabase storage returns items without id as subfolders, or metadata is null
      if (!item.id && !item.metadata) {
        subfolders.push(item.name);
        return;
      }

      const filePath = folder ? `${folder}/${item.name}` : item.name;
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${targetBucket}/${filePath}`;
      const ext = item.name.split(".").pop()?.toLowerCase();
      const isImage = ["webp", "png", "jpg", "jpeg", "svg", "avif", "gif"].includes(ext);
      const isPdf = ext === "pdf";

      files.push({
        name: item.name,
        path: filePath,
        url: publicUrl,
        size: item.metadata?.size || item.size || 0,
        mimetype: item.metadata?.mimetype,
        updatedAt: item.updated_at || item.created_at,
        isImage,
        isPdf,
      });
    });

    files.sort(naturalSortFiles);

    return NextResponse.json({
      success: true,
      bucket: targetBucket,
      folder,
      subfolders,
      files,
      total: files.length,
      availableFolders: await getAvailableFolders(forceRefresh),
    });
  } catch (error) {
    console.error("[Storage API Exception]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
