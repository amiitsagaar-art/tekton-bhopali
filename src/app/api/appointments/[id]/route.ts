import { NextResponse } from "next/server";
import { db } from "@/db";
import { appointments, workers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendWhatsAppMessage } from "@/utils/whatsapp";
import { verifyAdminToken } from "@/lib/adminAuth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, assignedWorkerId, description, appointmentDate, appointmentTime } = body;
    // Extract numeric IDs, stripping any prefixes (e.g., "TEK-4" -> 4)
    const numericId = Number(id.replace(/\D/g, ""));
    const numericWorkerId = assignedWorkerId ? Number(String(assignedWorkerId).replace(/\D/g, "")) : null;

    const updateFields: Record<string, unknown> = {};
    if (status !== undefined) updateFields.status = status;
    if (assignedWorkerId !== undefined) updateFields.assignedWorkerId = numericWorkerId;
    if (description !== undefined) updateFields.description = description;
    if (appointmentDate !== undefined) updateFields.appointmentDate = appointmentDate;
    if (appointmentTime !== undefined) updateFields.appointmentTime = appointmentTime;

    // Perform DB update strictly
    const updated = await db
      .update(appointments)
      .set(updateFields)
      .where(eq(appointments.id, numericId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    const updatedApp = updated[0];

    // ---- WhatsApp notifications ----
    // Assignment notification
    if (updateFields.assignedWorkerId && updateFields.assignedWorkerId !== null) {
      const worker = await db.select().from(workers).where(eq(workers.id, Number(updateFields.assignedWorkerId))).limit(1);
      if (worker[0]) {
        await sendWhatsAppMessage(
          worker[0].phone,
          `Hello ${worker[0].name}, a new ${updatedApp.category} task has been assigned to you at ${updatedApp.location}. Please open your Partner Dashboard to Accept or Decline the task. Team Tekton.`
        );
      }
    }

    // Cancellation notification
    if (updateFields.status && (updateFields.status as string).toLowerCase() === "cancelled") {
      // Notify customer
      if (updatedApp.customerPhone) {
        await sendWhatsAppMessage(
          updatedApp.customerPhone,
          `Your Tekton booking ${updatedApp.id} has been cancelled successfully.`
        );
      }
      // Notify assigned worker if any
      if (updatedApp.assignedWorkerId) {
        const worker = await db.select().from(workers).where(eq(workers.id, Number(updatedApp.assignedWorkerId))).limit(1);
        if (worker[0]) {
          await sendWhatsAppMessage(
            worker[0].phone,
            `Alert: The task ${updatedApp.id} assigned to you has been cancelled by the user.`
          );
        }
      }
    }

    return NextResponse.json(updatedApp);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Server error";
    console.error("[DATABASE ERROR] Updating appointment failed:", error);
    return NextResponse.json({ error: "Failed to update appointment: " + msg }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
  }
  try {
    const { id } = await params;
    const deleted = await db
      .delete(appointments)
      .where(eq(appointments.id, Number(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, deletedId: deleted[0].id });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Server error";
    console.error("[DATABASE ERROR] Deleting appointment failed:", error);
    return NextResponse.json({ error: "Failed to delete appointment: " + msg }, { status: 500 });
  }
}
