# YUKIAUCTION BACKEND — TODO LIST

## 1. Core Setup (DONE)

- [x] NestJS Project Initialization
- [x] nest new yukiauction-backend
- [x] Environment setup (Windows local PostgreSQL)
- [x] Prisma Integration
- [x] npx prisma init
- [x] prisma/schema.prisma finalized (User, Auction, Item, Bid, etc)
- [x] npx prisma generate
- [x] Database Migration
- [x] Created nextyuki PostgreSQL DB
- [x] npx prisma migrate dev --name init
- [x] PrismaService implemented
- [x] Includes enableShutdownHooks(app) fix
- [x] Validation & Pipes
- [x] Installed class-validator + class-transformer
- [x] Global validation via main.ts
- [x] TypeScript Fixes
- [x] Added /src/types/express.d.ts for req.user
- [x] Adjusted tsconfig.json (typeRoots, skipLibCheck)

## 2. Authentication

- [x] JWT Auth (@nestjs/jwt, passport-jwt, JwtAuthGuard)
- [x] JwtStrategy with ConfigService fallback
- [x] AuthModule wired up (AuthService, AuthController)
- [x] Implement login/register endpoints (hash password + token return)
- [x] Add refresh token or session-based optional flow
- [x] Add @Roles() decorator + admin guard (for admin dashboards)

## 3. Prisma Schema

- [x] Complete relational model for:
  - [x] User / Auction / Item / Bid / Cart / Transaction / SellerBalance
  - [x] Media / Tag / Follow / Wishlist / Like / Notification / Activity
- [x] Indexed frequently queried fields
- [x] Added Enums (AuctionStatus, CartStatus, etc.)
- [x] Added extensible attributes (JSON) for Item specs
- [x] Added optional fields (bio, social links, banner)
- [x] Included financial models (RevenueSummary, Withdrawal, TransactionLog)
- [x] Add Auction.ExtraTime
- [x] Create UserAddress (shipping address)

## 4. Module: Bid

- [x] Generated via nest g resource bid --no-spec
- [x] Controller integrated with JwtAuthGuard
- [x] DTO validated (class-validator)
- [x] Service integrated with Prisma
- [x] Fixed all TypeScript strict errors
- [x] Works end-to-end (token → create bid → DB insert)
- [x] Validate auction status & bid increment
- [x] Add anti-snipe logic (extend endTime dynamically)
- [x] Push Notifikasi bid masuk
- [x] activity log bidder & owner / seller

## 5. Module: Auction

- [x] Re-generated clean folder src/auction/
- [x] Controller secured with JwtAuthGuard
- [x] DTOs (create-auction.dto.ts, update-auction.dto.ts)
- [x] Add @Public() routes for:
  - [x] GET /auction → list all public auctions
  - [x] GET /auction/live → current live auctions
- [x] Add findActiveAuctions() & findDetail() in auction.service.ts
- [x] Add private routes (POST, PATCH, DELETE) with req.user!.id
- [x] Push notifikasi status lelang berubah (active / ended)
- [x] Activity log create auction (seller)

## 6. Module: User

- [x] Generated via nest g resource user --no-spec
- [x] Public route: GET /user/:id → public profile (for /profile/:id)
- [x] Private route: GET /user/me → own profile (endpoint stub exists but missing guard/@Req wiring)
- [x] Add PATCH /user/me → update profile
- [x] Add service logic to include user’s items, auctions, stats
- [x] Add @Public() decorator for public endpoints
- [x] Hash password on creation/update (use bcrypt)
- [x] Log Create_item, update_item
- [x] notification "item sold" -> seller / owner
- [x] integrasi bidService event ke isSold flag

## 7. Module: Item

- [x] Generate via nest g resource items --no-spec
- [x] Integrate PrismaModule (inject PrismaService)
- [x] Add JwtAuthGuard + @Public() decorator support
- [x] Implement controller & service base logic
  - [x] Public: GET /items, GET /items/:id
  - [x] Protected: POST /items, PATCH /items/:id, DELETE /items/:id
- [x] Add ownership check on update() and remove()
- [x] Soft delete support via deletedAt
- [x] Prisma include relations (media, owner)
- [x] DTO validation for CreateItemDto / UpdateItemDto
<!-- upload files pake s3 -->
- [x] Add uploadMedia() endpoint → POST /items/:id/media
  - [x] Relate to Media model (url, type, itemId)
  - [x] Validate with class-validator (@IsUrl(), @IsIn(['image', 'video']))
  - [x] Optionally integrate S3 / Cloudinary upload (phase 3)
- [x] Add GET /items/:id/media (list all media for an item)
- [x] Add pagination & filters on GET /items
  - [x] ?ownerId=, ?category=, ?isSold=, ?page=1&limit=20
- [x] Optional: Add lightweight caching (Redis or in-memory) for trending items

## 8. Module: Cart

- [x] Generate via nest g resource cart --no-spec
- [x] Protected routes:
  - [x] GET /cart → get user’s cart
  - [x] POST /cart/:itemId → add item
  - [x] PATCH /cart/:id/pay → simulate payment
- [x] Add expiration logic (3-day limit) — (tanggal diset, belum auto expire)
- [x] Auto-ban user if unpaid after expiry
- [x] Payment simulation
- [x] Log : Add_to_cart, Pay_cart
- [x] Log : cart_expired (ban)
- [x] Notif : "Item added to cart"
- [x] Notif : "cart expired"
- [x] Activity : CART_EXPIRED (without auto-ban)

## 9. Module: Transaction

- [x] Generate via nest g resource transaction --no-spec
- [x] Protected routes:
- [x] POST /transaction/:cartId/pay
- [x] GET /transaction (user’s transaction history)
- [x] Prisma logic: update SellerBalance + RevenueSummary
- [x] integrate payment simulation (from cart)
- [x] UPDATE SellerBalance n RevenueSummary
- [x] Notification : "Payment received", "Transaction completed"
- [x] Activity : MAKE_PAYMENT, WITHDRAWAL_REQUEST

## 10. Module: Follow / Wishlist / Like

- [x] Generate three lightweight modules (follow, wishlist, like)
- [x] All routes JWT protected:
  - [x] POST to toggle state
  - [x] GET for lists
- [x] Use existing many-to-many models
  - [x] Follow → notif to target
  - [x] Follow → activity log
  - [x] Like → notif ke pemilik item
  - [x] Wishlist → optional (no notif, hanya log)

## 11. Module: Notification

- [x] JWT protected
- [x] GET /notification
- [x] POST /notification/:id/read
- [x] POST /notification/read-all
- [x] PATCH /notification/:id/read
- [x] Prisma logic: mark read/unread

## 12. Module: Chat

- [x] Public read: GET /chat/:auctionId
- [x] Protected post: POST /chat/:auctionId
- [x] WebSocket live room (basic)
- [x] GET /chat/:auctionId → list pesan
- [x] POST /chat/:auctionId → kirim pesan
- [x] Integrasi Activity log (CHAT_SENT)
- [x] Rencana: WebSocket live room

## 13. Module: Admin

- [x] JWT + @Roles('admin') required
- [x] Features:
  - [x] Manage users (ban/unban, auctions, withdrawals)
  - [x] Manage auctions (approve/reject/report)
  - [x] Dashboard revenue summary, SellerBalance
  - [x] Handle withdrawals
  - [x] Log admin actions (approve/reject/report) via ActivityService

## 14. Shared Utilities

- [x] @Public() decorator added
- [x] JwtAuthGuard extended with Reflector
- [x] JwtAuthGuard enforces banned-user lockouts (Prisma check)
- [x] PrismaService universal provider
- [x] Konsistensi @UseGuards(JwtAuthGuard) + @Public() di semua controller
- [x] Optional: add @CurrentUser() decorator (shortcut for req.user!)
- [x] Replace status string literals with Prisma enums (auction/cart/transaction/withdrawal)

## 15. Optional Enhancements (After Core Stable)

- [x] Realtime updates via WebSocket (live auction)
- [ ] Cloud media storage (e.g. S3 / Cloudflare R2)
- [ ] Redis cache for trending items
- [x] Cron jobs for expired cart/auction cleanup
- [ ] Analytics: track view counts, activity logs
- [ ] Notification events (bid placed, item sold, etc)
- [ ] Email / WhatsApp bot integration

## 16. Deployment Prep

- [ ] .env sanitization (JWT_SECRET, DATABASE_URL)
- [ ] Dockerfile & docker-compose.yml (Postgre + Nest)
- [ ] Prisma migrate for production
- [ ] PM2 / Docker deploy script
- [ ] CI/CD setup (GitHub Actions)

## 17. Module: Advertisement

- [x] Prisma schema: enum `AdStatus`, `AdPlan`, `Advertisement` relations
- [x] Seed/admin CRUD for AdPlan (name, price, duration, position)
- [x] Seller flow: submit advertisement request (mediaUrl, redirectUrl, schedule)
- [x] Admin review: approve/reject, activate/expire ads
- [x] Billing: link advertisement to Transaction (transactionId) and AdPlan price
- [x] Serving: expose approved/active ads per placement endpoint
- [ ] Optional: impressions & click analytics

## 18. Module: Seller Balance

- [x] REST endpoints secured w/ JwtAuthGuard + RolesGuard
- [x] List & filter balances (status, pagination) + top sellers overview
- [x] Seller `GET /seller-balance/me` summary + pending withdrawal stats
- [x] Admin detail endpoint w/ recent transactions & withdrawals
- [x] Chart endpoint (seller + admin) for recent sales/admin fee trends

## 19. Module: Revenue Summary

- [x] Admin-only list w/ pagination & periodType filter
- [x] Overview endpoint aggregating totals + last 7 days snapshot
- [x] Chart endpoint for rolling revenue/fee/txn data (up to 90 days)
- [x] Detail endpoint returns normalized Decimal values for analytics

## 20. Module Cleanup

- [x] Remove unused scaffolding modules (media, item-on-auction, tag, item-tag, transaction-log)
- [x] Trim `AppModule` imports to only active modules

## 21. Module: Seller Review

- [x] Prisma model `SellerReview` linked to Transaction/User
- [x] POST /seller-review (buyer only, transaction validation)
- [x] GET /seller-review/pending for buyer tasks
- [x] Public GET /seller-review/seller/:sellerId with aggregates
- [x] Seller summary includes rating averages

# Testing

- [x] E2E: Auth + User profile (register/login/refresh, GET/PATCH /user/me)
- [x] E2E: Inventory & Auction setup (create item/media, create auction, public GET/live)
- [x] E2E: Bidding & Buy flow (bid validation, buy-now, cart pay, transaction & balances)
- [x] E2E: Follow / Like / Wishlist / Notification read toggles
- [x] E2E: Chat HTTP + WebSocket (join/send, CHAT_SENT activity)
- [x] E2E: Withdrawals & Admin processing (request, approve, notify)
- [ ] E2E: Scheduler flows (auction end auto-cart, cart expiry cleanup)

Note ku :
rd /s /q node_modules\.prisma
rd /s /q node_modules\@prisma\client
npm install
npx prisma generate
