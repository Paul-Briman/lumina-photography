import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// POSTGRESQL MIGRATION GUIDE:
// 1. Uncomment the PG imports below and remove sqlite imports
// import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
// 2. Replace sqliteTable with pgTable
// 3. Replace integer('id').primaryKey({ autoIncrement: true }) with serial('id').primaryKey()
// 4. Replace integer('created_at', { mode: 'timestamp' }) with timestamp('created_at').defaultNow()

export const photographers = sqliteTable("photographers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  businessName: text("business_name").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const galleries = sqliteTable("galleries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  photographerId: integer("photographer_id").notNull(),
  title: text("title").notNull(),
  clientName: text("client_name").notNull(),
  shareToken: text("share_token").notNull().unique(),
  downloadPin: text("download_pin"),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const photos = sqliteTable("photos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  galleryId: integer("gallery_id").notNull(),
  filename: text("filename").notNull(),
  storagePath: text("storage_path").notNull(),
  size: integer("size").notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const invoices = sqliteTable("invoices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  galleryId: integer("gallery_id").notNull(),
  invoiceNumber: text("invoice_number").notNull(),
  amount: integer("amount").notNull(), // stored in cents
  status: text("status").notNull().default("pending"), // pending, paid, cancelled
  pdfPath: text("pdf_path"),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Schemas
export const insertPhotographerSchema = createInsertSchema(photographers).omit({ 
  id: true, 
  createdAt: true 
});

export const insertGallerySchema = createInsertSchema(galleries).omit({ 
  id: true, 
  createdAt: true,
  shareToken: true // generated server-side
});

export const insertPhotoSchema = createInsertSchema(photos).omit({ 
  id: true, 
  createdAt: true 
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({ 
  id: true, 
  createdAt: true,
  pdfPath: true // generated server-side
});

// Types
export type Photographer = typeof photographers.$inferSelect;
export type Gallery = typeof galleries.$inferSelect;
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

export const registerSchema = insertPhotographerSchema.extend({
  password: z.string().min(6),
}).omit({ passwordHash: true });

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
