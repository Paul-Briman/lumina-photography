import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export function serveStatic(app: Express) {
  let currentFilename: string;
  let currentDirname: string;

  if (typeof import.meta !== 'undefined' && import.meta.url) {
    // ESM environment (development)
    currentFilename = fileURLToPath(import.meta.url);
    currentDirname = path.dirname(currentFilename);
  } else {
    // CommonJS environment (production)
    currentFilename = __filename;
    currentDirname = __dirname;
  }

  const distPath = path.resolve(currentDirname, "../dist/public");
  console.log("📁 Serving static from:", distPath);

  if (!fs.existsSync(distPath)) {
    throw new Error(`Build directory not found: ${distPath}`);
  }

  // Serve static files first
  app.use(express.static(distPath));

  // Then handle all other routes with the SPA fallback - using NAMED wildcard
  app.get("/*path", (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ message: "API route not found" });
    }
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}