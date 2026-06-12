import { NextResponse } from "next/server";
import { db } from "@/db";
import { recentWorks } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { verifyAdminToken } from "@/lib/adminAuth";

export async function GET() {
  try {
    const works = await db.select().from(recentWorks).orderBy(desc(recentWorks.createdAt));
    return NextResponse.json(works);
  } catch (error: any) {
    console.error("[GET RECENT WORKS ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch recent works" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { title, category, location, imageUrl } = body;

    if (!title || !category || !location || !imageUrl) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    const newWork = await db.insert(recentWorks).values({
      title,
      category,
      location,
      imageUrl,
    }).returning();

    return NextResponse.json({ success: true, message: "Published successfully!", work: newWork[0] }, { status: 201 });
  } catch (error: any) {
    console.error("[POST RECENT WORK ERROR]", error);
    return NextResponse.json({ error: "Failed to publish recent work." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing required parameter 'id'." }, { status: 400 });
    }

    const deleted = await db.delete(recentWorks).where(eq(recentWorks.id, Number(id))).returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Project photo not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, deletedId: deleted[0].id });
  } catch (error: any) {
    console.error("[DELETE RECENT WORK ERROR]", error);
    return NextResponse.json({ error: "Failed to delete recent work." }, { status: 500 });
  }
}
