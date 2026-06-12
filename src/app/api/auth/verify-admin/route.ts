import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Support both token-based AND password-based admin auth
    const token = body.adminToken || body.token;
    const password = body.password;

    // Primary: ADMIN_SECRET_TOKEN (long secure token for API calls)
    const secretToken = process.env.ADMIN_SECRET_TOKEN;
    // Secondary: ADMIN_PASSWORD (human-readable password from .env)
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!secretToken && !adminPassword) {
      console.error("[SECURITY] Neither ADMIN_SECRET_TOKEN nor ADMIN_PASSWORD is set in .env!");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // Check token match first, then password match
    const isTokenValid = secretToken && token && token === secretToken;
    const isPasswordValid = adminPassword && password && password === adminPassword;
    // Also allow password used as token (for dashboard login input field)
    const isPasswordAsToken = adminPassword && token && token === adminPassword;

    if (isTokenValid || isPasswordValid || isPasswordAsToken) {
      // Return the actual ADMIN_SECRET_TOKEN so frontend can use it for API calls
      return NextResponse.json({ success: true, token: secretToken || adminPassword });
    } else {
      return NextResponse.json({ success: false, error: "Invalid admin credentials" }, { status: 401 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
