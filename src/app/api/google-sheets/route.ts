import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json({ error: "Type and data parameters are required." }, { status: 400 });
    }

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!spreadsheetId || !clientEmail || !privateKey) {
      return NextResponse.json(
        { error: "Google Sheets server credentials are not configured. Please set GOOGLE_SPREADSHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, and GOOGLE_PRIVATE_KEY." },
        { status: 500 }
      );
    }

    // Initialize Google JWT auth securely
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    let range = "";
    let values: any[][] = [];
    const timestamp = new Date().toISOString();

    // Map inputs to the exact spreadsheet columns dynamically
    if (type === "booking") {
      const { name, phone, address, zone, category, task, apptDate } = data;
      if (!name || !phone || !category) {
        return NextResponse.json({ error: "Missing required booking details (name, phone, category)." }, { status: 400 });
      }
      // Target range and append order: Timestamp, Name, Phone, Address, Zone, Category, Task, Appt Date
      range = "Bookings!A:Z";
      values = [
        [timestamp, name, phone, address || "", zone || "", category, task || "", apptDate || ""]
      ];
    } else if (type === "user") {
      const { name, email, phone, passwordHash } = data;
      if (!name || !phone) {
        return NextResponse.json({ error: "Missing required customer sign up details (name, phone)." }, { status: 400 });
      }
      const tokenValue = passwordHash || data.passwordHashOrToken || data.token || "";
      // Target range and append order: Name, Email, Phone, Password Hash/Token
      range = "User Details!A:Z";
      values = [
        [name, email || "", phone, tokenValue]
      ];
    } else if (type === "vendor") {
      const { vendorName, skills, phone, kycStatus } = data;
      const finalVendorName = vendorName || data.name;
      if (!finalVendorName || !phone) {
        return NextResponse.json({ error: "Missing required vendor details (vendorName, phone)." }, { status: 400 });
      }
      // Target range and append order: Vendor Name, Skills, Phone, KYC status
      range = "Vendor details!A:Z";
      values = [
        [finalVendorName, skills || "", phone, kycStatus || "Pending"]
      ];
    } else {
      return NextResponse.json({ error: "Invalid action type specified. Use 'booking', 'user', or 'vendor'." }, { status: 400 });
    }

    // Call Google Sheets API to append row safely
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values,
      },
    });

    return NextResponse.json({
      success: true,
      updatedRange: response.data.updates?.updatedRange,
      updatedRows: response.data.updates?.updatedRows,
    });
  } catch (error: any) {
    console.error("Google Sheets API Append Error:", error);
    return NextResponse.json({ error: error.message || "Failed to append data to Google Sheet" }, { status: 500 });
  }
}
