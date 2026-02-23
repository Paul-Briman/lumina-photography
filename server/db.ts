import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from "drizzle-orm/postgres-js/migrator";
import * as schema from "@shared/schema";
import path from "path";

// Get database URL from environment
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL environment variable is required");
  process.exit(1);
}

console.log("🌐 Connecting to PostgreSQL database...");
console.log("DB URL:", connectionString.replace(/:[^:]*@/, ':****@')); // Hide password in logs

// Create postgres connection with connection pool
const client = postgres(connectionString, { 
  max: 10, // connection pool size
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false, // Required for drizzle
});

// Create drizzle database instance
export const db = drizzle(client, { schema });

// Run migrations if needed (optional - you might want to run these separately)
async function runMigrations() {
  try {
    // Use absolute path for migrations folder
    const migrationsFolder = path.join(process.cwd(), "migrations");
    console.log(`📦 Running migrations from ${migrationsFolder}...`);
    await migrate(db, { migrationsFolder });
    console.log("✅ Migrations completed successfully");
  } catch (e) {
    console.error("❌ Migration failed:", e);
    // Don't exit process, just log error
  }
}

// Uncomment if you want migrations to run automatically on startup
// runMigrations().catch(console.error);

console.log("✅ PostgreSQL connection established");