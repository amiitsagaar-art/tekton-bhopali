import { NextResponse } from "next/server";
import { db } from "@/db";
import { appointments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyAdminToken } from "@/lib/adminAuth";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    const numericId = Number(id.replace(/\D/g, ""));
    const updated = await db
      .update(appointments)
      .set({ status: body.status })
      .where(eq(appointments.id, numericId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Server error";
    console.error("[DATABASE ERROR] Updating booking status failed:", error);
    return NextResponse.json({ error: "Internal Server Error: " + msg }, { status: 500 });
  }
}
