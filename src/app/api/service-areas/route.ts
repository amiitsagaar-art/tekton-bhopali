import { NextResponse } from "next/server";
import { db } from "@/db";
import { serviceAreas } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const areas = await db.select().from(serviceAreas).orderBy(desc(serviceAreas.createdAt));
    return NextResponse.json(areas);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch service areas." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, isActive } = body;

    if (!name) return NextResponse.json({ error: "Area name is required" }, { status: 400 });

    const newArea = await db.insert(serviceAreas).values({
      name: name.trim(),
      isActive: isActive !== undefined ? isActive : true,
    }).returning();

    return NextResponse.json({ success: true, area: newArea[0] }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to add service area." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, isActive } = body;

    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const updated = await db
      .update(serviceAreas)
      .set({ isActive })
      .where(eq(serviceAreas.id, id))
      .returning();

    return NextResponse.json({ success: true, area: updated[0] });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update service area." }, { status: 500 });
  }
}
