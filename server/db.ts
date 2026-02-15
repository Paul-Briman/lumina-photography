import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "@shared/schema";
import path from "path";
import fs from "fs";

// Force SQLite as requested by user, ignoring any default Postgres URL
const dbPath = path.join(process.cwd(), "sqlite.db");
process.env.DATABASE_URL = dbPath;

console.log("CWD:", process.cwd());
console.log("DB Path:", process.env.DATABASE_URL);

export const sqlite = new Database(process.env.DATABASE_URL);
export const db = drizzle(sqlite, { schema });

// Run migrations
try {
  // Use absolute path for migrations folder to avoid CWD issues
  const migrationsFolder = path.join(process.cwd(), "migrations");
  console.log(`Running migrations from ${migrationsFolder}...`);
  migrate(db, { migrationsFolder });
  console.log("Migrations completed successfully");
} catch (e) {
  console.error("Migration failed:", e);
}
