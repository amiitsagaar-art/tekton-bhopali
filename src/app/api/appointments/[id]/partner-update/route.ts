import { NextResponse } from "next/server";
import { db } from "@/db";
import { appointments, workers } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * PATCH /api/appointments/[id]/partner-update
 * Partner-only route — authenticates via x-worker-phone header.
 * Allows partner to Accept (Confirmed) or Decline (Pending) a job assigned to them.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const workerPhone = request.headers.get("x-worker-phone");
    if (!workerPhone) {
      return NextResponse.json(
        { error: "Unauthorized. Worker phone header missing." },
        { status: 401 }
      );
    }

    // Validate worker by phone
    const workerResult = await db
      .select()
      .from(workers)
      .where(eq(workers.phone, workerPhone))
      .limit(1);

    if (!workerResult || workerResult.length === 0) {
      return NextResponse.json(
        { error: "Unauthorized. Worker not found." },
        { status: 401 }
      );
    }

    const worker = workerResult[0];

    const { id } = await params;
    const numericId = Number(id);
    if (isNaN(numericId)) {
      return NextResponse.json({ error: "Invalid appointment ID." }, { status: 400 });
    }

    const body = await request.json();
    const { status, assignedWorkerId } = body;

    // Fetch appointment to verify it is assigned to this worker
    const apptResult = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, numericId))
      .limit(1);

    if (!apptResult || apptResult.length === 0) {
      return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
    }

    const appt = apptResult[0];

    // Security: ensure this job belongs to requesting worker
    if (appt.assignedWorkerId !== worker.id) {
      // Allow decline (unassign) even if it was a pending/assigned job
      const isDecline = (status === "Pending" || status === "Unassigned") && assignedWorkerId === null;
      if (!isDecline) {
        return NextResponse.json(
          { error: "Forbidden. This job is not assigned to you." },
          { status: 403 }
        );
      }
    }

    const updateFields: Record<string, unknown> = {};
    if (status !== undefined) updateFields.status = status;
    if (assignedWorkerId !== undefined) updateFields.assignedWorkerId = assignedWorkerId;

    const updated = await db
      .update(appointments)
      .set(updateFields)
      .where(eq(appointments.id, numericId))
      .returning();

    return NextResponse.json({ success: true, appointment: updated[0] });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Server error";
    console.error("[PARTNER UPDATE ERROR]", error);
    return NextResponse.json(
      { error: "Failed to update appointment: " + msg },
      { status: 500 }
    );
  }
}
