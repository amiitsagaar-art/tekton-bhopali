import { NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/utils/whatsapp";
import { db } from "@/db";
import { appointments, workers } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { verifyAdminToken } from "@/lib/adminAuth";
import { SITE_CONFIG } from "@/config/site";
import { sendPushNotification } from "@/lib/firebaseAdmin";

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

    // 1. Save strictly to Drizzle/Neon PostgreSQL — Single Source of Truth
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

    // 2. Send WhatsApp confirmation to customer
    await sendWhatsAppMessage(phoneNumber, `Hi ${customerName}, your booking for ${serviceCategory} on ${visitDate} at ${timeSlot} has been received successfully! Tracking ID: ${dbBookingId}. Team Tekton.`);

    // 3. Send WhatsApp notification to Admin if payment is made
    if (transactionId) {
      const adminPhone = process.env.ADMIN_PHONE_NUMBER || SITE_CONFIG.phone || "+919876543210";
      await sendWhatsAppMessage(
        adminPhone,
        `New Paid Booking Confirmed!\nCustomer: ${customerName}\nPhone: ${phoneNumber}\nService: ${serviceCategory}\nVisit Charge: ₹${totalPrice}\nTxn ID: ${transactionId}\nBooking ID: ${dbBookingId}`
      );
    }

    // 4. Send Push Notification to assigned worker (if assigned)
    if (assignedWorkerId) {
      try {
        const workerRes = await db
          .select()
          .from(workers)
          .where(eq(workers.id, Number(assignedWorkerId)))
          .limit(1);

        if (workerRes[0] && workerRes[0].pushToken) {
          await sendPushNotification(
            workerRes[0].pushToken,
            "New Task Assigned! 🛠️",
            `Hello ${workerRes[0].name}, a new ${serviceCategory} task has been assigned to you.`
          );
        }
      } catch (pushError) {
        console.warn("Failed to send assignment push notification:", pushError);
      }
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
