import { NextResponse } from "next/server";
import { db } from "@/db";
import { emailOtps } from "@/db/schema";
import { eq } from "drizzle-orm";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    // Generate a 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

    // Save or update OTP in DB
    const existing = await db.select().from(emailOtps).where(eq(emailOtps.email, cleanEmail)).limit(1);
    if (existing.length > 0) {
      await db.update(emailOtps).set({ code: otp, expiresAt }).where(eq(emailOtps.email, cleanEmail));
    } else {
      await db.insert(emailOtps).values({ email: cleanEmail, code: otp, expiresAt });
    }

    console.log(`[OTP DEBUG] Generated OTP for ${cleanEmail}: ${otp}`);

    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (emailUser && emailPass) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });

      const mailOptions = {
        from: `"Tekton Bhopal" <${emailUser}>`,
        to: cleanEmail,
        subject: "Your Tekton Sign-in OTP Code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; rounded-corners: 10px;">
            <h2 style="color: #1e293b; text-align: center;">Tekton Bhopal Authentication</h2>
            <p style="color: #475569; font-size: 16px;">Hello,</p>
            <p style="color: #475569; font-size: 16px;">Please use the verification code below to login or sign up at Tekton Bhopal. This code is valid for 5 minutes:</p>
            <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; padding: 15px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #b45309;">${otp}</span>
            </div>
            <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 30px;">If you did not request this code, please ignore this email.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      return NextResponse.json({ success: true, message: "OTP sent to email successfully" });
    } else {
      console.warn("EMAIL_USER or EMAIL_PASS environment variables are not configured!");
      return NextResponse.json({
        success: true,
        message: "OTP generated successfully (Mock Mode: Please check server console for code)"
      });
    }

  } catch (error: any) {
    console.error("Error sending OTP:", error);
    return NextResponse.json({ error: "Failed to send OTP: " + error.message }, { status: 500 });
  }
}
