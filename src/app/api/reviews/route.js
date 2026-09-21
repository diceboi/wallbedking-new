import { NextResponse } from "next/server";
import { getApprovedReviews, submitReview } from "@/lib/reviews";

export const dynamic = "force-dynamic";

/**
 * GET /api/reviews?productSlug=...
 * Returns approved reviews for a given product
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productSlug = searchParams.get("productSlug") || "";

    const reviews = await getApprovedReviews(productSlug);

    const totalCount = reviews.length;
    const avgRating =
      totalCount > 0
        ? Math.round(
            (reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / totalCount) *
              10
          ) / 10
        : 5.0;

    return NextResponse.json({
      success: true,
      reviews,
      stats: {
        totalCount,
        avgRating,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reviews
 * Submits a new customer review (starts in 'pending' status for admin approval)
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      productSlug,
      productName,
      authorName,
      authorEmail,
      rating,
      title,
      content,
      photos,
      orderId,
    } = body || {};

    if (!authorName || !content) {
      return NextResponse.json(
        { success: false, error: "Name and review text are required." },
        { status: 400 }
      );
    }

    const review = await submitReview({
      productSlug: productSlug || "classic-vertical-wall-bed",
      productName: productName || "Wall Bed King Murphy Bed",
      authorName,
      authorEmail: authorEmail || "",
      rating: Number(rating) || 5,
      title: title || "",
      content,
      photos: Array.isArray(photos) ? photos : [],
      orderId: orderId || null,
    });

    return NextResponse.json({
      success: true,
      message:
        "Thank you! Your review has been submitted and will appear on the product page as soon as our team approves it.",
      review,
    });
  } catch (err) {
    console.error("[Submit Review Error]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to submit review." },
      { status: 500 }
    );
  }
}
