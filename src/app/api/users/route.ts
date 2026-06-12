import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const phone = searchParams.get("phone");

    // Lookup by phone (used by profile page OTP login)
    if (phone) {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.phone, phone.trim()))
        .limit(1);

      if (result && result.length > 0) {
        return NextResponse.json({ exists: true, user: result[0] });
      } else {
        return NextResponse.json({ exists: false, error: "User not found" }, { status: 404 });
      }
    }

    // Lookup by email
    if (email) {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, email.trim().toLowerCase()))
        .limit(1);

      if (result && result.length > 0) {
        return NextResponse.json({ exists: true, user: result[0] });
      } else {
        return NextResponse.json({ exists: false, error: "User not found" }, { status: 404 });
      }
    }

    // No filter — fetch all users (admin only typically)
    const allUsers = await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));
    return NextResponse.json(allUsers);
  } catch (error: any) {
    console.error("[DATABASE ERROR] Querying users failed:", error);
    return NextResponse.json({ error: "Database error: " + error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, location, photoUrl } = body;

    if (!name || !email || !location) {
      return NextResponse.json({ error: "Missing required fields (name, email, location)." }, { status: 400 });
    }

    const cleanedEmail = email.trim().toLowerCase();

    // Check if email is already registered
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, cleanedEmail))
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: "This email is already registered. Please Login securely instead!" }, { status: 400 });
    }

    const userValues = {
      name: name.trim(),
      phone: phone ? phone.trim() : null,
      email: cleanedEmail,
      location: location.trim(),
      photoUrl: photoUrl ? photoUrl.trim() : null,
    };

    // Google Sheets Integration: Forward payload to Google Sheets Apps Script Webhook asynchronously
    const sheetWebhook = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    if (sheetWebhook) {
      try {
        const sheetPayload = {
          ...userValues,
          type: "user",
          userName: userValues.name,
          userPhone: userValues.phone,
          userEmail: userValues.email,
          userLocation: userValues.location,
          createdAt: new Date().toISOString(),
        };

        fetch(sheetWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sheetPayload)
        }).catch(err => console.error("Google Sheets forward failure (user):", err));
      } catch (sheetErr) {
        console.warn("Async user sheet forwarding caught error:", sheetErr);
      }
    }

    const inserted = await db
      .insert(users)
      .values(userValues)
      .returning();

    return NextResponse.json({ success: true, user: inserted[0] }, { status: 201 });
  } catch (error: any) {
    console.error("[DATABASE ERROR] Registering user failed:", error);
    return NextResponse.json({ error: "Database error: " + error.message }, { status: 500 });
  }
}
