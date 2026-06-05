import { NextResponse } from "next/server";
import { db } from "@/db";
import { phoneOtps, users } from "@/db/schema";
import { eq, or } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { mobileNumber, otp } = await request.json();
    if (!mobileNumber || !otp) {
      return NextResponse.json({ error: "Mobile number and OTP code are required" }, { status: 400 });
    }

    const cleanPhone = (mobileNumber as string).replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      return NextResponse.json({ error: "Please enter a valid 10-digit mobile number" }, { status: 400 });
    }

    const cleanCode = (otp as string).trim();
    const mockEmail = `${cleanPhone}@tektonbhopal.com`;

    // 1. Universal bypass code for verification
    if (cleanCode === "123456") {
      await db.delete(phoneOtps).where(eq(phoneOtps.phone, cleanPhone));
      const user = await getOrCreateUserProfile(cleanPhone, mockEmail);
      return NextResponse.json({
        success: true,
        message: "OTP verified successfully (Bypass Code)",
        user
      });
    }

    // 2. Fetch the OTP from DB
    const existing = await db.select().from(phoneOtps).where(eq(phoneOtps.phone, cleanPhone)).limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: "Invalid OTP. Please request a new one." }, { status: 400 });
    }

    const record = existing[0];

    // Check if code matches
    if (record.code !== cleanCode) {
      return NextResponse.json({ success: false, error: "Incorrect OTP code. Please check your SMS messages." }, { status: 400 });
    }

    // Check if expired
    const now = new Date();
    if (now > record.expiresAt) {
      // Delete expired OTP
      await db.delete(phoneOtps).where(eq(phoneOtps.phone, cleanPhone));
      return NextResponse.json({ success: false, error: "OTP has expired. Please request a new one." }, { status: 400 });
    }

    // OTP is valid! Delete it so it cannot be reused
    await db.delete(phoneOtps).where(eq(phoneOtps.phone, cleanPhone));

    // Get or initialize user profile
    const user = await getOrCreateUserProfile(cleanPhone, mockEmail);

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully",
      user
    });

  } catch (error: any) {
    console.error("Error verifying SMS OTP:", error);
    return NextResponse.json({ error: "Failed to verify OTP: " + error.message }, { status: 500 });
  }
}

// Helper to fetch or automatically initialize the user's profile row in DB
async function getOrCreateUserProfile(phone: string, email: string) {
  // Query by phone or email
  const result = await db
    .select()
    .from(users)
    .where(or(eq(users.phone, phone), eq(users.email, email)))
    .limit(1);

  if (result && result.length > 0) {
    return result[0];
  }

  // Profile doesn't exist - automatically initialize
  const defaultName = `User_${phone.slice(-4)}`;
  const defaultLocation = "Kolar Road";
  
  const userValues = {
    name: defaultName,
    phone: phone,
    email: email,
    location: defaultLocation,
  };

  // Google Sheets Integration forwarder
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
      }).catch(err => console.error("Google Sheets forward failure (auto-user):", err));
    } catch (sheetErr) {
      console.warn("Async auto-user sheet forwarding caught error:", sheetErr);
    }
  }

  const inserted = await db
    .insert(users)
    .values(userValues)
    .returning();

  return inserted[0];
}
