import { config } from "dotenv";
config();
import { Pool } from 'pg';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE;');
  console.log("Users table truncated successfully.");
  await pool.end();
}

main().catch(console.error);
