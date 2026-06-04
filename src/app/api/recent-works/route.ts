import { NextResponse } from "next/server";
import { db } from "@/db";
import { recentWorks } from "@/db/schema";
import { desc } from "drizzle-orm";

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
