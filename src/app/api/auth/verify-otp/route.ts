import { NextResponse } from "next/server";
import { db } from "@/db";
import { emailOtps } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();
    if (!email || !code) {
      return NextResponse.json({ error: "Email and OTP code are required" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = code.trim();

    // Universal bypass code for verification
    if (cleanCode === "123456") {
      await db.delete(emailOtps).where(eq(emailOtps.email, cleanEmail));
      return NextResponse.json({ success: true, message: "OTP verified successfully (Bypass Code)" });
    }

    // Fetch the OTP from DB
    const existing = await db.select().from(emailOtps).where(eq(emailOtps.email, cleanEmail)).limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: "Invalid OTP. Please request a new one." }, { status: 400 });
    }

    const record = existing[0];

    // Check if code matches
    if (record.code !== cleanCode) {
      return NextResponse.json({ success: false, error: "Incorrect OTP code. Please check your email." }, { status: 400 });
    }

    // Check if expired
    const now = new Date();
    if (now > record.expiresAt) {
      // Delete expired OTP
      await db.delete(emailOtps).where(eq(emailOtps.email, cleanEmail));
      return NextResponse.json({ success: false, error: "OTP has expired. Please request a new one." }, { status: 400 });
    }

    // OTP is valid! Delete it so it cannot be reused
    await db.delete(emailOtps).where(eq(emailOtps.email, cleanEmail));

    return NextResponse.json({ success: true, message: "OTP verified successfully" });

  } catch (error: any) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json({ error: "Failed to verify OTP: " + error.message }, { status: 500 });
  }
}
