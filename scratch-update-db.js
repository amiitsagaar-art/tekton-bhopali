const { Pool } = require("pg");

const liveDbUrl = "postgresql://neondb_owner:npg_fnRcBal56vmJ@ep-royal-sound-apyux2x8-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require";

const pool = new Pool({ connectionString: liveDbUrl });

async function run() {
  const client = await pool.connect();
  try {
    console.log("Checking and updating database schema on live Neon DB...");

    // 1. Update appointments table
    console.log("Updating appointments table columns if they do not exist...");
    await client.query(`
      ALTER TABLE appointments 
      ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'Pending' NOT NULL,
      ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
      ADD COLUMN IF NOT EXISTS visit_charge INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS extra_charge INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS total_amount INTEGER NOT NULL DEFAULT 0;
    `);
    console.log("appointments table updated.");

    // 2. Update workers table
    console.log("Updating workers table columns if they do not exist...");
    await client.query(`
      ALTER TABLE workers 
      ADD COLUMN IF NOT EXISTS aadhaar_url TEXT,
      ADD COLUMN IF NOT EXISTS pan_url TEXT,
      ADD COLUMN IF NOT EXISTS passbook_url TEXT,
      ADD COLUMN IF NOT EXISTS selfie_url TEXT;
    `);
    console.log("workers table updated.");

    // 3. Create reviews table if not exists (with UUID primary key)
    console.log("Creating reviews table if it does not exist...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id INTEGER NOT NULL,
        vendor_id INTEGER NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log("reviews table checked/created.");

    // 4. Create recent_works table if not exists
    console.log("Creating recent_works table if it does not exist...");
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
    console.log("recent_works table checked/created.");

    // 5. Create service_pricing table if not exists
    console.log("Creating service_pricing table if it does not exist...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS service_pricing (
        id SERIAL PRIMARY KEY,
        category VARCHAR(100) NOT NULL UNIQUE,
        base_price INTEGER NOT NULL DEFAULT 149,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log("service_pricing table checked/created.");

    // 6. Create coupons table if not exists
    console.log("Creating coupons table if it does not exist...");
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
    console.log("coupons table checked/created.");

    // 7. Create service_areas table if not exists
    console.log("Creating service_areas table if it does not exist...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS service_areas (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log("service_areas table checked/created.");

    // 8. Create payments table if not exists
    console.log("Creating payments table if it does not exist...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        appointment_id INTEGER NOT NULL,
        amount INTEGER NOT NULL,
        status VARCHAR(50) DEFAULT 'Success' NOT NULL,
        transaction_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log("payments table checked/created.");

    // 9. Create system_settings table if not exists
    console.log("Creating system_settings table if it does not exist...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log("system_settings table checked/created.");

    console.log("Seeding system settings default...");
    await client.query(`
      INSERT INTO system_settings (key, value)
      VALUES ('enableCashPayment', 'false')
      ON CONFLICT (key) DO NOTHING;
    `);

    console.log("🎉 Database schema updates applied successfully!");
  } catch (err) {
    console.error("❌ Schema update failed:", err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
