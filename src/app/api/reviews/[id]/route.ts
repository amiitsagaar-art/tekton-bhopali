import { NextResponse } from "next/server";
import { db } from "@/db";
import { reviews } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyAdminToken } from "@/lib/adminAuth";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
  }

  try {
    const p = await params;
    const { id } = p;
    
    if (!id) {
      return NextResponse.json({ error: "Review ID is required" }, { status: 400 });
    }

    await db.delete(reviews).where(eq(reviews.id, id));
    return NextResponse.json({ success: true, message: "Review deleted successfully" });
  } catch (error: any) {
    console.error("[DELETE REVIEW ERROR]", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
