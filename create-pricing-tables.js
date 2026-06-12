/**
 * Run this once to create the new service_pricing and coupons tables in DB.
 * Usage: node create-pricing-tables.js
 */
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const client = await pool.connect();
  try {
    console.log("Creating service_pricing table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS service_pricing (
        id SERIAL PRIMARY KEY,
        category VARCHAR(100) NOT NULL UNIQUE,
        base_price INTEGER NOT NULL DEFAULT 149,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    console.log("Creating coupons table...");
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

    console.log("Inserting default service prices...");
    const defaultPrices = [
      ["Plumbing", 149],
      ["Electrician", 199],
      ["Carpentry", 179],
      ["Painting", 249],
      ["Cleaning", 299],
      ["AC Repair", 399],
      ["Civil Work", 499],
      ["Home Tutors", 299],
    ];

    for (const [cat, price] of defaultPrices) {
      await client.query(
        `INSERT INTO service_pricing (category, base_price) VALUES ($1, $2)
         ON CONFLICT (category) DO NOTHING`,
        [cat, price]
      );
    }

    console.log("Inserting sample coupons...");
    const sampleCoupons = [
      ["TEKTON10", 10, true, "10% off on all bookings"],
      ["FIRSTBOOK", 25, false, "₹25 off on your first booking"],
      ["BHOPAL30", 30, false, "₹30 off special Bhopal launch discount"],
    ];

    for (const [code, val, isPct, desc] of sampleCoupons) {
      await client.query(
        `INSERT INTO coupons (code, discount_value, is_percentage, description, is_active)
         VALUES ($1, $2, $3, $4, TRUE)
         ON CONFLICT (code) DO NOTHING`,
        [code, val, isPct, desc]
      );
    }

    console.log("✅ All done! Tables created and seeded.");
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
