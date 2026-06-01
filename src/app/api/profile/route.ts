import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { google } from "googleapis";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { lookupKey, updateData } = body;

    if (!lookupKey || !updateData) {
      return NextResponse.json({ error: "lookupKey and updateData are required." }, { status: 400 });
    }

    const { name, phone, email, location, alternativeAddress, avatarUrl } = updateData;

    // 1. Prepare database update fields
    const dbUpdateFields: any = {};
    if (name !== undefined) dbUpdateFields.name = name.trim();
    if (phone !== undefined) dbUpdateFields.phone = phone.trim();
    if (email !== undefined) dbUpdateFields.email = email.trim();
    if (location !== undefined) dbUpdateFields.location = location.trim();

    let updatedUser: any = null;

    // 2. Update SQL database (Drizzle ORM) strictly
    // Find the user by lookupKey (email or phone)
    let userRecord = await db
      .select()
      .from(users)
      .where(eq(users.phone, lookupKey))
      .limit(1);

    if (userRecord.length === 0 && lookupKey.includes("@")) {
      userRecord = await db
        .select()
        .from(users)
        .where(eq(users.email, lookupKey))
        .limit(1);
    }

    if (userRecord.length === 0) {
      return NextResponse.json({ error: "User not found in database" }, { status: 404 });
    }

    const userId = userRecord[0].id;
    const result = await db
      .update(users)
      .set(dbUpdateFields)
      .where(eq(users.id, userId))
      .returning();

    if (result.length > 0) {
      updatedUser = {
        ...result[0],
        alternativeAddress: alternativeAddress || "",
        avatarUrl: avatarUrl || "",
      };
    } else {
      throw new Error("Update succeeded but returned no rows.");
    }

    // 3. Secure Google Sheets Synchronization
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (spreadsheetId && clientEmail && privateKey) {
      try {
        const auth = new google.auth.JWT({
          email: clientEmail,
          key: privateKey.replace(/\\n/g, "\n"),
          scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });

        const sheets = google.sheets({ version: "v4", auth });

        // Columns: Name, Email, Phone, Alternative Address, Profile Picture URL, Bhopal Zone
        const range = "User Details!A:Z";
        const values = [
          [
            name || updatedUser?.name || "",
            email || updatedUser?.email || "",
            phone || updatedUser?.phone || lookupKey,
            alternativeAddress || "",
            avatarUrl || "",
            location || updatedUser?.location || "",
          ]
        ];

        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range,
          valueInputOption: "RAW",
          insertDataOption: "INSERT_ROWS",
          requestBody: {
            values,
          },
        });
        
        console.log("[GOOGLE SHEETS] Successfully appended updated user profile details row.");
      } catch (sheetError) {
        console.error("[GOOGLE SHEETS FAIL] Profile sheets synchronization error:", sheetError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        id: updatedUser?.id,
        name: name || updatedUser?.name,
        phone: phone || updatedUser?.phone,
        email: email || updatedUser?.email,
        location: location || updatedUser?.location,
        alternativeAddress: alternativeAddress || updatedUser?.alternativeAddress || "",
        avatarUrl: avatarUrl || updatedUser?.avatarUrl || "",
      },
    });
  } catch (error: any) {
    console.error("Profile API POST Error:", error);
    return NextResponse.json({ error: "Failed to update user profile in database: " + error.message }, { status: 500 });
  }
}
