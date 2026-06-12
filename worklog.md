---
Task ID: 1-11
Agent: Main Agent
Task: Build Admin Seller Centre (Shopee-style) for GrosirPJ

Work Log:
- Updated Prisma schema with User, Order, OrderItem models
- Configured NextAuth.js with credentials provider (JWT strategy, 24h session)
- Created middleware for admin route protection (checks session token)
- Created StorefrontWrapperClient to separate storefront/admin layouts
- Built admin login page with email/password form
- Built admin dashboard with KPI cards, revenue chart, top products, low stock, recent orders
- Built product management pages (list, add, edit, delete) with Cloudinary upload
- Built category management page with CRUD dialog
- Built order management pages (list with status tabs, detail with status stepper)
- Built shop settings page (placeholder)
- Created all admin API routes (dashboard, products, categories, orders, upload)
- Created admin layout with Shopee-style sidebar navigation
- Created admin header with search and profile dropdown
- Seeded admin user (admin@grosirpj.com / admin123) and sample orders
- Added NEXTAUTH_SECRET and NEXTAUTH_URL to .env
- Pushed all changes to GitHub

Stage Summary:
- Admin Seller Centre is fully built and committed
- Key files: src/app/admin/*, src/app/api/admin/*, src/lib/auth.ts, src/middleware.ts
- Login credentials: admin@grosirpj.com / admin123
- Admin routes: /admin/login, /admin, /admin/products, /admin/categories, /admin/orders, /admin/settings
- Vercel needs NEXTAUTH_SECRET environment variable added
- Turso DB needs User, Order, OrderItem tables (run db:push after deploy or manually)
