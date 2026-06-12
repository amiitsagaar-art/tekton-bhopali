import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyTruecallerToken } from "@/lib/truecallerAuth";
import jwt from "jsonwebtoken";

/**
 * POST /api/auth/verify-truecaller
 *
 * Expected payload:
 * {
 *   token: string;
 *   profile: { name: string; phone: string };
 * }
 */
export async function POST(request: Request) {
  try {
    const { token, profile } = await request.json();

    if (!token || !profile?.phone) {
      return NextResponse.json(
        { error: "Invalid payload – token and phone are required" },
        { status: 400 }
      );
    }

    // 1️⃣ Verify the Truecaller token (fallback handled inside helper)
    const verification = await verifyTruecallerToken({ token, profile });
    if (!verification.success || !verification.profile) {
      return NextResponse.json(
        { error: "Truecaller verification failed" },
        { status: 401 }
      );
    }

    // Normalise phone number (digits only)
    const cleanPhone = verification.profile.phone.replace(/\D/g, "");

    // 2️⃣ Upsert user record
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.phone, cleanPhone))
      .limit(1);

    let userId: number;
    if (existing.length > 0) {
      userId = existing[0].id;
    } else {
      const insertRes = await db
        .insert(users)
        .values({
          name: verification.profile.name,
          phone: cleanPhone,
          email: `${cleanPhone}@tektonbhopal.com`,
          location: "Bhopal",
        })
        .returning({ id: users.id });
      userId = insertRes[0].id;
    }

    // 3️⃣ Issue JWT and set the authToken cookie (same settings as SMS flow)
    const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";
    const tokenJwt = jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: "7d" });

    const response = NextResponse.json({
      success: true,
      userId,
      name: verification.profile.name,
    });
    response.cookies.set("authToken", tokenJwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (e: any) {
    console.error("[Truecaller] Server error", e);
    return NextResponse.json(
      { error: "Server error: " + e.message },
      { status: 500 }
    );
  }
}
