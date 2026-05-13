# DukaanBazar — Indian General Store

An Indian kirana store e-commerce website with product listings, cart, wishlist, checkout, auth, orders, reviews, and an admin dashboard.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/store run dev` — run the React frontend (port 24964)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, wouter routing, TanStack React Query, shadcn/ui, Tailwind CSS
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Auth: JWT stored as "dukaan_token" in localStorage; bcrypt for password hashing
- Charts: recharts (admin dashboard)

## Where things live

- `artifacts/store/` — React+Vite frontend
- `artifacts/api-server/` — Express 5 backend
- `artifacts/api-server/src/db/schema.ts` — Drizzle schema (source of truth)
- `lib/api-spec/` — OpenAPI spec (source of truth for API contract)
- `lib/api-client-react/src/generated/` — generated React Query hooks + Zod schemas (do not edit by hand)
- `artifacts/store/src/index.css` — theme (saffron primary, forest green secondary)
- `artifacts/store/src/context/AuthContext.tsx` — auth state management
- `artifacts/store/src/main.tsx` — global fetch interceptor for auth headers

## Architecture decisions

- Contract-first API: OpenAPI spec is the source of truth; hooks and schemas are generated from it
- JWT auth via global fetch interceptor in main.tsx (injects Bearer token on /api/ calls)
- All mutations invalidate relevant query caches via queryClient.invalidateQueries
- Admin routes protected client-side by AdminRoute component (also enforced server-side)
- Single-file page components — admin pages live in src/pages/admin/

## Product

- 12 product categories (Beauty, Biscuits, Chocolates, Cleaning, Beverages, Hair Care, Household, Oral Care, Packaged Food, Snacks, Soaps, Stationery)
- 33 seeded Indian products with real prices, discounts, and stock levels
- Customer features: browse, search, filter, add to cart/wishlist, checkout, track orders, leave reviews
- Admin features: dashboard with charts, manage products/categories/orders/users

## Seed data

- Admin user: admin@dukaanbazar.com / admin123
- 12 categories, 33 products pre-seeded

## User preferences

- Indian currency: ₹ symbol throughout
- Free shipping over ₹500
- No emojis in UI
- Color theme: saffron orange (#f97316 / HSL 28 95% 50%) as primary, forest green (HSL 145 55% 25%) as secondary

## Gotchas

- Run `pnpm --filter @workspace/api-spec run codegen` after any OpenAPI spec changes
- Do not edit files in `lib/api-client-react/src/generated/` directly
- The global fetch interceptor in main.tsx only injects auth headers for URLs containing "/api/"
- Vite may cache pre-transform errors — restart the workflow if files are not being picked up

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
