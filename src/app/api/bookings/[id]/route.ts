import { NextResponse } from "next/server";
import { updateBookingStatus } from "../route";

export async function PUT(request: Request, context: any) {
  try {
    const { id } = context.params;
    const body = await request.json();
    
    if (!body.status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    const updated = updateBookingStatus(id, body.status);
    
    if (updated) {
      return NextResponse.json(updated);
    } else {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
