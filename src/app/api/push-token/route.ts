import { NextResponse } from "next/server";
import { db } from "@/db";
import { workers, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, role, token } = body;

    if (!phone || !role || !token) {
      return NextResponse.json(
        { error: "phone, role, and token are required." },
        { status: 400 }
      );
    }

    if (role === "worker") {
      // Find worker by phone number
      const workerRes = await db
        .select()
        .from(workers)
        .where(eq(workers.phone, phone))
        .limit(1);

      if (workerRes.length === 0) {
        return NextResponse.json({ error: "Worker not found with this phone number." }, { status: 404 });
      }

      await db
        .update(workers)
        .set({ pushToken: token })
        .where(eq(workers.phone, phone));

      console.log(`[PUSH TOKEN] Synced push token for worker ${phone}`);
      return NextResponse.json({ success: true, message: "Worker push token synced." });

    } else if (role === "user") {
      // Find user by phone number
      const userRes = await db
        .select()
        .from(users)
        .where(eq(users.phone, phone))
        .limit(1);

      if (userRes.length === 0) {
        return NextResponse.json({ error: "User not found with this phone number." }, { status: 404 });
      }

      await db
        .update(users)
        .set({ pushToken: token })
        .where(eq(users.phone, phone));

      console.log(`[PUSH TOKEN] Synced push token for user ${phone}`);
      return NextResponse.json({ success: true, message: "User push token synced." });

    } else {
      return NextResponse.json({ error: "Invalid role. Must be 'worker' or 'user'." }, { status: 400 });
    }

  } catch (error: any) {
    console.error("[PUSH TOKEN ERROR]", error);
    return NextResponse.json(
      { error: "Failed to sync push token: " + error.message },
      { status: 500 }
    );
  }
}
