import { NextResponse } from "next/server";
import { db } from "@/db";
import { reviews } from "@/db/schema";
import { eq, avg, count } from "drizzle-orm";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // vendorId
    const vendorId = parseInt(id, 10);
    if (isNaN(vendorId)) {
      return NextResponse.json({ error: "Invalid vendor ID" }, { status: 400 });
    }

    const result = await db
      .select({
        averageRating: avg(reviews.rating),
        totalReviews: count(reviews.id),
        reviews: reviews,
      })
      .from(reviews)
      .where(eq(reviews.vendorId, vendorId));

    if (!result || result.length === 0) {
      return NextResponse.json({ averageRating: 0, totalReviews: 0, reviews: [] });
    }

    const { averageRating, totalReviews } = result[0];
    const vendorReviews = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        userId: reviews.userId,
      })
      .from(reviews)
      .where(eq(reviews.vendorId, vendorId));

    return NextResponse.json({
      averageRating: parseFloat(averageRating as unknown as string) || 0,
      totalReviews: totalReviews || 0,
      reviews: vendorReviews,
    });
  } catch (error: any) {
    console.error("[GET VENDOR REVIEWS ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch vendor reviews" }, { status: 500 });
  }
}
