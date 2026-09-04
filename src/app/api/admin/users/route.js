import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/users
 * Lists all registered users from Supabase Auth & public.profiles
 */
export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: "Supabase Admin client unavailable" },
        { status: 500 }
      );
    }

    // 1. Fetch all users from Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) {
      console.error("[Admin Users] Auth listUsers error:", authError);
      return NextResponse.json(
        { success: false, error: authError.message },
        { status: 500 }
      );
    }

    const authUsers = authData?.users || [];

    // 2. Try fetching from public.profiles if table exists
    let profilesMap = {};
    let hasProfilesTable = false;

    try {
      const { data: profiles, error: pError } = await supabaseAdmin
        .from("profiles")
        .select("*");

      if (!pError && Array.isArray(profiles)) {
        hasProfilesTable = true;
        for (const p of profiles) {
          if (p.id) profilesMap[p.id] = p;
        }
      }
    } catch {
      // profiles table does not exist yet; gracefully fallback
      hasProfilesTable = false;
    }

    // 3. Format unified user list
    const users = authUsers.map((u) => {
      const profile = profilesMap[u.id];
      const isPredefinedAdmin = u.email?.toLowerCase() === "diceboii13@gmail.com";
      const role =
        profile?.role ||
        u.user_metadata?.role ||
        (isPredefinedAdmin ? "admin" : "customer");

      const fullName =
        profile?.full_name ||
        u.user_metadata?.full_name ||
        u.email?.split("@")[0] ||
        "User";

      const phone =
        profile?.phone ||
        u.user_metadata?.phone ||
        "";

      const addresses =
        u.user_metadata?.addresses ||
        profile?.addresses ||
        [];

      const savedConfigs =
        u.user_metadata?.saved_configs ||
        profile?.saved_configs ||
        [];

      return {
        id: u.id,
        email: u.email,
        fullName,
        role: role.toLowerCase() === "admin" ? "admin" : "customer",
        phone,
        addresses,
        savedConfigs,
        emailConfirmed: !!u.email_confirmed_at,
        createdAt: u.created_at,
        lastSignInAt: u.last_sign_in_at,
        metadata: u.user_metadata || {},
      };
    });

    // Sort users: admins first, then newest registered first
    users.sort((a, b) => {
      if (a.role === "admin" && b.role !== "admin") return -1;
      if (b.role === "admin" && a.role !== "admin") return 1;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    return NextResponse.json({
      success: true,
      count: users.length,
      users,
      hasProfilesTable,
    });
  } catch (err) {
    console.error("[Admin Users] Exception:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/users
 * Updates a user's role (admin | customer) and/or addresses
 */
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { userId, role, addresses } = body || {};

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing userId" },
        { status: 400 }
      );
    }

    // Fetch existing user to preserve existing user_metadata
    const { data: userCurrent, error: fetchUserError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (fetchUserError || !userCurrent?.user) {
      return NextResponse.json(
        { success: false, error: fetchUserError?.message || "User not found" },
        { status: 404 }
      );
    }

    const currentMeta = userCurrent.user.user_metadata || {};
    const updatedMeta = { ...currentMeta };
    const profileUpdates = { id: userId, updated_at: new Date().toISOString() };

    // 1. If role is being updated
    if (role !== undefined) {
      const normalizedRole = (role || "").toLowerCase();
      if (!["admin", "customer"].includes(normalizedRole)) {
        return NextResponse.json(
          { success: false, error: "Role must be 'admin' or 'customer'" },
          { status: 400 }
        );
      }
      updatedMeta.role = normalizedRole;
      profileUpdates.role = normalizedRole;
    }

    // 2. If addresses are being updated
    if (addresses !== undefined) {
      if (!Array.isArray(addresses)) {
        return NextResponse.json(
          { success: false, error: "Addresses must be an array" },
          { status: 400 }
        );
      }
      updatedMeta.addresses = addresses;
      profileUpdates.addresses = addresses;
    }

    // Update Auth User user_metadata
    const { data: userData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        user_metadata: updatedMeta,
      }
    );

    if (updateError) {
      console.error("[Admin Users] Update error:", updateError);
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    // Also try updating profiles table if it exists
    try {
      await supabaseAdmin
        .from("profiles")
        .upsert(profileUpdates);
    } catch {
      // Ignored if table doesn't exist
    }

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      user: {
        id: userId,
        role: updatedMeta.role,
        addresses: updatedMeta.addresses,
      },
    });
  } catch (err) {
    console.error("[Admin Users] PATCH Exception:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update user" },
      { status: 500 }
    );
  }
}
