## YUKIAUCTION BACKEND (NestJS + Prisma)

Backend service for YukiAuction: authentication, users, items, auctions, bids, cart/transaction flow, notifications, admin, advertisement, seller balance, and revenue summary.

Credit: Theon Lyson feat Yuki

## Dependencies
- Node.js 18+ (LTS recommended)
- npm 9+ or pnpm/yarn
- PostgreSQL 14+

## Environment
Create a `.env` in project root:
- `DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DBNAME?schema=public`
- `JWT_SECRET=supersecretkey` (change for production)

Optional:
- `PORT=3000`

## Install
1) Install deps
- `npm install`

2) Prisma generate + migrate
- `npx prisma generate`
- `npx prisma migrate dev --name init` (first time)

3) (Optional) Seed minimal data
- See `prisma/seed.ts` if present: `npm run prisma:seed` or `npx ts-node prisma/seed.ts`

## Run
- Dev: `npm run start:dev`
- Prod build: `npm run build` then `npm run start:prod`

The server listens on `http://localhost:3000` by default.

## Key Modules & Routes
- Auth: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`
- Users: `GET /users/me`, `PATCH /users/me`, `GET /users/:id`
- Items: CRUD + media
- Auctions: public list/detail/live + private CRUD
- Bids: place bid, buy-now
- Cart & Transactions: simulate pay, update balances + revenue
- Withdrawals: user request + admin processing
- Notifications: list + mark read
- Chat: simple per-auction chats
- Admin (JWT + @Roles('admin')): users, auctions moderation, dashboard, withdrawals
- Advertisement: plans, create ads, admin review, serving
- Seller Balance: summary, chart (seller); list/overview/detail/chart (admin)
- Revenue Summary: list/overview/chart/detail (admin)
- Seller Review: buyers leave ratings/comments, viewable per seller, included in seller summaries

Refer to `yukiauction.postman_collection.json` for a complete Postman collection, including admin routes. Use `{{token}}` for user JWT and `{{adminToken}}` for admin JWT.

## Roles & Guards
- All non-public endpoints require JWT.
- Admin endpoints require `role = 'admin'`.
- Banned users are blocked globally by `JwtAuthGuard`.

## Scripts
- `npm run start` — start
- `npm run start:dev` — dev watch
- `npm run start:prod` — run compiled `dist`
- `npm run build` — compile TypeScript
- `npm run test` — unit tests
- `npm run test:e2e` — e2e tests
- `npm run lint` — ESLint (requires Node available in shell)

## Notes
- After schema changes, run `npx prisma migrate dev` and `npx prisma generate`.
- Ensure your DB is reachable and `.env` is correct before start.

## License
UNLICENSED (internal project)
