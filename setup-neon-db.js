const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

// Helper to load env variables from a file
function loadEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    console.log(`Loading env variables from: ${filePath}`);
    const content = fs.readFileSync(filePath, "utf-8");
    content.split("\n").forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    });
  }
}

// Load env variables
loadEnvFile(path.join(__dirname, ".env"));
loadEnvFile(path.join(__dirname, ".env.local"));

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("❌ DATABASE_URL not found in .env or .env.local!");
  process.exit(1);
}

console.log(`Connecting to database: ${databaseUrl.split("@")[1]}`);

const pool = new Pool({ connectionString: databaseUrl });

const initialWorkers = [
  {
    name: "Ramesh Sharma",
    phone: "9876543210",
    category: "Plumber",
    experience_years: 6,
    base_price: 49,
    locations: "MP Nagar, Arera Colony, Kolar Road, Bhopal",
    rating: "4.9",
    reviews_count: 84,
    avatar_url: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80",
    bio: "Expert in pipe leakage repair, water tank installation, tap fitting, and complete bathroom plumbing setups across Bhopal.",
    is_verified: true,
    is_approved: true,
  },
  {
    name: "Suresh Kumar",
    phone: "9876543211",
    category: "Plumber",
    experience_years: 4,
    base_price: 49,
    locations: "Indrapuri, Minal Residency, Anand Nagar, Patel Nagar, Bhopal",
    rating: "4.7",
    reviews_count: 42,
    avatar_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    bio: "Specialist in emergency clog removals, motor fixing, and internal fixture repairs in Old and New Bhopal.",
    is_verified: true,
    is_approved: true,
  },
  {
    name: "Ayush 'Ayu' Kushwaha",
    phone: "9876543212",
    category: "Carpenter",
    experience_years: 8,
    base_price: 49,
    locations: "Minal Residency, Indrapuri, Anand Nagar, Patel Nagar, Bhopal",
    rating: "4.9",
    reviews_count: 112,
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    bio: "Custom modular kitchen repair, sofa repairs, door lock fitting, and custom wooden furniture modifications.",
    is_verified: true,
    is_approved: true,
  },
  {
    name: "Ayush Verma",
    phone: "9876543213",
    category: "Electrician",
    experience_years: 7,
    base_price: 49,
    locations: "MP Nagar, Indrapuri, Govindpura, Bhopal",
    rating: "4.9",
    reviews_count: 156,
    avatar_url: "https://images.unsplash.com/photo-1624561172888-ac93c696e10c?w=150&auto=format&fit=crop&q=80",
    bio: "Full wiring repair, MCB replacement, ceiling fan installations, and inverter connection setups safely.",
    is_verified: true,
    is_approved: true,
  },
  {
    name: "Vikramjit Singh",
    phone: "9876543214",
    category: "Electrician",
    experience_years: 5,
    base_price: 49,
    locations: "Gulmohar, Saket Nagar, Arera Colony, Bhopal",
    rating: "4.8",
    reviews_count: 65,
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    bio: "Specialist in premium wiring, bed dismantling, switch socket changes, LED lights fitting, and decorative lightning.",
    is_verified: true,
    is_approved: true,
  },
  {
    name: "Manoj Painter",
    phone: "9876543216",
    category: "Painter",
    experience_years: 10,
    base_price: 49,
    locations: "All over Bhopal (MP Nagar, Arera Colony, Kolar, Indrapuri)",
    rating: "4.9",
    reviews_count: 210,
    avatar_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    bio: "Premium wall interior painting, dampness treatment, stencil arts, texture walls, and quick home touchups.",
    is_verified: true,
    is_approved: true,
  },
  {
    name: "Ar. Ananya Sen",
    phone: "9876543217",
    category: "Civil Architect",
    experience_years: 9,
    base_price: 49,
    locations: "Bhopal City wide coverage",
    rating: "5.0",
    reviews_count: 45,
    avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    bio: "Licensed Civil Architect specializing in home floor plans, building extensions, interior layout checks, and Vaastu validation.",
    is_verified: true,
    is_approved: true,
  },
  {
    name: "Mohan Lal Yadav",
    phone: "9876543223",
    category: "Civil Construction",
    experience_years: 10,
    base_price: 799,
    locations: "Arera Colony, MP Nagar, Minal Residency, Kolar, Bhopal",
    rating: "4.9",
    reviews_count: 88,
    avatar_url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=150&auto=format&fit=crop&q=80",
    bio: "Specialist in brickwork, plastering, custom home extension builds, tiling work, and structural renovations.",
    is_verified: true,
    is_approved: true,
  },
  {
    name: "Pooja Devi & Team",
    phone: "9876543218",
    category: "Cleaning Service",
    experience_years: 4,
    base_price: 49,
    locations: "Arera Colony, MP Nagar, Gulmohar, Kolar, Bhopal",
    rating: "4.8",
    reviews_count: 92,
    avatar_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    bio: "Deep home cleaning, bathroom acid scrub, sofa dry cleaning, and total kitchen degreasing services.",
    is_verified: true,
    is_approved: true,
  },
  {
    name: "Balaji Deep Cleaners",
    phone: "9876543219",
    category: "Cleaning Service",
    experience_years: 6,
    base_price: 49,
    locations: "Indrapuri, Awadhpuri, Bairagarh, Govindpura, Bhopal",
    rating: "4.9",
    reviews_count: 130,
    avatar_url: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80",
    bio: "Professional commercial-grade home cleaning machines, floor polishing, and post-construction cleaning.",
    is_verified: true,
    is_approved: true,
  },
  {
    name: "Sagar Kushwaha",
    phone: "9876543220",
    category: "Tank Cleaning",
    experience_years: 5,
    base_price: 99,
    locations: "Arera Colony, MP Nagar, Minal Residency, Saket Nagar, Kolar, Bhopal",
    rating: "4.9",
    reviews_count: 78,
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    bio: "Specialist in vacuum high-pressure tank scrubbing, chemical disinfection, and underground sump sterilization.",
    is_verified: true,
    is_approved: true,
  },
  {
    name: "Ar. Amit Tiwari",
    phone: "9876543221",
    category: "Interior Design",
    experience_years: 7,
    base_price: 499,
    locations: "All over Bhopal (Arera Colony, Gulmohar, Kolar Road, MP Nagar)",
    rating: "5.0",
    reviews_count: 36,
    avatar_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    bio: "Custom residential modular space planning, 3D modern design rendering, false ceiling drafts and lighting consultation.",
    is_verified: true,
    is_approved: true,
  },
  {
    name: "Er. Arun Vishwakarma",
    phone: "9876543222",
    category: "Exterior Design",
    experience_years: 9,
    base_price: 599,
    locations: "MP Nagar, Indrapuri, Govindpura, Saket Nagar, Bhopal",
    rating: "4.8",
    reviews_count: 54,
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    bio: "Expert commercial facade modeling, premium structure color schemes, external glass fittings, and balcony landscaping blueprints.",
    is_verified: true,
    is_approved: true,
  }
];

async function run() {
  const client = await pool.connect();
  try {
    console.log("Creating tables on Neon database...");

    // 1. workers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS workers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL UNIQUE,
        category VARCHAR(100) NOT NULL,
        experience_years INTEGER NOT NULL DEFAULT 2,
        base_price INTEGER NOT NULL DEFAULT 49,
        locations TEXT NOT NULL,
        rating NUMERIC(2,1) NOT NULL DEFAULT 4.8,
        reviews_count INTEGER NOT NULL DEFAULT 12,
        avatar_url TEXT,
        bio TEXT,
        is_verified BOOLEAN NOT NULL DEFAULT TRUE,
        status VARCHAR(50) NOT NULL DEFAULT 'Approved',
        is_approved BOOLEAN NOT NULL DEFAULT FALSE,
        kyc_status BOOLEAN NOT NULL DEFAULT FALSE,
        aadhaar_url TEXT,
        pan_url TEXT,
        passbook_url TEXT,
        selfie_url TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log("✓ workers table created.");

    // 2. appointments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        customer_address TEXT NOT NULL,
        location VARCHAR(100) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        appointment_date VARCHAR(50) NOT NULL,
        appointment_time VARCHAR(50) NOT NULL,
        assigned_worker_id INTEGER REFERENCES workers(id),
        status VARCHAR(50) NOT NULL DEFAULT 'Pending',
        payment_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
        cancellation_reason TEXT,
        transaction_id VARCHAR(255),
        visit_charge INTEGER NOT NULL DEFAULT 0,
        extra_charge INTEGER NOT NULL DEFAULT 0,
        total_amount INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log("✓ appointments table created.");

    // 3. users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(255) NOT NULL UNIQUE,
        location VARCHAR(100) NOT NULL,
        photo_url VARCHAR(1000),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log("✓ users table created.");

    // 4. service_areas table
    await client.query(`
      CREATE TABLE IF NOT EXISTS service_areas (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log("✓ service_areas table created.");

    // 5. payments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        appointment_id INTEGER REFERENCES appointments(id) NOT NULL,
        amount INTEGER NOT NULL,
        status VARCHAR(50) DEFAULT 'Success' NOT NULL,
        transaction_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log("✓ payments table created.");

    // 6. reviews table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id INTEGER REFERENCES users(id) NOT NULL,
        vendor_id INTEGER REFERENCES workers(id) NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log("✓ reviews table created.");

    // 7. recent_works table
    await client.query(`
      CREATE TABLE IF NOT EXISTS recent_works (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        location VARCHAR(100) NOT NULL,
        image_url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log("✓ recent_works table created.");

    // 8. email_otps table
    await client.query(`
      CREATE TABLE IF NOT EXISTS email_otps (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        code VARCHAR(10) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log("✓ email_otps table created.");

    // 9. phone_otps table
    await client.query(`
      CREATE TABLE IF NOT EXISTS phone_otps (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(20) NOT NULL UNIQUE,
        code VARCHAR(10) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log("✓ phone_otps table created.");

    // 10. service_pricing table
    await client.query(`
      CREATE TABLE IF NOT EXISTS service_pricing (
        id SERIAL PRIMARY KEY,
        category VARCHAR(100) NOT NULL UNIQUE,
        base_price INTEGER NOT NULL DEFAULT 149,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log("✓ service_pricing table created.");

    // 11. coupons table
    await client.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        discount_value INTEGER NOT NULL,
        is_percentage BOOLEAN NOT NULL DEFAULT FALSE,
        description TEXT,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log("✓ coupons table created.");

    // 12. system_settings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log("✓ system_settings table created.");

    // Seeding default system settings
    console.log("Seeding default system settings...");
    await client.query(`
      INSERT INTO system_settings (key, value)
      VALUES ('enableCashPayment', 'false')
      ON CONFLICT (key) DO NOTHING;
    `);

    // Seeding coupons
    console.log("Seeding default coupons...");
    await client.query(`
      INSERT INTO coupons (code, discount_value, is_percentage, description, is_active)
      VALUES 
        ('TEKTON10', 10, true, '10% off on any service', true),
        ('FIRSTBOOK', 50, false, '₹50 off on your first booking', true),
        ('BHOPAL2026', 30, false, '₹30 off – Bhopal Special', true),
        ('WELCOME49', 49, false, '₹49 off – Welcome offer', true)
      ON CONFLICT (code) DO NOTHING;
    `);

    // Seeding initial workers
    console.log("Seeding initial workers...");
    for (const w of initialWorkers) {
      await client.query(`
        INSERT INTO workers (name, phone, category, experience_years, base_price, locations, rating, reviews_count, avatar_url, bio, is_verified, is_approved)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (phone) DO NOTHING;
      `, [w.name, w.phone, w.category, w.experience_years, w.base_price, w.locations, w.rating, w.reviews_count, w.avatar_url, w.bio, w.is_verified, w.is_approved]);
    }

    console.log("🎉 All tables created and seeded successfully on Neon DB!");
  } catch (err) {
    console.error("❌ Schema setup failed:", err.stack || err.message || err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
