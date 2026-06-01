import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { name, phone, email, location } = body;
  
  const updateFields: any = {};
  if (name !== undefined) updateFields.name = name;
  if (phone !== undefined) updateFields.phone = phone;
  if (email !== undefined) updateFields.email = email;
  if (location !== undefined) updateFields.location = location;

  try {
    const updated = await db
      .update(users)
      .set(updateFields)
      .where(eq(users.id, Number(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error: any) {
    console.error("[DATABASE ERROR] Updating user failed:", error);
    return NextResponse.json({ error: "Failed to update user in database: " + error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const deleted = await db
      .delete(users)
      .where(eq(users.id, Number(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, deletedId: deleted[0].id });
  } catch (error: any) {
    console.error("[DATABASE ERROR] Deleting user failed:", error);
    return NextResponse.json({ error: "Failed to delete user from database: " + error.message }, { status: 500 });
  }
}
