import { NextResponse } from "next/server";
import { getAllEnrichedBundles } from "@/lib/bundles";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeHidden = searchParams.get("preview") === "true";

    const bundles = await getAllEnrichedBundles({ includeHidden });

    return NextResponse.json({
      success: true,
      count: bundles.length,
      bundles,
    });
  } catch (error) {
    console.error("[bundles GET] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
