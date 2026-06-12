import { NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, workers } from "@/db/schema";
import { eq, avg, count } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, vendorId, rating, comment } = body;

    if (!userId || !vendorId || !rating) {
      return NextResponse.json({ error: "userId, vendorId, and rating are required." }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
    }

    // No appointment verification needed for direct user/vendor reviews

    // Insert the review
    const newReview = await db.insert(reviews).values({
      userId,
      vendorId,
      rating,
      comment,
    }).returning();

    // AUTO-RECALCULATE Worker Rating
    const allReviews = await db
      .select({
        averageRating: avg(reviews.rating),
        totalReviews: count(reviews.id)
      })
      .from(reviews)
      .where(eq(reviews.vendorId, vendorId));

    if (allReviews && allReviews.length > 0) {
      const avgRt = parseFloat(allReviews[0].averageRating as string) || rating;
      const tCount = allReviews[0].totalReviews || 1;

      await db
        .update(workers)
        .set({
          rating: avgRt.toFixed(1),
          reviewsCount: tCount,
        })
        .where(eq(workers.id, vendorId));
    }

    return NextResponse.json({ success: true, message: "Review submitted successfully!", review: newReview[0] }, { status: 201 });
  } catch (error: any) {
    console.error("[REVIEWS API ERROR]", error);
    // If it's a unique constraint violation, they already reviewed
    if (error.code === '23505') {
      return NextResponse.json({ error: "You have already submitted a review." }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to submit review." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const allReviews = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        userId: reviews.userId,
        vendorId: reviews.vendorId,
      })
      .from(reviews);

    return NextResponse.json(allReviews);
  } catch (error: any) {
    console.error("[GET REVIEWS ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
