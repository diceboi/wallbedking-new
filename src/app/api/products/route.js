import { NextResponse } from "next/server";
import { getStorefrontProducts } from "@/lib/products-db";
import fallbackCatalog from "@/data/products-catalog.json";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = (await getStorefrontProducts()) || fallbackCatalog;
    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
