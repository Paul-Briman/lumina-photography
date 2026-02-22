import { db } from "./db";
import {
  photographers,
  galleries,
  photos,
  invoices,
  type InsertPhotographer,
  type InsertGallery,
  type InsertInvoice,
  type Photographer,
  type Gallery,
  type Photo,
  type Invoice,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Photographers
  getPhotographerByEmail(email: string): Promise<Photographer | undefined>;
  getPhotographer(id: number): Promise<Photographer | undefined>;
  createPhotographer(
    photographer: InsertPhotographer & { passwordHash: string },
  ): Promise<Photographer>;
  // Add to IStorage interface
  updatePhotographer(
    id: number,
    updates: Partial<
      InsertPhotographer & {
        passwordHash?: string;
        resetToken?: string | null;
        resetTokenExpiry?: Date | null;
      }
    >,
  ): Promise<Photographer>;
  getPhotographerByResetToken(token: string): Promise<Photographer | undefined>;

  // Galleries
  getGalleries(photographerId: number): Promise<Gallery[]>;
  getGallery(id: number): Promise<Gallery | undefined>;
  getGalleryByToken(token: string): Promise<Gallery | undefined>;
  createGallery(
    gallery: InsertGallery & { shareToken: string; downloadPin?: string },
  ): Promise<Gallery>;
  updateGallery(id: number, updates: Partial<InsertGallery>): Promise<Gallery>;
  deleteGallery(id: number): Promise<void>;

  // Photos
  getPhotos(galleryId: number): Promise<Photo[]>;
  getPhoto(id: number): Promise<Photo | undefined>;
  createPhoto(photo: {
    galleryId: number;
    filename: string;
    storagePath: string;
    size: number;
  }): Promise<Photo>;
  updatePhoto(
    id: number,
    updates: { filename?: string; storagePath?: string; size?: number },
  ): Promise<Photo>;
  deletePhoto(id: number): Promise<void>;

  // Invoices
  getInvoices(
    photographerId: number,
  ): Promise<(Invoice & { gallery: Gallery })[]>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
}

export class DatabaseStorage implements IStorage {
  // Photographers
  async getPhotographerByEmail(
    email: string,
  ): Promise<Photographer | undefined> {
    const [user] = await db
      .select()
      .from(photographers)
      .where(eq(photographers.email, email));
    return user;
  }

  async getPhotographer(id: number): Promise<Photographer | undefined> {
    const [user] = await db
      .select()
      .from(photographers)
      .where(eq(photographers.id, id));
    return user;
  }

  async createPhotographer(
    photographer: InsertPhotographer & { passwordHash: string },
  ): Promise<Photographer> {
    const [user] = await db
      .insert(photographers)
      .values(photographer)
      .returning();
    return user;
  }

  // Add to DatabaseStorage class
  async updatePhotographer(
    id: number,
    updates: Partial<
      InsertPhotographer & {
        passwordHash?: string;
        resetToken?: string | null;
        resetTokenExpiry?: Date | null;
      }
    >,
  ): Promise<Photographer> {
    const [updated] = await db
      .update(photographers)
      .set(updates)
      .where(eq(photographers.id, id))
      .returning();
    return updated;
  }

  async getPhotographerByResetToken(
    token: string,
  ): Promise<Photographer | undefined> {
    const [user] = await db
      .select()
      .from(photographers)
      .where(eq(photographers.resetToken, token));
    return user;
  }

  // Galleries
  async getGalleries(photographerId: number): Promise<Gallery[]> {
    return db
      .select()
      .from(galleries)
      .where(eq(galleries.photographerId, photographerId))
      .orderBy(desc(galleries.createdAt));
  }

  async getGallery(id: number): Promise<Gallery | undefined> {
    const [gallery] = await db
      .select()
      .from(galleries)
      .where(eq(galleries.id, id));
    return gallery;
  }

  async getGalleryByToken(token: string): Promise<Gallery | undefined> {
    const [gallery] = await db
      .select()
      .from(galleries)
      .where(eq(galleries.shareToken, token));
    return gallery;
  }

  async createGallery(
    gallery: InsertGallery & { shareToken: string; downloadPin?: string },
  ): Promise<Gallery> {
    const [newGallery] = await db.insert(galleries).values(gallery).returning();
    return newGallery;
  }

  async updateGallery(
    id: number,
    updates: Partial<InsertGallery>,
  ): Promise<Gallery> {
    const [updated] = await db
      .update(galleries)
      .set(updates)
      .where(eq(galleries.id, id))
      .returning();
    return updated;
  }

  async deleteGallery(id: number): Promise<void> {
    await db.delete(photos).where(eq(photos.galleryId, id));
    await db.delete(invoices).where(eq(invoices.galleryId, id));
    await db.delete(galleries).where(eq(galleries.id, id));
  }

  // Photos
  async getPhotos(galleryId: number): Promise<Photo[]> {
    return db
      .select()
      .from(photos)
      .where(eq(photos.galleryId, galleryId))
      .orderBy(desc(photos.createdAt));
  }

  async getPhoto(id: number): Promise<Photo | undefined> {
    const [photo] = await db.select().from(photos).where(eq(photos.id, id));
    return photo;
  }

  async createPhoto(photo: {
    galleryId: number;
    filename: string;
    storagePath: string;
    size: number;
  }): Promise<Photo> {
    const [newPhoto] = await db.insert(photos).values(photo).returning();
    return newPhoto;
  }

  async updatePhoto(
    id: number,
    updates: { filename?: string; storagePath?: string; size?: number },
  ): Promise<Photo> {
    const [updated] = await db
      .update(photos)
      .set(updates)
      .where(eq(photos.id, id))
      .returning();
    return updated;
  }

  async deletePhoto(id: number): Promise<void> {
    await db.delete(photos).where(eq(photos.id, id));
  }

  // Invoices
  async getInvoices(
    photographerId: number,
  ): Promise<(Invoice & { gallery: Gallery })[]> {
    // Join with galleries to filter by photographer
    const rows = await db
      .select({
        invoice: invoices,
        gallery: galleries,
      })
      .from(invoices)
      .innerJoin(galleries, eq(invoices.galleryId, galleries.id))
      .where(eq(galleries.photographerId, photographerId))
      .orderBy(desc(invoices.createdAt));

    return rows.map((r) => ({ ...r.invoice, gallery: r.gallery }));
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, id));
    return invoice;
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [newInvoice] = await db.insert(invoices).values(invoice).returning();
    return newInvoice;
  }
}

export const storage = new DatabaseStorage();
