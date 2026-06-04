/**
 * verifyAdminToken — Server-side middleware helper
 * Checks the x-admin-token header against the ADMIN_SECRET_TOKEN env variable.
 * Returns true if valid, false if unauthorized.
 */
export function verifyAdminToken(request: Request): boolean {
  const token = request.headers.get("x-admin-token");
  const secretToken = process.env.ADMIN_SECRET_TOKEN;

  if (!secretToken) {
    // If env var not set, block all access as a safety measure
    console.error("[SECURITY] ADMIN_SECRET_TOKEN not set in environment variables!");
    return false;
  }

  return token === secretToken;
}
