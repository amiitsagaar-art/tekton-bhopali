// Quick DB migration: Add cancellation_reason column to appointments if missing
const { Pool } = require("pg");
require("dotenv").config({ path: ".env.local" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  console.log("🔧 Running migration...");
  try {
    await client.query(`
      ALTER TABLE appointments
      ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
    `);
    console.log("✅ cancellation_reason column ready.");
  } catch (e) {
    console.error("❌ Migration error:", e.message);
  } finally {
    client.release();
    await pool.end();
  }
  process.exit(0);
}

migrate();
