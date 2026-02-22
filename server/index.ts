import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

console.log("🚀 SERVER STARTING...");
console.log("📁 Current directory:", process.cwd());

// Handle both ESM and CommonJS environments
let currentFilename: string;
let currentDirname: string;

if (typeof import.meta !== 'undefined' && import.meta.url) {
  // ESM environment (development)
  currentFilename = fileURLToPath(import.meta.url);
  currentDirname = path.dirname(currentFilename);
  console.log("📁 Running in ESM mode (development)");
} else {
  // CommonJS environment (production)
  currentFilename = __filename;
  currentDirname = __dirname;
  console.log("📁 Running in CommonJS mode (production)");
}

// Debug the path - looking for backend .env in root
const envPath = path.resolve(currentDirname, '../.env');
console.log('🔍 Looking for backend .env at:', envPath);
console.log('📁 currentDirname:', currentDirname);

// Check if file exists
if (fs.existsSync(envPath)) {
  console.log('✅ Backend .env file found!');
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('📄 .env content (first 100 chars):', envContent.substring(0, 100));
} else {
  console.log('❌ Backend .env file NOT found at this path');
  
  // Try alternative paths
  const altPath1 = path.resolve(process.cwd(), '.env');
  const altPath2 = path.resolve(currentDirname, '.env');
  
  console.log('Checking alternatives:');
  console.log('  Alt1 (cwd):', altPath1, fs.existsSync(altPath1) ? '✅ FOUND' : '❌');
  console.log('  Alt2 (same dir):', altPath2, fs.existsSync(altPath2) ? '✅ FOUND' : '❌');
}

// Load environment variables from the correct path
dotenv.config({ path: envPath });

console.log('🔥 PORT from env:', process.env.PORT);
console.log('🔥 NODE_ENV:', process.env.NODE_ENV);

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    console.log("📡 Running in production mode, serving static files...");
    serveStatic(app);
  } else {
    console.log("📡 Running in development mode, setting up Vite...");
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  const port = parseInt(process.env.PORT || "8080", 10);
  console.log(`📡 Attempting to start server on port: ${port}`);
  
  httpServer.listen(port, "127.0.0.1", () => {
    log(`serving on port ${port}`);
  });
})();