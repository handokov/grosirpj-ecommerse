---
Task ID: 1
Agent: Main Agent
Task: Implement RajaOngkir integration for automatic shipping cost calculation

Work Log:
- Explored current codebase: Header.tsx (CartDrawer with 3-step checkout), useStore.ts, orders API, Prisma schema
- Updated .env with RAJAONGKIR_API_KEY, RAJAONGKIR_ORIGIN_CITY_ID (default: 153/Jakarta), RAJAONGKIR_BASE_URL
- Updated Prisma schema: added courier, courierService, destinationCity fields to Order model
- Ran db:push to sync local SQLite schema
- Created /api/ongkir/cities/route.ts: City search API proxying to RajaOngkir with 24h cache
- Created /api/ongkir/cost/route.ts: Shipping cost calculation API supporting JNE, POS, TIKI (Starter plan)
- Created ShippingCalculator.tsx component with: city search dropdown, "Cek Ongkir" button, courier service selection, manual input fallback when API key not configured
- Updated Header.tsx CartDrawer: replaced static ongkir buttons with ShippingCalculator component, added totalWeight calculation, updated order submission with courier info
- Updated invoice display: shows destination city, courier name, courier service
- Updated WhatsApp message: includes destination city, courier info in ongkir line
- Updated orders API route: saves courier, courierService, destinationCity to database
- Updated Turso schema push script with ALTER TABLE for new columns, ran successfully
- Lint passes cleanly
- API endpoints tested via curl - graceful handling of missing API key
- Page loads correctly (verified via curl - 94KB content with GrosirPJ)

Stage Summary:
- RajaOngkir integration complete with graceful fallback when API key not configured
- User needs to: 1) Register at rajaongkir.com, 2) Get API key, 3) Add RAJAONGKIR_API_KEY to .env
- Starter plan (free) supports JNE, POS, TIKI couriers
- Pro plan (paid) supports J&T, SiCepat, Wahana, etc. - easy to upgrade by changing RAJAONGKIR_BASE_URL
- All changes pushed to both local SQLite and Turso production database
