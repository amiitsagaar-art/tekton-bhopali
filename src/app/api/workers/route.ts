import { NextResponse } from "next/server";
import { db } from "@/db";
import { workers } from "@/db/schema";
import { ilike, or, and, desc } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const location = searchParams.get("location");
  const search = searchParams.get("search");
  const showAll = searchParams.get("all"); // Admin passes all=true

  try {
    // Attempt standard database query
    let conditions = [];

    if (category && category !== "All") {
      conditions.push(ilike(workers.category, `%${category}%`));
    }

    if (location && location !== "All") {
      conditions.push(ilike(workers.locations, `%${location}%`));
    }

    if (search) {
      conditions.push(
        or(
          ilike(workers.name, `%${search}%`),
          ilike(workers.category, `%${search}%`),
          ilike(workers.bio, `%${search}%`),
          ilike(workers.locations, `%${search}%`)
        )
      );
    }

    // Public view only shows Approved workers. Admin sees everything.
    if (showAll !== "true") {
      conditions.push(ilike(workers.status, "Approved"));
    }

    const finalCondition = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db
      .select()
      .from(workers)
      .where(finalCondition)
      .orderBy(desc(workers.rating), desc(workers.createdAt));

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[DATABASE ERROR] Querying workers failed:", error);
    return NextResponse.json({ error: "Failed to retrieve workers from database: " + error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Extract fields (support both user's new multi-step onboarding format and original page format)
    const fullName = body.fullName || body.name || "";
    const whatsappNumber = body.whatsappNumber || body.phone || "";
    const serviceCategory = body.serviceCategory || body.category || "";
    const preferredZone = body.preferredZone || body.locations || "";
    const experienceYears = body.experienceYears || "";
    const aadharNumber = body.aadharNumber || body.aadhaarUrl || "";

    if (!fullName || !whatsappNumber || !serviceCategory || !preferredZone) {
      return NextResponse.json({ error: "Missing required fields (fullName, whatsappNumber, serviceCategory, preferredZone)." }, { status: 400 });
    }

    // Auto-generated Fields
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const workerId = `TEK-W-${randomDigits}`;
    const status = "Pending";
    
    // Application date in DD-MM-YYYY format
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const applicationDate = `${dd}-${mm}-${yyyy}`;

    const sheetDbUrl = (process.env.SHEETDB_API_URL || "https://sheetdb.io/api/v1/e1d9cpd85s3zu") + "?sheet=Sheet2";

    const defaultAvatars: Record<string, string> = {
      Plumber: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=150&auto=format&fit=crop&q=80",
      Carpenter: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      Electrician: "https://images.unsplash.com/photo-1624561172888-ac93c696e10c?w=150&auto=format&fit=crop&q=80",
      Painter: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
      Cleaner: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    };
    
    const finalAvatarUrl = defaultAvatars[serviceCategory] || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";

    const dbWorkerValues = {
      name: fullName,
      phone: whatsappNumber,
      category: serviceCategory,
      experienceYears: Number(experienceYears) || 2,
      basePrice: 49,
      locations: preferredZone.toLowerCase().includes("bhopal") ? preferredZone : `${preferredZone}, Bhopal`,
      bio: `Professional ${serviceCategory} serving ${preferredZone} zone in Bhopal.`,
      rating: "4.9",
      reviewsCount: 0,
      isVerified: false,
      status: "Pending",
      aadhaarUrl: aadharNumber || "",
      selfieUrl: "pending_upload",
      avatarUrl: finalAvatarUrl,
    };

    // 1. Save locally to Drizzle database strictly
    try {
      await db.insert(workers).values(dbWorkerValues);
    } catch (dbError: any) {
      console.error("[DATABASE ERROR] Standard DB insert failed in workers:", dbError);
      throw new Error(`Database insert failed: ${dbError.message}`);
    }

    // 2. Format strictly wrapped in a "data" object array for SheetDB API Sheet2
    const payload = {
      data: [
        {
          workerId,
          fullName,
          whatsappNumber,
          serviceCategory,
          preferredZone,
          experienceYears: Number(experienceYears) || 0,
          aadharNumber,
          profilePhoto: "pending",
          status,
          applicationDate,
        },
      ],
    };

    // 3. Post to SheetDB
    try {
      const response = await fetch(sheetDbUrl, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`SheetDB API returned error: ${errorText}`);
      }
    } catch (sheetdbError: any) {
      console.warn("[DATABASE FAILOVER] SheetDB write to Sheet2 failed. Gracefully falling back since local database write succeeded.", sheetdbError);
    }

    return NextResponse.json(
      {
        success: true,
        workerId,
        message: "Application submitted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error onboarding partner:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
