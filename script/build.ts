import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile } from "fs/promises";
import fs from 'fs';
import path from 'path';
// server deps to bundle to reduce openat(2) syscalls
// which helps cold start times
const allowlist = [
  "better-sqlite3",
  "@google/generative-ai",
  "axios",
  "connect-pg-simple",
  "cors",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "passport",
  "passport-local",
  "pg",
  "stripe",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
];

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();

  console.log("building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: externals,
    logLevel: "info",
  });

  // Copy .env to dist folder
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    fs.copyFileSync(envPath, path.resolve(process.cwd(), 'dist/.env'));
    console.log('✅ .env copied to dist');
  } else {
    console.log('⚠️  No .env file found, skipping copy');
  }

  // ✅ COPY START.JS TO DIST - ADD THIS RIGHT HERE
  const startJsPath = path.resolve(process.cwd(), 'server/start.js');
  const distStartJsPath = path.resolve(process.cwd(), 'dist/start.js');
  if (fs.existsSync(startJsPath)) {
    fs.copyFileSync(startJsPath, distStartJsPath);
    console.log('✅ start.js copied to dist');
  } else {
    console.log('⚠️  start.js not found, skipping copy');
  }
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});