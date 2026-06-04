require("dotenv").config();
const { neon } = require("@neondatabase/serverless");

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  await sql`TRUNCATE TABLE users RESTART IDENTITY CASCADE;`;
  console.log("Users table truncated successfully.");
}

main().catch(console.error);
