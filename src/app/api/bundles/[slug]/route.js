import { NextResponse } from "next/server";
import { getEnrichedBundleBySlug } from "@/lib/bundles";

export async function GET(request, { params }) {
  try {
    const rawSlug = (await params)?.slug;
    if (!rawSlug) {
      return NextResponse.json({ success: false, error: "Slug required" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const includeHidden = searchParams.get("preview") === "true";

    const bundle = await getEnrichedBundleBySlug(rawSlug, { includeHidden });

    if (!bundle) {
      return NextResponse.json({ success: false, error: "Bundle not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, bundle });
  } catch (error) {
    console.error("[bundles/[slug] GET] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
