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
import { emailService } from "./services/emailService";

// Mock JWT secret - in production use env var
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Configure multer for temp storage
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Ensure uploads dir exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  // Auth Middleware
  const authenticateToken = (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

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

  // Forgot Password - Request reset link
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Find user by email
      const user = await storage.getPhotographerByEmail(email);

      // Always return success even if user doesn't exist (security best practice)
      if (!user) {
        console.log(
          `Password reset requested for non-existent email: ${email}`,
        );
        return res.json({
          message: "If an account exists, a reset email has been sent.",
        });
      }

      // Generate reset token (random bytes + timestamp for uniqueness)
      const resetToken = randomBytes(32).toString("hex");
      const expiryTime = new Date();
      expiryTime.setHours(expiryTime.getHours() + 1); // 1 hour expiry

      // Save token to user record
      await storage.updatePhotographer(user.id, {
        resetToken,
        resetTokenExpiry: expiryTime,
      });

      // Send email with reset link
      try {
        const emailService = (await import("./services/emailService"))
          .emailService;
        await emailService.sendPasswordResetEmail(email, resetToken);
      } catch (emailError) {
        console.error("Failed to send reset email:", emailError);
        // Still return success to prevent email enumeration
      }

      res.json({
        message: "If an account exists, a reset email has been sent.",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Failed to process request" });
    }
  });

  // Reset Password - Set new password using token
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res
          .status(400)
          .json({ message: "Token and new password are required" });
      }

      // Find user by reset token and check expiry
      const user = await storage.getPhotographerByResetToken(token);

      if (!user) {
        return res
          .status(400)
          .json({ message: "Invalid or expired reset token" });
      }

      // Check if token has expired
      const now = new Date();
      if (user.resetTokenExpiry && new Date(user.resetTokenExpiry) < now) {
        return res.status(400).json({ message: "Reset token has expired" });
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, 10);

      // Update user's password and clear reset token
      await storage.updatePhotographer(user.id, {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      });

      res.json({ message: "Password has been reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // Health check endpoint for Render
  app.get("/healthz", (req, res) => {
    res.status(200).send("OK");
  });

  // Gallery Routes
  app.get(api.galleries.list.path, authenticateToken, async (req, res) => {
    const userId = (req as any).user.id;
    const galleries = await storage.getGalleries(userId);

    // For each gallery, get its photos
    const galleriesWithPhotos = await Promise.all(
      galleries.map(async (gallery) => {
        const photos = await storage.getPhotos(gallery.id);
        return {
          ...gallery,
          photos,
        };
      }),
    );

    res.json(galleriesWithPhotos);
  });

  app.post(api.galleries.create.path, authenticateToken, async (req, res) => {
    try {
      const input = api.galleries.create.input.parse(req.body);
      const userId = (req as any).user.id;

      // Generate unique share token and download PIN
      const shareToken = randomBytes(16).toString("hex");
      const downloadPin = Math.floor(1000 + Math.random() * 9000).toString();

      const gallery = await storage.createGallery({
        ...input,
        photographerId: userId,
        shareToken,
        downloadPin,
      });

      res.status(201).json(gallery);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.patch("/api/galleries/:id", authenticateToken, async (req, res) => {
    const userId = (req as any).user.id;
    const galleryId = Number(req.params.id);
    const gallery = await storage.getGallery(galleryId);
    if (!gallery || gallery.photographerId !== userId)
      return res.sendStatus(403);

    const updated = await storage.updateGallery(galleryId, req.body);
    res.json(updated);
  });

  // Set cover photo endpoint
  app.patch("/api/galleries/:id/cover", authenticateToken, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const galleryId = Number(req.params.id);
      const { photoId } = req.body;

      if (!photoId) {
        return res.status(400).json({ message: "Photo ID is required" });
      }

      // Verify gallery belongs to user
      const gallery = await storage.getGallery(galleryId);
      if (!gallery || gallery.photographerId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      // Verify photo exists in this gallery
      const photos = await storage.getPhotos(galleryId);
      const photoExists = photos.some((p) => p.id === photoId);

      if (!photoExists) {
        return res
          .status(404)
          .json({ message: "Photo not found in this gallery" });
      }

      // Update gallery with cover photo ID
      const updated = await storage.updateGallery(galleryId, {
        coverPhotoId: photoId,
      });
      res.json({ success: true, coverPhotoId: photoId });
    } catch (err) {
      console.error("Error setting cover photo:", err);
      res.status(500).json({ message: "Failed to set cover photo" });
    }
  });

  app.delete("/api/galleries/:id", authenticateToken, async (req, res) => {
    const userId = (req as any).user.id;
    const galleryId = Number(req.params.id);
    const gallery = await storage.getGallery(galleryId);
    if (!gallery || gallery.photographerId !== userId)
      return res.sendStatus(403);

    await storage.deleteGallery(galleryId);
    res.sendStatus(204);
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

  app.post(
    api.galleries.uploadPhotos.path,
    authenticateToken,
    upload.array("photos"),
    async (req, res) => {
      const userId = (req as any).user.id;
      const galleryId = Number(req.params.id);
      const files = req.files as Express.Multer.File[];

      const gallery = await storage.getGallery(galleryId);
      if (!gallery)
        return res.status(404).json({ message: "Gallery not found" });
      if (gallery.photographerId !== userId) return res.sendStatus(403);

      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const createdPhotos = [];
      for (const file of files) {
        const photo = await storage.createPhoto({
          galleryId,
          filename: file.originalname,
          storagePath: file.path,
          size: file.size,
        });
        createdPhotos.push(photo);
      }

      res.status(201).json(createdPhotos);
    },
  );

  // Save photo metadata after Cloudinary upload
  app.post(
    "/api/galleries/:id/photos-metadata",
    authenticateToken,
    async (req, res) => {
      try {
        const userId = (req as any).user.id;
        const galleryId = Number(req.params.id);
        const { filename, storagePath, size } = req.body;

        // Validate required fields
        if (!filename || !storagePath || !size) {
          return res.status(400).json({
            message: "Missing required fields: filename, storagePath, size",
          });
        }

        // Verify gallery belongs to user
        const gallery = await storage.getGallery(galleryId);
        if (!gallery) {
          return res.status(404).json({ message: "Gallery not found" });
        }
        if (gallery.photographerId !== userId) {
          return res.sendStatus(403);
        }

        // Create photo record
        const photo = await storage.createPhoto({
          galleryId,
          filename,
          storagePath,
          size,
        });

        res.status(201).json(photo);
      } catch (err) {
        console.error("Error saving photo metadata:", err);
        res.status(500).json({ message: "Failed to save photo metadata" });
      }
    },
  );

  // Delete a photo
  app.delete("/api/photos/:id", authenticateToken, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const photoId = Number(req.params.id);

      // Get the photo to verify ownership
      const photo = await storage.getPhoto(photoId);
      if (!photo) {
        return res.status(404).json({ message: "Photo not found" });
      }

      // Verify the gallery belongs to the user
      const gallery = await storage.getGallery(photo.galleryId);
      if (!gallery || gallery.photographerId !== userId) {
        return res.sendStatus(403);
      }

      // Delete from database
      await storage.deletePhoto(photoId);

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("Error deleting photo:", err);
      res.status(500).json({ message: "Failed to delete photo" });
    }
  });

  // Update a photo (replace) - with Cloudinary
  app.patch(
    "/api/photos/:id",
    authenticateToken,
    upload.single("photo"),
    async (req, res) => {
      try {
        const userId = (req as any).user.id;
        const photoId = Number(req.params.id);
        const file = req.file;

        if (!file) {
          return res.status(400).json({ message: "No file uploaded" });
        }

        // Get the photo to verify ownership
        const photo = await storage.getPhoto(photoId);
        if (!photo) {
          return res.status(404).json({ message: "Photo not found" });
        }

        // Verify the gallery belongs to the user
        const gallery = await storage.getGallery(photo.galleryId);
        if (!gallery || gallery.photographerId !== userId) {
          return res.sendStatus(403);
        }

        console.log("🔍 Replace endpoint - Checking env vars:");
        console.log(
          "CLOUDINARY_CLOUD_NAME:",
          process.env.CLOUDINARY_CLOUD_NAME,
        );
        console.log(
          "CLOUDINARY_UPLOAD_PRESET:",
          process.env.CLOUDINARY_UPLOAD_PRESET,
        );
        console.log(
          "All env keys:",
          Object.keys(process.env).filter((key) => key.includes("CLOUD")),
        );

        // Upload to Cloudinary
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
          console.error("❌ Missing Cloudinary config:", {
            cloudName: cloudName ? "✅" : "❌",
            uploadPreset: uploadPreset ? "✅" : "❌",
          });
          return res.status(500).json({ message: "Cloudinary not configured" });
        }

        // Read file and upload to Cloudinary
        const fileData = fs.readFileSync(file.path);
        const formData = new FormData();
        formData.append("file", new Blob([fileData]), file.originalname);
        formData.append("upload_preset", uploadPreset);
        formData.append("folder", `lumina-galleries/${gallery.id}`);

        const cloudinaryRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          },
        );

        if (!cloudinaryRes.ok) {
          throw new Error("Failed to upload to Cloudinary");
        }

        const cloudinaryData = await cloudinaryRes.json();

        // Clean up temp file
        fs.unlinkSync(file.path);

        // Update the photo in the database with Cloudinary URL
        const updatedPhoto = await storage.updatePhoto(photoId, {
          filename: file.originalname,
          storagePath: cloudinaryData.secure_url,
          size: file.size,
        });

        res.status(200).json(updatedPhoto);
      } catch (err) {
        console.error("Error updating photo:", err);
        res.status(500).json({ message: "Failed to update photo" });
      }
    },
  );

  // API endpoint for share data - this returns JSON
  app.get("/api/share/:token", async (req, res) => {
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
    if (!gallery || gallery.photographerId !== userId)
      return res.sendStatus(403);

    // Mock PDF generation - just send text for now
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`,
    );
    res.send(
      `PDF Content for Invoice #${invoice.invoiceNumber}\nAmount: $${(invoice.amount / 100).toFixed(2)}`,
    );
  });

  // Seed data
  if ((await storage.getGalleries(0)).length === 0) {
    // Check simply if DB has data? Access storage directly or check specific table
    // Actually easier to just check if any photographer exists
    const demoEmail = "demo@example.com";
    if (!(await storage.getPhotographerByEmail(demoEmail))) {
      console.log("Seeding database...");
      const passwordHash = await bcrypt.hash("password123", 10);
      const user = await storage.createPhotographer({
        email: demoEmail,
        businessName: "Demo Photography",
        passwordHash,
      });

      const shareToken = "demo-token-123";
      const gallery = await storage.createGallery({
        photographerId: user.id,
        title: "Summer Wedding 2024",
        clientName: "Alice & Bob",
        shareToken,
      });

      // Create sample photos
      const photo1 = await storage.createPhoto({
        galleryId: gallery.id,
        filename: "sample-wedding-1.jpg",
        storagePath:
          "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1000",
        size: 1024 * 1024,
      });

      const photo2 = await storage.createPhoto({
        galleryId: gallery.id,
        filename: "sample-wedding-2.jpg",
        storagePath:
          "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1000",
        size: 1024 * 1024,
      });

      await storage.createInvoice({
        galleryId: gallery.id,
        invoiceNumber: "INV-001",
        amount: 150000, // $1500.00
        status: "pending",
      });
      console.log(
        "Seeding complete. Login with demo@example.com / password123",
      );
    }
  }

  return httpServer;
}
