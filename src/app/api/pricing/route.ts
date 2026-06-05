import { NextResponse } from "next/server";
import { db } from "@/db";
import { servicePricing, coupons } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyAdminToken } from "@/lib/adminAuth";

// Default category prices used if DB has no record yet
const DEFAULT_PRICES: Record<string, number> = {
  Plumbing: 149,
  Electrician: 199,
  Carpentry: 179,
  Painting: 249,
  Cleaning: 299,
  "AC Repair": 399,
  "Civil Work": 499,
  "Home Tutors": 299,
};

// GET — public, returns all service prices + active coupons
export async function GET() {
  try {
    const [prices, activeCoupons] = await Promise.all([
      db.select().from(servicePricing),
      db.select().from(coupons).where(eq(coupons.isActive, true)),
    ]);

    // Merge DB prices with defaults (so new categories always have a price)
    const priceMap: Record<string, number> = { ...DEFAULT_PRICES };
    for (const row of prices) {
      priceMap[row.category] = row.basePrice;
    }

    return NextResponse.json({ prices: priceMap, coupons: activeCoupons });
  } catch (error: any) {
    // Fallback to defaults if DB is unavailable
    console.error("[PRICING ERROR]", error);
    return NextResponse.json({ prices: DEFAULT_PRICES, coupons: [] });
  }
}

// POST — admin only, upsert a service price
export async function POST(request: Request) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { category, basePrice } = await request.json();
    if (!category || basePrice == null || isNaN(Number(basePrice))) {
      return NextResponse.json({ error: "category and basePrice are required" }, { status: 400 });
    }

    // Upsert: update if exists, insert if not
    const existing = await db.select().from(servicePricing).where(eq(servicePricing.category, category)).limit(1);

    if (existing.length > 0) {
      await db.update(servicePricing)
        .set({ basePrice: Number(basePrice), updatedAt: new Date() })
        .where(eq(servicePricing.category, category));
    } else {
      await db.insert(servicePricing).values({ category, basePrice: Number(basePrice) });
    }

    return NextResponse.json({ success: true, category, basePrice: Number(basePrice) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
