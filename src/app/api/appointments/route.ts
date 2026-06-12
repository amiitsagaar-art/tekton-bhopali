import { NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/utils/whatsapp";
import { db } from "@/db";
import { appointments } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { verifyAdminToken } from "@/lib/adminAuth";
import { SITE_CONFIG } from "@/config/site";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workerId = searchParams.get("workerId");

  if (!workerId) {
    if (!verifyAdminToken(request)) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }
  }

  try {
    let dbAppointments;
    if (workerId) {
      dbAppointments = await db
        .select()
        .from(appointments)
        .where(eq(appointments.assignedWorkerId, Number(workerId)))
        .orderBy(desc(appointments.createdAt));
    } else {
      dbAppointments = await db
        .select()
        .from(appointments)
        .orderBy(desc(appointments.createdAt));
    }
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
      assignedWorkerId,
      transactionId,
    } = body;

    const sheetdbUrl = process.env.SHEETDB_API_URL || "https://sheetdb.io/api/v1/e1d9cpd85s3zu";

    // 1. Save strictly to Drizzle database
    let dbBookingId = "";
    try {
      const charge = totalPrice ? Number(totalPrice) : 0;
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
        assignedWorkerId: assignedWorkerId ? Number(assignedWorkerId) : null,
        transactionId: transactionId || null,
        paymentStatus: transactionId ? "Paid" : "Pending",
        visitCharge: charge,
        extraCharge: 0,
        totalAmount: charge,
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
          transactionId: transactionId || "",
          paymentStatus: transactionId ? "Paid" : "Pending",
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

    // 5. Send WhatsApp notification to Admin if payment is made
    if (transactionId) {
      const adminPhone = process.env.ADMIN_PHONE_NUMBER || SITE_CONFIG.phone || "+919876543210";
      await sendWhatsAppMessage(
        adminPhone,
        `New Paid Booking Confirmed!\nCustomer: ${customerName}\nPhone: ${phoneNumber}\nService: ${serviceCategory}\nVisit Charge: ₹${totalPrice}\nTxn ID: ${transactionId}\nBooking ID: ${dbBookingId}`
      );
    }

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
