import { NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { getCampaigns, saveCampaigns } from "@/lib/promotions";

function revalidatePromotionsCache() {
  try {
    revalidateTag("promotions");
    revalidatePath("/", "layout");
  } catch (err) {
    console.warn("[api/admin/promotions] Cache revalidation notice:", err?.message);
  }
}

export const dynamic = "force-dynamic";

const noCacheHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

/**
 * GET /api/admin/promotions
 * Returns all configured promotional campaigns.
 */
export async function GET() {
  try {
    const campaigns = await getCampaigns({ fresh: true });
    return NextResponse.json(
      {
        success: true,
        campaigns: Array.isArray(campaigns) ? campaigns : [],
      },
      { headers: noCacheHeaders }
    );
  } catch (error) {
    console.error("[api/admin/promotions] GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: noCacheHeaders }
    );
  }
}

/**
 * POST /api/admin/promotions
 * Creates, updates, or bulk saves promotional campaigns.
 */
export async function POST(req) {
  try {
    const body = await req.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid payload" },
        { status: 400, headers: noCacheHeaders }
      );
    }

    const currentCampaigns = (await getCampaigns({ fresh: true })) || [];
    let updatedCampaigns = [...currentCampaigns];

    // Bulk replace
    if (Array.isArray(body.campaigns)) {
      updatedCampaigns = body.campaigns;
    } else if (body.campaign) {
      const camp = { ...body.campaign };
      const nowIso = new Date().toISOString();

      if (!camp.id) {
        const slugPart = (camp.slug || camp.name || "campaign")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-")
          .replace(/-+/g, "-")
          .slice(0, 30);
        camp.id = `camp-${slugPart}-${Date.now().toString(36)}`;
        camp.created_at = nowIso;
      }
      camp.updated_at = nowIso;

      const idx = updatedCampaigns.findIndex((c) => c.id === camp.id);
      if (idx >= 0) {
        updatedCampaigns[idx] = { ...updatedCampaigns[idx], ...camp };
      } else {
        updatedCampaigns.unshift(camp);
      }
    } else {
      return NextResponse.json(
        { success: false, error: "Payload must contain either campaign or campaigns" },
        { status: 400, headers: noCacheHeaders }
      );
    }

    await saveCampaigns(updatedCampaigns);
    revalidatePromotionsCache();

    return NextResponse.json(
      {
        success: true,
        message: "Promotional campaigns updated successfully",
        campaigns: updatedCampaigns,
      },
      { headers: noCacheHeaders }
    );
  } catch (error) {
    console.error("[api/admin/promotions] POST error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: noCacheHeaders }
    );
  }
}

/**
 * DELETE /api/admin/promotions?id=...
 * Deletes a campaign by ID.
 */
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Campaign ID is required" },
        { status: 400, headers: noCacheHeaders }
      );
    }

    const currentCampaigns = (await getCampaigns({ fresh: true })) || [];
    const updated = currentCampaigns.filter((c) => c.id !== id);

    await saveCampaigns(updated);
    revalidatePromotionsCache();

    return NextResponse.json(
      {
        success: true,
        message: `Campaign ${id} deleted successfully`,
        campaigns: updated,
      },
      { headers: noCacheHeaders }
    );
  } catch (error) {
    console.error("[api/admin/promotions] DELETE error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: noCacheHeaders }
    );
  }
}

