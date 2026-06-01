import { NextResponse } from "next/server";
import { db } from "@/db";
import { workers } from "@/db/schema";
import { sql } from "drizzle-orm";

const initialWorkers = [
  {
    name: "Ramesh Sharma",
    phone: "9876543210",
    category: "Plumber",
    experienceYears: 6,
    basePrice: 49,
    locations: "MP Nagar, Arera Colony, Kolar Road, Bhopal",
    rating: "4.9",
    reviewsCount: 84,
    avatarUrl: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80",
    bio: "Expert in pipe leakage repair, water tank installation, tap fitting, and complete bathroom plumbing setups across Bhopal.",
    isVerified: true,
  },
  {
    name: "Suresh Kumar",
    phone: "9876543211",
    category: "Plumber",
    experienceYears: 4,
    basePrice: 49,
    locations: "Indrapuri, Minal Residency, Anand Nagar, Patel Nagar, Bhopal",
    rating: "4.7",
    reviewsCount: 42,
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    bio: "Specialist in emergency clog removals, motor fixing, and internal fixture repairs in Old and New Bhopal.",
    isVerified: true,
  },
  {
    name: "Ayush 'Ayu' Kushwaha",
    phone: "9876543212",
    category: "Carpenter",
    experienceYears: 8,
    basePrice: 49,
    locations: "Minal Residency, Indrapuri, Anand Nagar, Patel Nagar, Bhopal",
    rating: "4.9",
    reviewsCount: 112,
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    bio: "Custom modular kitchen repair, sofa repairs, door lock fitting, and custom wooden furniture modifications.",
    isVerified: true,
  },
  {
    name: "Ayush Verma",
    phone: "9876543213",
    category: "Electrician",
    experienceYears: 7,
    basePrice: 49,
    locations: "MP Nagar, Indrapuri, Govindpura, Bhopal",
    rating: "4.9",
    reviewsCount: 156,
    avatarUrl: "https://images.unsplash.com/photo-1624561172888-ac93c696e10c?w=150&auto=format&fit=crop&q=80",
    bio: "Full wiring repair, MCB replacement, ceiling fan installations, and inverter connection setups safely.",
    isVerified: true,
  },
  {
    name: "Vikramjit Singh",
    phone: "9876543214",
    category: "Electrician",
    experienceYears: 5,
    basePrice: 49,
    locations: "Gulmohar, Saket Nagar, Arera Colony, Bhopal",
    rating: "4.8",
    reviewsCount: 65,
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    bio: "Specialist in premium wiring, bed dismantling, switch socket changes, LED lights fitting, and decorative lightning.",
    isVerified: true,
  },
  {
    name: "Manoj Painter",
    phone: "9876543216",
    category: "Painter",
    experienceYears: 10,
    basePrice: 49,
    locations: "All over Bhopal (MP Nagar, Arera Colony, Kolar, Indrapuri)",
    rating: "4.9",
    reviewsCount: 210,
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    bio: "Premium wall interior painting, dampness treatment, stencil arts, texture walls, and quick home touchups.",
    isVerified: true,
  },
  {
    name: "Ar. Ananya Sen",
    phone: "9876543217",
    category: "Civil Architect",
    experienceYears: 9,
    basePrice: 49,
    locations: "Bhopal City wide coverage",
    rating: "5.0",
    reviewsCount: 45,
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    bio: "Licensed Civil Architect specializing in home floor plans, building extensions, interior layout checks, and Vaastu validation.",
    isVerified: true,
  },
  {
    name: "Mohan Lal Yadav",
    phone: "9876543223",
    category: "Civil Construction",
    experienceYears: 10,
    basePrice: 799,
    locations: "Arera Colony, MP Nagar, Minal Residency, Kolar, Bhopal",
    rating: "4.9",
    reviewsCount: 88,
    avatarUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=150&auto=format&fit=crop&q=80",
    bio: "Specialist in brickwork, plastering, custom home extension builds, tiling work, and structural renovations.",
    isVerified: true,
  },
  {
    name: "Pooja Devi & Team",
    phone: "9876543218",
    category: "Cleaning Service",
    experienceYears: 4,
    basePrice: 49,
    locations: "Arera Colony, MP Nagar, Gulmohar, Kolar, Bhopal",
    rating: "4.8",
    reviewsCount: 92,
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    bio: "Deep home cleaning, bathroom acid scrub, sofa dry cleaning, and total kitchen degreasing services.",
    isVerified: true,
  },
  {
    name: "Balaji Deep Cleaners",
    phone: "9876543219",
    category: "Cleaning Service",
    experienceYears: 6,
    basePrice: 49,
    locations: "Indrapuri, Awadhpuri, Bairagarh, Govindpura, Bhopal",
    rating: "4.9",
    reviewsCount: 130,
    avatarUrl: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80",
    bio: "Professional commercial-grade home cleaning machines, floor polishing, and post-construction cleaning.",
    isVerified: true,
  },
  {
    name: "Sagar Kushwaha",
    phone: "9876543220",
    category: "Tank Cleaning",
    experienceYears: 5,
    basePrice: 99,
    locations: "Arera Colony, MP Nagar, Minal Residency, Saket Nagar, Kolar, Bhopal",
    rating: "4.9",
    reviewsCount: 78,
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    bio: "Specialist in vacuum high-pressure tank scrubbing, chemical disinfection, and underground sump sterilization.",
    isVerified: true,
  },
  {
    name: "Ar. Amit Tiwari",
    phone: "9876543221",
    category: "Interior Design",
    experienceYears: 7,
    basePrice: 499,
    locations: "All over Bhopal (Arera Colony, Gulmohar, Kolar Road, MP Nagar)",
    rating: "5.0",
    reviewsCount: 36,
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    bio: "Custom residential modular space planning, 3D modern design rendering, false ceiling drafts and lighting consultation.",
    isVerified: true,
  },
  {
    name: "Er. Arun Vishwakarma",
    phone: "9876543222",
    category: "Exterior Design",
    experienceYears: 9,
    basePrice: 599,
    locations: "MP Nagar, Indrapuri, Govindpura, Saket Nagar, Bhopal",
    rating: "4.8",
    reviewsCount: 54,
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    bio: "Expert commercial facade modeling, premium structure color schemes, external glass fittings, and balcony landscaping blueprints.",
    isVerified: true,
  }
];

export async function GET() {
  try {
    const existingResult = await db.execute(sql`SELECT count(*) FROM workers`);
    const count = Number(existingResult.rows[0].count);

    if (count === 0) {
      await db.insert(workers).values(initialWorkers);
      return NextResponse.json({ message: "Successfully seeded initial skilled workers!", count: initialWorkers.length });
    }

    return NextResponse.json({ message: "Database already has seeded skilled workers.", count });
  } catch (error: any) {
    console.error("[DATABASE ERROR] Seeding workers failed:", error);
    return NextResponse.json({ error: "Failed to seed workers in database: " + error.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    await db.execute(sql`TRUNCATE TABLE appointments, workers RESTART IDENTITY CASCADE`);
    await db.insert(workers).values(initialWorkers);
    return NextResponse.json({ message: "Database reset and seeded successfully with ₹49 starting services!" });
  } catch (error: any) {
    console.error("[DATABASE ERROR] Database reset and seed failed:", error);
    return NextResponse.json({ error: "Failed to reset and seed database: " + error.message }, { status: 500 });
  }
}
