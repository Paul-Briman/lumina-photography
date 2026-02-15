# Lumina - Photography Portfolio Manager

## Overview

Lumina is a photography portfolio management application built for professional photographers. It allows photographers to create photo galleries, share them with clients via unique tokens, upload photos, and manage invoices. The app features a dashboard for authenticated photographers and public-facing gallery views for clients.

Key features:
- **Authentication**: JWT-based registration and login for photographers
- **Gallery Management**: Create galleries, upload photos, generate shareable links
- **Client Gallery View**: Public gallery pages accessible via share tokens with masonry grid, lightbox, and bulk download
- **Invoice Management**: Create and track invoices tied to galleries
- **Photo Upload**: Drag-and-drop photo uploads with multer handling

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack React Query for server state; React Context for auth state
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming, custom font setup (Inter + Playfair Display)
- **Forms**: React Hook Form with Zod resolvers via @hookform/resolvers
- **Build**: Vite with React plugin

### Backend
- **Framework**: Express.js running on Node with TypeScript (tsx for dev, esbuild for production)
- **Authentication**: JWT tokens (stored in localStorage on client, verified via middleware on server). The `Authorization: Bearer <token>` header pattern is used for all protected API requests
- **File Uploads**: Multer with local disk storage (`uploads/` directory), 10MB file size limit
- **API Design**: Typed API route definitions in `shared/routes.ts` using Zod schemas, shared between client and server for validation

### Data Layer
- **ORM**: Drizzle ORM
- **Current Database**: SQLite via `better-sqlite3` (the schema in `shared/schema.ts` uses `sqliteTable`)
- **Migration**: Drizzle Kit with migrations stored in `./migrations/` directory. The schema file includes commented-out PostgreSQL migration guide
- **Schema Tables**: `photographers`, `galleries`, `photos`, `invoices`
- **Note**: There is also a `drizzle.config.ts` for PostgreSQL that requires `DATABASE_URL` env var. If Postgres is provisioned, the schema would need to be converted from SQLite table definitions to PostgreSQL (replace `sqliteTable` with `pgTable`, `integer` primary keys with `serial`, timestamp handling changes)

### Shared Code
- `shared/schema.ts` - Database schema definitions, Zod validation schemas, and TypeScript types
- `shared/routes.ts` - API route definitions with paths, methods, input/output Zod schemas

### Project Structure
```
client/           - React frontend (Vite)
  src/
    components/   - UI components (shadcn/ui in components/ui/, layout components)
    hooks/        - Custom hooks (use-auth, use-galleries, use-invoices, use-toast)
    lib/          - Utilities (queryClient, utils)
    pages/        - Page components (auth/, galleries/, invoices/, public/)
server/           - Express backend
  db.ts           - Database connection and migration
  index.ts        - Server entry point
  routes.ts       - API route handlers
  static.ts       - Static file serving for production
  storage.ts      - Data access layer (DatabaseStorage class implementing IStorage interface)
  vite.ts         - Vite dev server middleware setup
shared/           - Shared code between client and server
  schema.ts       - Drizzle schema + Zod schemas
  routes.ts       - API route type definitions
migrations/       - Drizzle migration files (SQLite)
uploads/          - Photo upload storage directory
```

### Build Process
- **Development**: `tsx server/index.ts` with Vite middleware for HMR
- **Production**: Client built with Vite to `dist/public/`, server bundled with esbuild to `dist/index.cjs`. Specific dependencies are bundled (allowlisted) to reduce cold start times

### Key Design Decisions
1. **SQLite as default database** - Chosen for simplicity and zero-config setup. The codebase is prepared for PostgreSQL migration with comments in schema.ts and a separate drizzle config
2. **JWT over sessions** - Stateless authentication; tokens stored in localStorage. No session store needed
3. **Shared route definitions** - Single source of truth for API contracts between frontend and backend, with Zod validation on both sides
4. **Storage abstraction** - `IStorage` interface in storage.ts allows swapping database implementations without changing route handlers
5. **Local file storage for photos** - Photos stored on disk in `uploads/` directory rather than cloud storage

## External Dependencies

### Core Libraries
- **Express** - HTTP server framework
- **Drizzle ORM + better-sqlite3** - Database ORM and SQLite driver
- **jsonwebtoken** - JWT token creation and verification
- **bcryptjs** - Password hashing
- **multer** - Multipart form data / file upload handling
- **Zod** - Runtime schema validation (shared between client/server)

### Frontend Libraries
- **React + Vite** - UI framework and build tool
- **@tanstack/react-query** - Server state management
- **wouter** - Client-side routing
- **shadcn/ui + Radix UI** - Component library
- **Tailwind CSS** - Utility-first CSS
- **react-hook-form** - Form management
- **lucide-react** - Icons

### Environment Variables
- `DATABASE_URL` - Database connection string (for PostgreSQL config; currently overridden to `sqlite.db` in `server/db.ts`)
- `JWT_SECRET` - Secret key for JWT signing (defaults to a placeholder in development)

### Replit-specific
- `@replit/vite-plugin-runtime-error-modal` - Runtime error overlay
- `@replit/vite-plugin-cartographer` - Dev tooling (dev only)
- `@replit/vite-plugin-dev-banner` - Dev banner (dev only)