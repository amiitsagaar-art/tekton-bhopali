/**
 * Helper client utility for sending form submission data to the Google Sheets backend API.
 */

export interface BookingSubmissionData {
  name: string;
  phone: string;
  address: string;
  zone: string;
  category: string;
  task: string;
  apptDate: string;
}

export interface UserSubmissionData {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
}

export interface VendorSubmissionData {
  vendorName: string;
  skills: string;
  phone: string;
  kycStatus?: "Pending" | "Verified" | "Rejected";
}

export type GoogleSheetsPayload =
  | { type: "booking"; data: BookingSubmissionData }
  | { type: "user"; data: UserSubmissionData }
  | { type: "vendor"; data: VendorSubmissionData };

export interface GoogleSheetsResponse {
  success: boolean;
  updatedRange?: string;
  updatedRows?: number;
  error?: string;
}

/**
 * Appends form submission data to the specified Google Sheet tab.
 * 
 * @param payload The type of action and corresponding form data.
 * @returns A promise resolving to the API response.
 */
export async function submitToGoogleSheets(
  payload: GoogleSheetsPayload
): Promise<GoogleSheetsResponse> {
  try {
    const response = await fetch("/api/google-sheets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || `HTTP error! Status: ${response.status}`,
      };
    }

    return {
      success: true,
      updatedRange: result.updatedRange,
      updatedRows: result.updatedRows,
    };
  } catch (error: any) {
    console.error("Failed to submit to Google Sheets API:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred during submission.",
    };
  }
}
