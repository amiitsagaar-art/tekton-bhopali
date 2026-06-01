import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

// Global pool cache for dev hot-reloads
const globalForDb = globalThis as typeof globalThis & {
  __tektonPostgresPool?: Pool;
};

// If DATABASE_URL is not set, we export a dummy db that always throws.
// Each API route's try/catch will then activate the JSON fallbackStore.
let db: ReturnType<typeof drizzle>;

// Strict DB validation to prevent silent failures or temporary store usage
if (!databaseUrl || databaseUrl.includes("username:password")) {
  const errMsg = "CRITICAL CONFIGURATION ERROR: DATABASE_URL environment variable is missing or has placeholder values. Persistent PostgreSQL connection is strictly required for this application to run.";
  console.error(`[DB ERROR] ${errMsg}`);
  
  // Create a proxy db object that immediately throws errors when used, rather than crashing at build-time.
  // This allows Next.js static builds to succeed if they import this file but do not make active API calls,
  // while ensuring any live server request instantly fails and logs the error.
  db = new Proxy({} as ReturnType<typeof drizzle>, {
    get() {
      return () => {
        throw new Error(errMsg);
      };
    },
  });
} else {
  const pool =
    globalForDb.__tektonPostgresPool ??
    new Pool({ connectionString: databaseUrl });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__tektonPostgresPool = pool;
  }

  db = drizzle(pool);
}

export { db };
