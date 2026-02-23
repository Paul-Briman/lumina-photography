import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Photographers table
export const photographers = pgTable("photographers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  businessName: text("business_name").notNull(),
  passwordHash: text("password_hash").notNull(),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Galleries table
export const galleries = pgTable("galleries", {
  id: serial("id").primaryKey(),
  photographerId: integer("photographer_id").notNull().references(() => photographers.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  clientName: text("client_name").notNull(),
  shareToken: text("share_token").notNull().unique(),
  downloadPin: text("download_pin"),
  coverPhotoId: integer("cover_photo_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Photos table
export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  galleryId: integer("gallery_id").notNull().references(() => galleries.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),
  storagePath: text("storage_path").notNull(),
  size: integer("size").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Invoices table
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  galleryId: integer("gallery_id").notNull().references(() => galleries.id, { onDelete: "cascade" }),
  invoiceNumber: text("invoice_number").notNull(),
  amount: integer("amount").notNull(), // stored in cents/kobo
  status: text("status").notNull().default("pending"),
  pdfPath: text("pdf_path"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schemas
export const insertPhotographerSchema = createInsertSchema(photographers).omit({
  id: true,
  createdAt: true,
});

export const insertGallerySchema = createInsertSchema(galleries).omit({
  id: true,
  createdAt: true,
  shareToken: true, // generated server-side
});

export const insertPhotoSchema = createInsertSchema(photos).omit({
  id: true,
  createdAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  pdfPath: true, // generated server-side
});

// Types
export type Photographer = typeof photographers.$inferSelect;
export type Gallery = typeof galleries.$inferSelect & {
  photos?: Photo[]; // Add photos as optional array
};
export type Photo = typeof photos.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;

export type InsertPhotographer = z.infer<typeof insertPhotographerSchema>;
export type InsertGallery = z.infer<typeof insertGallerySchema>;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

// Auth types
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = insertPhotographerSchema
  .extend({
    password: z.string().min(6),
  })
  .omit({ passwordHash: true });

export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;

export type AuthResponse = {
  token: string;
  user: {
    id: number;
    email: string;
    businessName: string;
  };
};
