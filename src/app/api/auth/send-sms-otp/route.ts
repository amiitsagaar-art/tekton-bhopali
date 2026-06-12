import { NextResponse } from "next/server";
import { db } from "@/db";
import { phoneOtps } from "@/db/schema";
import { eq } from "drizzle-orm";

// Pluggable SMS Gateway function wrapper
async function sendSMS(mobileNumber: string, otp: string): Promise<{ success: boolean; provider?: string; error?: string }> {
  const apiKey = process.env.SMS_API_KEY;
  // Default to twilio or fast2sms if key is set, or let provider be configured via env
  const provider = process.env.SMS_PROVIDER || "fast2sms";

  if (!apiKey) {
    console.log(`[SMS OTP DEBUG] SMS_API_KEY is missing. Mock OTP logged for ${mobileNumber}: ${otp}`);
    return { success: false, error: "SMS_API_KEY is not configured" };
  }

  try {
    if (provider === "fast2sms") {
      // Fast2SMS API integration
      // Fast2SMS accepts authorization header and json body: { route: 'otp', variables_values: otp, numbers: mobileNumber }
      const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          "authorization": apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          route: "otp",
          variables_values: otp,
          numbers: mobileNumber
        })
      });

      const data = await response.json();
      if (data.return) {
        console.log(`[Fast2SMS] OTP sent successfully to ${mobileNumber}`);
        return { success: true, provider: "fast2sms" };
      } else {
        throw new Error(data.message || "Fast2SMS API returned failure");
      }
    } else if (provider === "msg91") {
      // MSG91 API integration
      const response = await fetch(`https://api.msg91.com/api/v5/otp?template_id=${process.env.MSG91_TEMPLATE_ID}&mobile=${mobileNumber}&otp=${otp}`, {
        method: "POST",
        headers: {
          "authkey": apiKey
        }
      });
      const data = await response.json();
      if (data.type === "success") {
        console.log(`[MSG91] OTP sent successfully to ${mobileNumber}`);
        return { success: true, provider: "msg91" };
      } else {
        throw new Error(data.message || "MSG91 API returned failure");
      }
    } else if (provider === "twilio") {
      // Twilio API integration
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = apiKey; // AuthToken serves as API key here
      const fromNumber = process.env.TWILIO_FROM_NUMBER;

      if (!accountSid || !fromNumber) {
        throw new Error("Twilio configuration missing (TWILIO_ACCOUNT_SID or TWILIO_FROM_NUMBER)");
      }

      const authHeader = "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64");
      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      
      const params = new URLSearchParams();
      params.append("To", mobileNumber.startsWith("+") ? mobileNumber : `+91${mobileNumber}`);
      params.append("From", fromNumber);
      params.append("Body", `Your Tekton sign-in OTP code is ${otp}. Valid for 5 minutes.`);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": authHeader,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params.toString()
      });

      const data = await response.json();
      if (response.ok) {
        console.log(`[Twilio] OTP sent successfully to ${mobileNumber}`);
        return { success: true, provider: "twilio" };
      } else {
        throw new Error(data.message || "Twilio API returned failure");
      }
    } else {
      throw new Error(`SMS Provider ${provider} is not supported or misconfigured.`);
    }
  } catch (error: any) {
    console.error(`[SMS Gateway Error] Provider: ${provider}, Error:`, error);
    return { success: false, error: error.message };
  }
}

export async function POST(request: Request) {
  let otp = "";
  try {
    const { mobileNumber } = await request.json();
    if (!mobileNumber) {
      return NextResponse.json({ error: "Mobile number is required" }, { status: 400 });
    }

    // Clean phone number (expecting 10 digits, remove non-numeric chars)
    const cleanPhone = (mobileNumber as string).replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      return NextResponse.json({ error: "Please enter a valid 10-digit mobile number" }, { status: 400 });
    }

    // Generate a 6-digit OTP code
    otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

    // Save or update OTP in DB
    const existing = await db.select().from(phoneOtps).where(eq(phoneOtps.phone, cleanPhone)).limit(1);
    if (existing.length > 0) {
      await db.update(phoneOtps).set({ code: otp, expiresAt }).where(eq(phoneOtps.phone, cleanPhone));
    } else {
      await db.insert(phoneOtps).values({ phone: cleanPhone, code: otp, expiresAt });
    }

    console.log(`[OTP DEBUG] Generated OTP for ${cleanPhone}: ${otp}`);

    const apiKey = process.env.SMS_API_KEY;
    const isDev = process.env.NODE_ENV === "development" || !process.env.VERCEL_ENV;

    if (!apiKey) {
      console.warn("⚠️ SMS_API_KEY environment variable is not configured. Falling back to mock mode.");
      return NextResponse.json({
        success: true,
        mock: true,
        otp: otp,
        message: "OTP generated successfully (Mock Mode: SMS key not configured)"
      });
    }

    // Attempt to send the SMS OTP
    const smsResult = await sendSMS(cleanPhone, otp);
    if (!smsResult.success) {
      console.warn(`⚠️ SMS transmission failed (${smsResult.error}). Falling back to mock mode.`);
      return NextResponse.json({
        success: true,
        mock: true,
        otp: otp,
        message: `Failed to send SMS (${smsResult.error}). Falling back to mock mode.`
      });
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent via SMS successfully"
    });

  } catch (error: any) {
    console.error("🔥 Detailed SMS OTP Send Failure Log:", error);
    
    if (otp) {
      return NextResponse.json({
        success: true,
        mock: true,
        otp: otp,
        message: "Failed to process SMS transmission. Falling back to mock mode: " + error.message
      });
    }

    return NextResponse.json({ error: "Failed to process OTP: " + error.message }, { status: 500 });
  }
}
