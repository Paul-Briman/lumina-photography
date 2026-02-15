import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

// Mock JWT secret - in production use env var
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Configure multer for temp storage
const upload = multer({ 
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Ensure uploads dir exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth Middleware
  const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      (req as any).user = user;
      next();
    });
  };

  // Auth Routes
  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      const existingUser = await storage.getPhotographerByEmail(input.email);
      
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const passwordHash = await bcrypt.hash(input.password, 10);
      const user = await storage.createPhotographer({ ...input, passwordHash });
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);

      res.status(201).json({ token, user });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.post(api.auth.login.path, async (req, res) => {
    try {
      const input = api.auth.login.input.parse(req.body);
      const user = await storage.getPhotographerByEmail(input.email);
      
      if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
      res.json({ token, user });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Gallery Routes
  app.get(api.galleries.list.path, authenticateToken, async (req, res) => {
    const userId = (req as any).user.id;
    const galleries = await storage.getGalleries(userId);
    res.json(galleries);
  });

  app.post(api.galleries.create.path, authenticateToken, async (req, res) => {
    try {
      const input = api.galleries.create.input.parse(req.body);
      const userId = (req as any).user.id;
      
      // Generate unique share token
      const shareToken = randomBytes(16).toString('hex');
      
      const gallery = await storage.createGallery({ 
        ...input, 
        photographerId: userId,
        shareToken 
      });
      
      res.status(201).json(gallery);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.galleries.get.path, authenticateToken, async (req, res) => {
    const userId = (req as any).user.id;
    const galleryId = Number(req.params.id);
    
    const gallery = await storage.getGallery(galleryId);
    if (!gallery) return res.status(404).json({ message: "Gallery not found" });
    if (gallery.photographerId !== userId) return res.sendStatus(403);

    const photos = await storage.getPhotos(galleryId);
    res.json({ ...gallery, photos });
  });

  app.post(api.galleries.uploadPhotos.path, authenticateToken, upload.array('photos'), async (req, res) => {
    const userId = (req as any).user.id;
    const galleryId = Number(req.params.id);
    const files = req.files as Express.Multer.File[];

    const gallery = await storage.getGallery(galleryId);
    if (!gallery) return res.status(404).json({ message: "Gallery not found" });
    if (gallery.photographerId !== userId) return res.sendStatus(403);

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const createdPhotos = [];
    for (const file of files) {
      const photo = await storage.createPhoto({
        galleryId,
        filename: file.originalname,
        storagePath: file.path, // In real app, upload to S3/Firebase here
        size: file.size
      });
      createdPhotos.push(photo);
    }

    res.status(201).json(createdPhotos);
  });

  // Public Share Route
  app.get(api.share.get.path, async (req, res) => {
    const token = req.params.token;
    const gallery = await storage.getGalleryByToken(token);
    
    if (!gallery) return res.status(404).json({ message: "Gallery not found" });
    
    const photos = await storage.getPhotos(gallery.id);
    res.json({ ...gallery, photos });
  });

  // Invoice Routes
  app.get(api.invoices.list.path, authenticateToken, async (req, res) => {
    const userId = (req as any).user.id;
    const invoices = await storage.getInvoices(userId);
    res.json(invoices);
  });

  app.post(api.invoices.create.path, authenticateToken, async (req, res) => {
    try {
      const input = api.invoices.create.input.parse(req.body);
      const userId = (req as any).user.id;
      
      // Verify gallery belongs to user
      const gallery = await storage.getGallery(input.galleryId);
      if (!gallery || gallery.photographerId !== userId) {
        return res.status(400).json({ message: "Invalid gallery" });
      }

      const invoice = await storage.createInvoice(input);
      res.status(201).json(invoice);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.invoices.getPdf.path, authenticateToken, async (req, res) => {
    const userId = (req as any).user.id;
    const invoiceId = Number(req.params.id);
    
    const invoice = await storage.getInvoice(invoiceId);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    
    const gallery = await storage.getGallery(invoice.galleryId);
    if (!gallery || gallery.photographerId !== userId) return res.sendStatus(403);

    // Mock PDF generation - just send text for now
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);
    res.send(`PDF Content for Invoice #${invoice.invoiceNumber}\nAmount: $${(invoice.amount / 100).toFixed(2)}`);
  });

  // Seed data
  if ((await storage.getGalleries(0)).length === 0) { // Check simply if DB has data? Access storage directly or check specific table
     // Actually easier to just check if any photographer exists
     const demoEmail = "demo@example.com";
     if (!(await storage.getPhotographerByEmail(demoEmail))) {
       console.log("Seeding database...");
       const passwordHash = await bcrypt.hash("password123", 10);
       const user = await storage.createPhotographer({
         email: demoEmail,
         businessName: "Demo Photography",
         passwordHash
       });
       
       const shareToken = "demo-token-123";
       const gallery = await storage.createGallery({
         photographerId: user.id,
         title: "Summer Wedding 2024",
         clientName: "Alice & Bob",
         shareToken
       });
       
       await storage.createInvoice({
         galleryId: gallery.id,
         invoiceNumber: "INV-001",
         amount: 150000, // $1500.00
         status: "pending"
       });
       console.log("Seeding complete. Login with demo@example.com / password123");
     }
  }

  return httpServer;
}
