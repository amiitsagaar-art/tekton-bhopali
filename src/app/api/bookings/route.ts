import { NextResponse } from "next/server";
import { db } from "@/db";
import { appointments } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const data = await db.select().from(appointments).orderBy(desc(appointments.createdAt));
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[DATABASE ERROR] Fetching bookings failed:", error);
    return NextResponse.json({ error: "Failed to retrieve bookings: " + error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const inserted = await db.insert(appointments).values({
      customerName: data.customer || data.customerName || "Unknown",
      customerPhone: data.phone || data.customerPhone || "",
      customerAddress: data.exactAddress || data.customerAddress || "",
      location: data.location || "",
      category: data.service || data.category || "General",
      description: data.description || "No details provided",
      appointmentDate: data.appointmentDate || "",
      appointmentTime: data.appointmentTime || "",
      status: "Pending",
      transactionId: data.transactionId || null,
      paymentStatus: data.transactionId ? "Paid" : "Pending",
    }).returning();

    return NextResponse.json(inserted[0], { status: 201 });
  } catch (error: any) {
    console.error("[DATABASE ERROR] Creating booking failed:", error);
    return NextResponse.json({ error: "Invalid booking data: " + error.message }, { status: 400 });
  }
}
