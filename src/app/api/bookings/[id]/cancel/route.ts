import { NextResponse } from "next/server";
import { db } from "@/db";
import { appointments } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const appointmentId = parseInt(params.id);
    if (isNaN(appointmentId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const body = await request.json();
    const { cancellationReason } = body;

    // Fetch the appointment
    const appointmentRecord = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (!appointmentRecord || appointmentRecord.length === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const appt = appointmentRecord[0];
    
    if (appt.status === "Cancelled") {
      return NextResponse.json({ error: "Booking is already cancelled" }, { status: 400 });
    }

    // Calculate time difference for 5-minute rule
    const bookingTime = new Date(appt.createdAt).getTime();
    const currentTime = new Date().getTime();
    const diffMinutes = (currentTime - bookingTime) / (1000 * 60);

    let refundStatus = "No Refund (Penalty applied)";
    let newPaymentStatus = appt.paymentStatus; // typically "Paid" or "Pending"

    if (diffMinutes <= 5) {
      refundStatus = "Refund Initiated";
      newPaymentStatus = "Refunded";
      // In a real app, you would call Razorpay/Stripe Refund API here
    }

    // Update appointment status to cancelled and log the reason and refund status
    const updated = await db
      .update(appointments)
      .set({
        status: "Cancelled",
        paymentStatus: newPaymentStatus,
        cancellationReason: `[${refundStatus}] ${cancellationReason || "No reason provided"}`,
      })
      .where(eq(appointments.id, appointmentId))
      .returning();

    return NextResponse.json({ 
      success: true, 
      refundStatus,
      message: `Booking Cancelled. ${refundStatus}.`,
      appointment: updated[0] 
    });

  } catch (error: any) {
    console.error("[CANCEL API ERROR]", error);
    return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 });
  }
}
