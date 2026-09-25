import { NextResponse } from "next/server";
import { triggerRestockNotification } from "@/lib/restock";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/products/notify-restock
 * Notify all waiting customers that a product has been replenished
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const result = await triggerRestockNotification(body || {});
    return NextResponse.json(result);
  } catch (error) {
    console.error("[Restock Notify Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to notify waitlist" },
      { status: 500 }
    );
  }
}
