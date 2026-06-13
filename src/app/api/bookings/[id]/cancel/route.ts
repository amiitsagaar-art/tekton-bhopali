import { NextResponse } from "next/server";
import { db } from "@/db";
import { appointments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { sendWhatsAppMessage } from "@/utils/whatsapp";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { phone, reason } = body;

    if (!phone) {
      return NextResponse.json({ error: "Phone number required" }, { status: 400 });
    }

    const numericId = Number(id);
    if (isNaN(numericId)) {
      return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });
    }

    // Find booking and verify it belongs to this phone number
    const existing = await db
      .select()
      .from(appointments)
      .where(and(eq(appointments.id, numericId), eq(appointments.customerPhone, phone.trim())))
      .limit(1);

    if (!existing[0]) {
      return NextResponse.json(
        { error: "Booking not found or does not belong to your account." },
        { status: 404 }
      );
    }

    const booking = existing[0];

    // Only allow cancellation of Pending or Confirmed bookings
    if (!["Pending", "Confirmed"].includes(booking.status)) {
      return NextResponse.json(
        { error: `Booking cannot be cancelled — current status is "${booking.status}".` },
        { status: 400 }
      );
    }

    // Update status to Cancelled
    const updated = await db
      .update(appointments)
      .set({
        status: "Cancelled",
        cancellationReason: reason || "Cancelled by customer",
      })
      .where(eq(appointments.id, numericId))
      .returning();

    // WhatsApp notification to customer
    try {
      await sendWhatsAppMessage(
        phone,
        `Your Tekton booking TEK-${numericId} (${booking.category}) has been cancelled. Reason: ${reason || "Cancelled by customer"}. We hope to serve you again! Team Tekton.`
      );
    } catch (e) {
      // Non-critical, continue
      console.warn("WhatsApp notification failed:", e);
    }

    return NextResponse.json({
      success: true,
      bookingId: `TEK-${numericId}`,
      message: "Booking cancelled successfully.",
    });
  } catch (error: any) {
    console.error("[CANCEL BOOKING ERROR]", error);
    return NextResponse.json(
      { error: "Failed to cancel booking: " + error.message },
      { status: 500 }
    );
  }
}
