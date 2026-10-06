import { NextResponse } from "next/server";
import { revalidateProductsCache } from "@/lib/products-db";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    revalidateProductsCache();
    return NextResponse.json({
      success: true,
      message: "Storefront cache refreshed directly from Supabase database.",
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
