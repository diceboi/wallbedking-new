import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getAllReviewsForAdmin,
  updateReviewStatus,
  deleteReview,
} from "@/lib/reviews";

export const dynamic = "force-dynamic";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

/**
 * GET /api/admin/reviews
 * Lists all reviews for admin moderation
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    const search = searchParams.get("search") || "";

    const reviews = await getAllReviewsForAdmin({ status, search });

    const stats = {
      total: reviews.length,
      pending: reviews.filter((r) => r.status === "pending").length,
      approved: reviews.filter((r) => r.status === "approved").length,
      rejected: reviews.filter((r) => r.status === "rejected").length,
    };

    return NextResponse.json(
      {
        success: true,
        reviews,
        stats,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch admin reviews" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

/**
 * PATCH /api/admin/reviews
 * Updates review approval status (approved | rejected | pending)
 */
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { reviewId, status } = body || {};

    if (!reviewId || !status) {
      return NextResponse.json(
        { success: false, error: "Missing reviewId or status parameter" },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const updated = await updateReviewStatus(reviewId, status);

    // Revalidate public reviews API and pages
    try {
      revalidatePath("/api/reviews");
      revalidatePath("/[locale]/reviews", "page");
      revalidatePath("/[locale]/products/[category]/[product]", "page");
      revalidatePath("/admin/reviews", "page");
    } catch (revalErr) {
      console.warn("[Admin Reviews] Cache revalidation note:", revalErr.message);
    }

    return NextResponse.json(
      {
        success: true,
        message: `Review status successfully updated to ${status}.`,
        review: updated,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update review" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

/**
 * DELETE /api/admin/reviews
 * Deletes a review
 */
export async function DELETE(request) {
  try {
    let reviewId = null;
    try {
      const body = await request.json();
      reviewId = body?.reviewId;
    } catch {
      // not JSON body
    }
    if (!reviewId) {
      const { searchParams } = new URL(request.url);
      reviewId = searchParams.get("reviewId");
    }

    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: "Missing reviewId parameter" },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    await deleteReview(reviewId);

    // Revalidate public reviews API and pages
    try {
      revalidatePath("/api/reviews");
      revalidatePath("/[locale]/reviews", "page");
      revalidatePath("/[locale]/products/[category]/[product]", "page");
      revalidatePath("/admin/reviews", "page");
    } catch (revalErr) {
      console.warn("[Admin Reviews] Cache revalidation note:", revalErr.message);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Review successfully deleted.",
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete review" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
