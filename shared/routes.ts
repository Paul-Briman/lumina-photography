import { z } from 'zod';
import { 
  insertGallerySchema, 
  insertInvoiceSchema,
  loginSchema,
  registerSchema,
  photographers,
  galleries,
  photos,
  invoices
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/auth/register' as const,
      input: registerSchema,
      responses: {
        201: z.object({
          token: z.string(),
          user: z.custom<typeof photographers.$inferSelect>(),
        }),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/auth/login' as const,
      input: loginSchema,
      responses: {
        200: z.object({
          token: z.string(),
          user: z.custom<typeof photographers.$inferSelect>(),
        }),
        401: errorSchemas.unauthorized,
      },
    },
  },
  galleries: {
    list: {
      method: 'GET' as const,
      path: '/api/galleries' as const,
      responses: {
        200: z.array(z.custom<typeof galleries.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/galleries' as const,
      input: insertGallerySchema,
      responses: {
        201: z.custom<typeof galleries.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/galleries/:id' as const,
      responses: {
        200: z.custom<typeof galleries.$inferSelect & { photos: typeof photos.$inferSelect[] }>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    uploadPhotos: {
      method: 'POST' as const,
      path: '/api/galleries/:id/photos' as const,
      // Input is FormData, not strictly typed here
      responses: {
        201: z.array(z.custom<typeof photos.$inferSelect>()),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
  },
  share: {
    get: {
      method: 'GET' as const,
      path: '/api/share/:token' as const,
      responses: {
        200: z.custom<typeof galleries.$inferSelect & { photos: typeof photos.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
  },
  invoices: {
    list: {
      method: 'GET' as const,
      path: '/api/invoices' as const,
      responses: {
        200: z.array(z.custom<typeof invoices.$inferSelect & { gallery: typeof galleries.$inferSelect }>()),
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/invoices' as const,
      input: insertInvoiceSchema,
      responses: {
        201: z.custom<typeof invoices.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    getPdf: {
      method: 'GET' as const,
      path: '/api/invoices/:id/pdf' as const,
      responses: {
        200: z.any(), // Binary stream
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
