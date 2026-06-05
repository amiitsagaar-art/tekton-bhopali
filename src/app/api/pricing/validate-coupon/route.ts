import { NextResponse } from "next/server";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// POST — validate a coupon code (public route, no auth needed)
export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    if (!code) {
      return NextResponse.json({ valid: false, error: "No code provided" }, { status: 400 });
    }

    const result = await db
      .select()
      .from(coupons)
      .where(and(eq(coupons.code, String(code).toUpperCase().trim()), eq(coupons.isActive, true)))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json({ valid: false, error: "Invalid or expired coupon code" });
    }

    const coupon = result[0];
    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discountValue: coupon.discountValue,
      isPercentage: coupon.isPercentage,
      description: coupon.description,
    });
  } catch (error: any) {
    return NextResponse.json({ valid: false, error: "Validation failed" }, { status: 500 });
  }
}
