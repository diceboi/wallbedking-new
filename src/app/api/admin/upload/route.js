import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

export const dynamic = "force-dynamic";

/**
 * Direct file upload endpoint to Supabase Storage (ProductImages bucket).
 * Supports single file upload with optional target folder (e.g. 'wallbeds', 'wallbeds/1K', 'wallbeds/2K').
 */
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const targetBucket = (formData.get("bucket") || "ProductImages").toString();
    const targetFolder = (formData.get("folder") || (targetBucket === "SupportFiles" ? "InstallationManuals" : "wallbeds"))
      .toString()
      .replace(/^\/+|\/+$/g, "");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, error: "No file provided in form data." },
        { status: 400 }
      );
    }

    const MIME_MAP = {
      webp: "image/webp",
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      svg: "image/svg+xml",
      avif: "image/avif",
      gif: "image/gif",
      pdf: "application/pdf",
    };

    const originalName = file.name || (targetBucket === "SupportFiles" ? "manual.pdf" : "image.webp");
    const extension = originalName.split(".").pop().toLowerCase();
    const isPdf = extension === "pdf" || file.type === "application/pdf";
    const resolvedMime = isPdf
      ? "application/pdf"
      : (file.type && file.type.startsWith("image/"))
      ? file.type
      : MIME_MAP[extension];

    if (!resolvedMime) {
      return NextResponse.json(
        { success: false, error: "File must be an image (WebP, PNG, JPEG, SVG, AVIF, GIF) or a PDF manual." },
        { status: 400 }
      );
    }
    const cleanBaseName = originalName
      .substring(0, originalName.lastIndexOf("."))
      .replace(/[^a-zA-Z0-9_\-]/g, "_")
      .replace(/_+/g, "_");

    // Add unique timestamp if needed, or preserve clean original name
    const timestamp = Date.now();
    const fileName = `${cleanBaseName}_${timestamp}.${extension}`;
    const storagePath = targetFolder ? `${targetFolder}/${fileName}` : fileName;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabaseAdmin.storage
      .from(targetBucket)
      .upload(storagePath, buffer, {
        contentType: resolvedMime,
        upsert: true,
      });

    if (error) {
      console.error("[Admin Upload] Supabase storage upload error:", error);
      return NextResponse.json(
        { success: false, error: error.message || "Failed to upload to Supabase storage." },
        { status: 500 }
      );
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${targetBucket}/${data.path}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: data.path,
      fileName,
      originalName,
      size: file.size,
      mimeType: file.type,
    });
  } catch (error) {
    console.error("[Admin Upload API Exception]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error during upload." },
      { status: 500 }
    );
  }
}
