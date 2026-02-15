import { defineConfig } from "drizzle-kit";

// Force SQLite
process.env.DATABASE_URL = "sqlite.db";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
