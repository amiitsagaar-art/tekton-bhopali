import { NextResponse } from "next/server";
import { db } from "@/db";
import { workers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { name, phone, category, experienceYears, basePrice, locations, bio, avatarUrl, isVerified, status, portfolio } = body;
  
  const updateFields: any = {};
  if (name !== undefined) updateFields.name = name;
  if (phone !== undefined) updateFields.phone = phone;
  if (category !== undefined) updateFields.category = category;
  if (experienceYears !== undefined) updateFields.experienceYears = Number(experienceYears);
  if (basePrice !== undefined) updateFields.basePrice = Number(basePrice);
  if (locations !== undefined) updateFields.locations = locations;
  if (bio !== undefined) updateFields.bio = bio;
  if (avatarUrl !== undefined) updateFields.avatarUrl = avatarUrl;
  if (isVerified !== undefined) updateFields.isVerified = Boolean(isVerified);
  if (status !== undefined) updateFields.status = status;
  if (portfolio !== undefined) updateFields.portfolio = portfolio;

  try {
    const updated = await db
      .update(workers)
      .set(updateFields)
      .where(eq(workers.id, Number(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error: any) {
    console.error("[DATABASE ERROR] Updating worker failed:", error);
    return NextResponse.json({ error: "Failed to update worker in database: " + error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const deleted = await db
      .delete(workers)
      .where(eq(workers.id, Number(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, deletedId: deleted[0].id });
  } catch (error: any) {
    console.error("[DATABASE ERROR] Deleting worker failed:", error);
    return NextResponse.json({ error: "Failed to delete worker from database: " + error.message }, { status: 500 });
  }
}
