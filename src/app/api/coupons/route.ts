import { NextResponse } from "next/server";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyAdminToken } from "@/lib/adminAuth";

// GET all coupons (admin only)
export async function GET(request: Request) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const all = await db.select().from(coupons).orderBy(coupons.createdAt);
    return NextResponse.json(all);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST — create a new coupon
export async function POST(request: Request) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { code, discountValue, isPercentage, description } = body;

    if (!code || discountValue == null) {
      return NextResponse.json({ error: "code and discountValue are required" }, { status: 400 });
    }

    const inserted = await db.insert(coupons).values({
      code: String(code).toUpperCase().trim(),
      discountValue: Number(discountValue),
      isPercentage: Boolean(isPercentage),
      description: description || "",
      isActive: true,
    }).returning();

    return NextResponse.json(inserted[0], { status: 201 });
  } catch (error: any) {
    if (error.message?.includes("unique")) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH — toggle isActive or update a coupon
export async function PATCH(request: Request) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id, isActive } = await request.json();
    const updated = await db.update(coupons)
      .set({ isActive: Boolean(isActive) })
      .where(eq(coupons.id, Number(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE — remove a coupon
export async function DELETE(request: Request) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await request.json();
    await db.delete(coupons).where(eq(coupons.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
