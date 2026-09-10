import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/account/orders
 * Returns customer-specific orders based on email or user_id
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const userId = searchParams.get("userId");

    if (!email && !userId) {
      return NextResponse.json(
        { success: false, error: "Missing user email or ID" },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json({
        success: true,
        orders: [],
      });
    }

    let query = supabaseAdmin
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (email && userId) {
      query = query.or(`customer_email.eq.${email.toLowerCase().trim()},user_id.eq.${userId}`);
    } else if (email) {
      query = query.eq("customer_email", email.toLowerCase().trim());
    } else {
      query = query.eq("user_id", userId);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.warn("[Account Orders] DB query notice:", error.message);
      return NextResponse.json({
        success: true,
        orders: [],
      });
    }

    return NextResponse.json({
      success: true,
      orders: orders || [],
    });
  } catch (err) {
    console.error("[Account Orders Exception]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch account orders" },
      { status: 500 }
    );
  }
}
