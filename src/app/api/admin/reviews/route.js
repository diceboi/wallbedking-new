import { NextResponse } from "next/server";
import {
  getAllReviewsForAdmin,
  updateReviewStatus,
  deleteReview,
} from "@/lib/reviews";

export const dynamic = "force-dynamic";

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

    return NextResponse.json({
      success: true,
      reviews,
      stats,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch admin reviews" },
      { status: 500 }
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
        { status: 400 }
      );
    }

    const updated = await updateReviewStatus(reviewId, status);

    return NextResponse.json({
      success: true,
      message: `Review status successfully updated to ${status}.`,
      review: updated,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update review" },
      { status: 500 }
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
        { status: 400 }
      );
    }

    await deleteReview(reviewId);

    return NextResponse.json({
      success: true,
      message: "Review successfully deleted.",
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete review" },
      { status: 500 }
    );
  }
}
