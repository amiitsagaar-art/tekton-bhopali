// Quick DB inspection script
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

function loadEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
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

loadEnvFile(path.join(__dirname, ".env"));
loadEnvFile(path.join(__dirname, ".env.local"));

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("❌ DATABASE_URL not found!");
  process.exit(1);
}

const pool = new Pool({ connectionString: databaseUrl });

async function check() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT id, customer_name, customer_phone, category, status, created_at FROM appointments ORDER BY id DESC LIMIT 10;");
    console.log("LAST 10 APPOINTMENTS:");
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    client.release();
    await pool.end();
  }
}

check();
