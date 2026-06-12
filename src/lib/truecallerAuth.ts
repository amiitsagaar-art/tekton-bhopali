// src/lib/truecallerAuth.ts
import fetch from "node-fetch";

/**
 * Verify a Truecaller profile token.
 * If the environment variable `TRUECALLER_APP_KEY` is missing, the function gracefully
 * falls back to a mock verification that logs the payload and returns a dummy profile.
 *
 * Additionally, when the token value is "mock-token" (used for testing when the
 * Truecaller app does not return a token), we skip the real API call and return the
 * provided profile directly.
 */
export async function verifyTruecallerToken(payload: {
  token: string;
  profile: { name: string; phone: string };
}): Promise<{ success: boolean; profile?: { name: string; phone: string } }> {
  const { token, profile } = payload;
  const appKey = process.env.TRUECALLER_APP_KEY;

  // ---------------------------------------------------------------
  // 1️⃣ Mock token shortcut – used in development & when Truecaller
  //     returns only name/phone without a token.
  // ---------------------------------------------------------------
  if (token === "mock-token") {
    console.warn("[Truecaller] Using mock token verification for testing.");
    // Return the profile supplied by the client (already contains name & phone).
    return { success: true, profile };
  }

  // ---------------------------------------------------------------
  // 2️⃣ Development fallback – no real Truecaller credentials.
  // ---------------------------------------------------------------
  if (!appKey) {
    console.warn(
      "[Truecaller] TRUECALLER_APP_KEY missing – using mock verification. Payload:",
      payload
    );
    const mockProfile = {
      name: "Bhopal Tester",
      // Preserve the phone number provided by the client
      phone: payload.profile.phone,
    };
    return { success: true, profile: mockProfile };
  }

  // ---------------------------------------------------------------
  // 3️⃣ Real verification – call the official Truecaller API.
  // ---------------------------------------------------------------
  try {
    const resp = await fetch("https://api.truecaller.com/v1/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, appKey }),
    });

    const data = (await resp.json()) as any;
    if (data && data.success && data.profile) {
      return {
        success: true,
        profile: { name: data.profile.name, phone: data.profile.phone },
      };
    }
    console.error("[Truecaller] Verification failed", data);
    return { success: false };
  } catch (err) {
    console.error("[Truecaller] Unexpected error during verification", err);
    return { success: false };
  }
}
