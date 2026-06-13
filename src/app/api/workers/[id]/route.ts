import { NextResponse } from "next/server";
import { db } from "@/db";
import { workers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyAdminToken } from "@/lib/adminAuth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numericId = Number(id);
  if (isNaN(numericId)) {
    return NextResponse.json({ error: "Invalid worker ID" }, { status: 400 });
  }

  const isAdminRequest = verifyAdminToken(request);
  const workerPhoneHeader = request.headers.get("x-worker-phone");

  if (!isAdminRequest && !workerPhoneHeader) {
    return NextResponse.json({ error: "Unauthorized. Admin or Partner access required." }, { status: 401 });
  }

  const body = await request.json();

  // Normalize aliases
  const nameVal = body.name !== undefined ? body.name : body.fullName;
  const phoneVal = body.phone !== undefined ? body.phone : (body.whatsappNumber !== undefined ? body.whatsappNumber : body.contactNumber);
  const categoryVal = body.category !== undefined ? body.category : body.skills;
  const locationsVal = body.locations !== undefined ? body.locations : body.address;
  const avatarUrlVal = body.avatarUrl !== undefined ? body.avatarUrl : body.photo_url;
  const aadhaarUrlVal = body.aadhaarUrl !== undefined ? body.aadhaarUrl : body.id_proof_url;
  const kycStatusVal = body.kycStatus !== undefined ? body.kycStatus : body.kyc_status;

  // Retrieve current worker from DB to verify identity for non-admins
  let currentWorker: any = null;
  try {
    const workerResult = await db.select().from(workers).where(eq(workers.id, numericId)).limit(1);
    if (!workerResult || workerResult.length === 0) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }
    currentWorker = workerResult[0];
  } catch (error: any) {
    console.error("[DATABASE ERROR] Querying worker failed:", error);
    return NextResponse.json({ error: "Database query error: " + error.message }, { status: 500 });
  }

  if (!isAdminRequest) {
    // Partner updating their own profile
    if (currentWorker.phone !== workerPhoneHeader) {
      return NextResponse.json({ error: "Forbidden. You can only update your own profile." }, { status: 403 });
    }
  }

  const updateFields: any = {};

  // Safe fields editable by both Admin and the Worker itself
  if (nameVal !== undefined) updateFields.name = nameVal;
  if (phoneVal !== undefined) updateFields.phone = phoneVal;
  if (categoryVal !== undefined) updateFields.category = categoryVal;
  if (locationsVal !== undefined) updateFields.locations = locationsVal;
  if (avatarUrlVal !== undefined) updateFields.avatarUrl = avatarUrlVal;
  if (aadhaarUrlVal !== undefined) updateFields.aadhaarUrl = aadhaarUrlVal;
  if (body.bio !== undefined) updateFields.bio = body.bio;
  if (body.experienceYears !== undefined) updateFields.experienceYears = Number(body.experienceYears);

  // If a partner updates their Aadhaar card, reset their KYC Status to false (Pending Verification)
  if (!isAdminRequest && aadhaarUrlVal !== undefined && aadhaarUrlVal !== currentWorker.aadhaarUrl) {
    updateFields.kycStatus = false;
  }

  // Admin-only fields
  if (isAdminRequest) {
    if (kycStatusVal !== undefined) updateFields.kycStatus = Boolean(kycStatusVal);
    if (body.isVerified !== undefined) updateFields.isVerified = Boolean(body.isVerified);
    if (body.status !== undefined) updateFields.status = body.status;
    if (body.isApproved !== undefined) updateFields.isApproved = Boolean(body.isApproved);
    if (body.basePrice !== undefined) updateFields.basePrice = Number(body.basePrice);
    if (body.rating !== undefined) updateFields.rating = String(body.rating);
    if (body.reviewsCount !== undefined) updateFields.reviewsCount = Number(body.reviewsCount);
  }

  try {
    const updated = await db
      .update(workers)
      .set(updateFields)
      .where(eq(workers.id, numericId))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error: any) {
    console.error("[DATABASE ERROR] Updating worker failed:", error);
    return NextResponse.json({ error: "Failed to update worker in database: " + error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
  }
  const { id } = await params;
  try {
    const deleted = await db
      .delete(workers)
      .where(eq(workers.id, Number(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, deletedId: deleted[0].id });
  } catch (error: any) {
    console.error("[DATABASE ERROR] Deleting worker failed:", error);
    return NextResponse.json({ error: "Failed to delete worker from database: " + error.message }, { status: 500 });
  }
}
