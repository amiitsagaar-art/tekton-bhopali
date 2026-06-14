// Migration script: Add push_token columns to workers and users tables in PostgreSQL
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// Helper to load env variables from a file
function loadEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    console.log(`Loading env variables from: ${filePath}`);
    const content = fs.readFileSync(filePath, "utf-8");
    content.split("\n").forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[0].split("=")[0].trim();
        let value = match[0].split("=").slice(1).join("=").trim();
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

// Load env
loadEnvFile(path.join(__dirname, ".env"));
loadEnvFile(path.join(__dirname, ".env.local"));

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("❌ DATABASE_URL not found in env files!");
  process.exit(1);
}

const pool = new Pool({ connectionString: databaseUrl });

async function migrate() {
  const client = await pool.connect();
  console.log("🔧 Running migration to add push_token columns...");
  try {
    // 1. Add column to workers table
    await client.query(`
      ALTER TABLE workers
      ADD COLUMN IF NOT EXISTS push_token TEXT;
    `);
    console.log("✅ push_token column added to workers table.");

    // 2. Add column to users table
    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS push_token TEXT;
    `);
    console.log("✅ push_token column added to users table.");
  } catch (e) {
    console.error("❌ Migration error:", e.message);
  } finally {
    client.release();
    await pool.end();
  }
  process.exit(0);
}

migrate();
