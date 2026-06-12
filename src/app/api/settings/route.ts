import { NextResponse } from "next/server";
import { db } from "@/db";
import { systemSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyAdminToken } from "@/lib/adminAuth";

// GET — Public settings (e.g. enableCashPayment toggle)
export async function GET() {
  try {
    const settingsList = await db.select().from(systemSettings);
    const settingsMap: Record<string, string> = {};
    for (const row of settingsList) {
      settingsMap[row.key] = row.value;
    }
    return NextResponse.json({ success: true, settings: settingsMap });
  } catch (error: any) {
    console.error("[SETTINGS GET ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST — Admin only, update a settings value
export async function POST(request: Request) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: "Unauthorized. Admin token required." }, { status: 401 });
  }
  try {
    const { key, value } = await request.json();
    if (!key || value === undefined) {
      return NextResponse.json({ error: "key and value are required" }, { status: 400 });
    }

    const existing = await db.select().from(systemSettings).where(eq(systemSettings.key, key)).limit(1);

    if (existing.length > 0) {
      await db.update(systemSettings)
        .set({ value: String(value), updatedAt: new Date() })
        .where(eq(systemSettings.key, key));
    } else {
      await db.insert(systemSettings).values({ key, value: String(value) });
    }

    return NextResponse.json({ success: true, key, value });
  } catch (error: any) {
    console.error("[SETTINGS POST ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
