import { NextResponse } from "next/server";
import { getCampaigns, isCampaignActive, isCampaignEligibleForLocale } from "@/lib/promotions";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const noCacheHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

/**
 * Checks whether the incoming request is from an authenticated admin.
 */
async function checkIsAdmin(request) {
  try {
    const authHeader = request.headers.get("authorization");
    let token = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      const cookieHeader = request.headers.get("cookie") || "";
      const match = cookieHeader.match(/sb-[a-z0-9]+-auth-token=([^;]+)/);
      if (match) {
        try {
          const parsed = JSON.parse(decodeURIComponent(match[1]));
          token = Array.isArray(parsed) ? parsed[0] : parsed?.access_token;
        } catch {
          // ignore
        }
      }
      if (!token) {
        const chunk0 = cookieHeader.match(/sb-[a-z0-9]+-auth-token\.0=([^;]+)/);
        if (chunk0) {
          try {
            let combined = decodeURIComponent(chunk0[1]);
            const chunk1 = cookieHeader.match(/sb-[a-z0-9]+-auth-token\.1=([^;]+)/);
            if (chunk1) combined += decodeURIComponent(chunk1[1]);
            const parsed = JSON.parse(combined);
            token = Array.isArray(parsed) ? parsed[0] : parsed?.access_token;
          } catch {}
        }
      }
    }

    if (!token) return false;

    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return false;

    // Check profile role
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role?.toLowerCase() === "admin") return true;
    if (user.user_metadata?.role?.toLowerCase() === "admin") return true;
    if (user.email?.toLowerCase() === "diceboii13@gmail.com") return true;
    if (user.email?.toLowerCase() === "szasz.szabolcs1995@gmail.com") return true;

    return false;
  } catch {
    return false;
  }
}

/**
 * GET /api/promotions
 * Public endpoint for storefront. Returns currently active promotions.
 * Admins also receive 'preview' promotions marked with isPreview: true.
 */
export async function GET(request) {
  try {
    const isAdmin = await checkIsAdmin(request);
    const now = new Date();
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get("locale") || null;
    const allCampaigns = (await getCampaigns()) || [];

    const activeCampaigns = allCampaigns
      .filter((camp) => {
        // Expired campaigns are never active
        if (camp.end_date && new Date(camp.end_date).getTime() < now.getTime()) {
          return false;
        }

        // Inactive campaigns are disabled everywhere
        if (camp.status === "inactive") return false;

        // Market targeting check: strictly enforced for everyone (including admins testing specific country storefronts)
        if (locale && !isCampaignEligibleForLocale(camp, locale)) {
          return false;
        }

        // Schedule & date validity check: must be active right now according to start/end dates and recurring schedule
        if (!isCampaignActive(camp, now, locale)) {
          return false;
        }

        // Visibility rules:
        // - "active": live to all visitors
        // - "preview": staging mode, visible ONLY to authenticated administrators
        if (camp.status === "active") return true;
        if (camp.status === "preview") return isAdmin;

        return false;
      })
      .map((camp) => ({
        ...camp,
        isPreview: camp.status === "preview",
      }));

    return NextResponse.json(
      {
        success: true,
        campaigns: activeCampaigns,
        isAdmin,
      },
      { headers: noCacheHeaders }
    );
  } catch (error) {
    console.error("[api/promotions] GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: noCacheHeaders }
    );
  }
}

