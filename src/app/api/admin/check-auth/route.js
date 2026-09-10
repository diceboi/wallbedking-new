import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/check-auth
 * Validates whether the requesting user has valid Administrator privileges.
 */
export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");
    let token = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // Also check for supabase cookie if token wasn't in header
    if (!token) {
      const cookieHeader = request.headers.get("cookie") || "";
      const match = cookieHeader.match(/sb-[a-z0-9]+-auth-token=([^;]+)/);
      if (match) {
        try {
          const parsed = JSON.parse(decodeURIComponent(match[1]));
          token = Array.isArray(parsed) ? parsed[0] : parsed?.access_token;
        } catch (e) {
          // ignore cookie parse error
        }
      }
    }

    if (!token) {
      return NextResponse.json({
        authenticated: false,
        isAdmin: false,
        role: null,
        message: "No session token found",
      });
    }

    // 1. Verify user with Supabase Auth
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({
        authenticated: false,
        isAdmin: false,
        role: null,
        message: "Invalid or expired session",
      });
    }

    // 2. Fetch authoritative role from public.profiles
    let role = "customer";
    let fullName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";

    try {
      const { data: profile, error: pError } = await supabaseAdmin
        .from("profiles")
        .select("role, full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (!pError && profile) {
        role = profile.role || role;
        if (profile.full_name) fullName = profile.full_name;
      } else {
        // Fallback to user_metadata or initial admin email
        if (user.user_metadata?.role) {
          role = user.user_metadata.role;
        } else if (user.email?.toLowerCase() === "diceboii13@gmail.com") {
          role = "admin";
        }
      }
    } catch {
      // Fallback
      if (user.user_metadata?.role) {
        role = user.user_metadata.role;
      } else if (user.email?.toLowerCase() === "diceboii13@gmail.com") {
        role = "admin";
      }
    }

    const isAdmin = role.toLowerCase() === "admin";

    return NextResponse.json({
      authenticated: true,
      isAdmin,
      role,
      user: {
        id: user.id,
        email: user.email,
        fullName,
        role,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { authenticated: false, isAdmin: false, error: error.message },
      { status: 500 }
    );
  }
}
