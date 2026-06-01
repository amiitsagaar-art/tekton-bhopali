import { NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/utils/whatsapp";
import { db } from "@/db";
import { appointments } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const dbAppointments = await db.select().from(appointments).orderBy(desc(appointments.createdAt));
    return NextResponse.json(dbAppointments);
  } catch (dbError: any) {
    console.error("[DATABASE ERROR] Fetching appointments failed:", dbError);
    return NextResponse.json({ error: "Failed to retrieve appointments from database: " + dbError.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      phoneNumber,
      locationZone,
      exactAddress,
      serviceCategory,
      description,
      visitDate,
      timeSlot,
      totalPrice,
    } = body;

    const sheetdbUrl = process.env.SHEETDB_API_URL || "https://sheetdb.io/api/v1/e1d9cpd85s3zu";

    // 1. Save strictly to Drizzle database
    let dbBookingId = "";
    try {
      const inserted = await db.insert(appointments).values({
        customerName: customerName || "",
        customerPhone: phoneNumber || "",
        customerAddress: exactAddress || "",
        location: locationZone || "",
        category: serviceCategory || "",
        description: description || "No details provided",
        appointmentDate: visitDate || "",
        appointmentTime: timeSlot || "",
        status: "Confirmed",
      }).returning();
      
      if (inserted && inserted[0]) {
        dbBookingId = `TEK-${inserted[0].id}`;
      } else {
        throw new Error("Insert succeeded but no record returned.");
      }
    } catch (dbError: any) {
      console.error("[DATABASE ERROR] Inserting appointment to Drizzle failed:", dbError);
      return NextResponse.json({ error: "Failed to save appointment to database: " + dbError.message }, { status: 500 });
    }

    // 2. Format strictly wrapped in a "data" object array for SheetDB API
    const payload = {
      data: [
        {
          bookingId: dbBookingId,
          customerName: customerName || "",
          phoneNumber: phoneNumber || "",
          locationZone: locationZone || "",
          exactAddress: exactAddress || "",
          serviceCategory: serviceCategory || "",
          description: description || "No details provided",
          visitDate: visitDate || "",
          timeSlot: timeSlot || "",
          totalPrice: totalPrice || 0,
          status: "Confirmed",
        },
      ],
    };

    // 3. Post to SheetDB as a remote backup
    try {
      const response = await fetch(sheetdbUrl, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`SheetDB API returned error: ${errorText}`);
      }
    } catch (sheetdbError: any) {
      console.warn("[DATABASE FAILOVER] SheetDB write failed. local database save succeeded.", sheetdbError);
    }

    // 4. Send WhatsApp confirmation to customer
    await sendWhatsAppMessage(phoneNumber, `Hi ${customerName}, your booking for ${serviceCategory} on ${visitDate} at ${timeSlot} has been received successfully! Tracking ID: ${dbBookingId}. Team Tekton.`);

    return NextResponse.json(
      {
        success: true,
        bookingId: dbBookingId,
        message: "Booking confirmed",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error confirming booking:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

export async function PUT() {
  return new Response("Method Not Allowed", {
    status: 405,
    headers: { Allow: "GET, POST" },
  });
}

export async function DELETE() {
  return new Response("Method Not Allowed", {
    status: 405,
    headers: { Allow: "GET, POST" },
  });
}
