## Packages
framer-motion | Essential for polished page transitions and micro-interactions
react-dropzone | For drag-and-drop photo uploads
react-hook-form | Form state management
@hookform/resolvers | Zod integration for forms
jspdf | Generating PDF invoices client-side (if needed as fallback) or preview

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  sans: ["Inter", "sans-serif"],
  display: ["Playfair Display", "serif"], // For elegant headings
}
Auth:
- JWT stored in localStorage
- API requests need `Authorization: Bearer <token>` header (need to update queryClient)
- Public routes: `/share/:token`, `/login`, `/register`
