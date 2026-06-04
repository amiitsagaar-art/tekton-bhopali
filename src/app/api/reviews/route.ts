import { NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, appointments, workers } from "@/db/schema";
import { eq, and, avg, count } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { appointmentId, workerId, customerId, rating, comment } = body;

    if (!appointmentId || !workerId || !rating) {
      return NextResponse.json({ error: "appointmentId, workerId, and rating are required." }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
    }

    // VERIFICATION LOGIC: Check if the appointment exists, belongs to this worker, and is COMPLETED
    const apptCheck = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.id, appointmentId),
          eq(appointments.assignedWorkerId, workerId)
        )
      )
      .limit(1);

    if (!apptCheck || apptCheck.length === 0) {
      return NextResponse.json({ error: "Invalid booking or worker combination." }, { status: 400 });
    }

    if (apptCheck[0].status !== "Completed") {
      return NextResponse.json({ error: "You can only review a worker after the service is Completed." }, { status: 403 });
    }

    // Insert the review
    const newReview = await db.insert(reviews).values({
      appointmentId,
      workerId,
      customerId: customerId || null,
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
      .where(eq(reviews.workerId, workerId));

    if (allReviews && allReviews.length > 0) {
      const avgRt = parseFloat(allReviews[0].averageRating as string) || rating;
      const tCount = allReviews[0].totalReviews || 1;

      await db
        .update(workers)
        .set({
          rating: avgRt.toFixed(1),
          reviewsCount: tCount,
        })
        .where(eq(workers.id, workerId));
    }

    return NextResponse.json({ success: true, message: "Review submitted successfully!", review: newReview[0] }, { status: 201 });
  } catch (error: any) {
    console.error("[REVIEWS API ERROR]", error);
    // If it's a unique constraint violation on appointmentId, they already reviewed
    if (error.code === '23505') {
      return NextResponse.json({ error: "You have already submitted a review for this booking." }, { status: 400 });
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
        customerName: appointments.customerName,
        workerName: workers.name,
      })
      .from(reviews)
      .leftJoin(appointments, eq(reviews.appointmentId, appointments.id))
      .leftJoin(workers, eq(reviews.workerId, workers.id));

    return NextResponse.json(allReviews);
  } catch (error: any) {
    console.error("[GET REVIEWS ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
