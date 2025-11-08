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
- [ ] Add refresh token or session-based optional flow
- [ ] Add @Roles() decorator + admin guard (for admin dashboards)

## 3. Prisma Schema (Finalized)
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

## 4. Module: Bid (DONE & CLEAN)
- [x] Generated via nest g resource bid --no-spec
- [x] Controller integrated with JwtAuthGuard
- [x] DTO validated (class-validator)
- [x] Service integrated with Prisma
- [x] Fixed all TypeScript strict errors
- [x] Works end-to-end (token → create bid → DB insert)
- [x] Validate auction status & bid increment
- [x] Add anti-snipe logic (extend endTime dynamically)
- [ ] Push Notifikasi bid masuk
- [ ] activity log bidder & owner / seller

## 5. Module: Auction
- [x] Re-generated clean folder src/auction/
- [x] Controller secured with JwtAuthGuard
- [x] DTOs (create-auction.dto.ts, update-auction.dto.ts)
- [x] Add @Public() routes for:
  - [x] GET /auction → list all public auctions
  - [x] GET /auction/live → current live auctions
- [ ] Add findActiveAuctions() & findDetail() in auction.service.ts
- [x] Add private routes (POST, PATCH, DELETE) with req.user!.id
- [ ] Push notifikasi status lelang berubah (active / ended)
- [ ] Activity log create auction (seller)

## 🟨 6. Module: User
- [x] Generated via nest g resource user --no-spec
- [x] Public route: GET /user/:id → public profile (for /profile/:id)
- [x] Private route: GET /user/me → own profile (endpoint stub exists but missing guard/@Req wiring)
- [x] Add PATCH /user/me → update profile
- [x] Add service logic to include user’s items, auctions, stats
- [x] Add @Public() decorator for public endpoints
- [x] Hash password on creation/update (use bcrypt)
- [ ] Log Create_item, update_item 
- [ ] notification "item sold" -> seller / owner
- [ ] integrasi bidService event ke isSold flag

## 7. Module: Item
-[x] Generate via nest g resource items --no-spec
-[x] Integrate PrismaModule (inject PrismaService)
-[x] Add JwtAuthGuard + @Public() decorator support
-[x] Implement controller & service base logic
    -[x] Public: GET /items, GET /items/:id
    -[x] Protected: POST /items, PATCH /items/:id, DELETE /items/:id
-[x] Add ownership check on update() and remove()
-[x] Soft delete support via deletedAt
-[x] Prisma include relations (media, owner)
-[x] DTO validation for CreateItemDto / UpdateItemDto
<!-- upload files pake s3 -->
-[x] Add uploadMedia() endpoint → POST /items/:id/media
    -[x] Relate to Media model (url, type, itemId)
    -[x] Validate with class-validator (@IsUrl(), @IsIn(['image', 'video']))
    -[x] Optionally integrate S3 / Cloudinary upload (phase 3)
-[x] Add GET /items/:id/media (list all media for an item)
-[x] Add pagination & filters on GET /items
    -[x] ?ownerId=, ?category=, ?isSold=, ?page=1&limit=20
-[x] Optional: Add lightweight caching (Redis or in-memory) for trending items

## 8. Module: Cart
- [x] Generate via nest g resource cart --no-spec
- [ ] Protected routes:
  - [ ] GET /cart → get user’s cart
  - [ ] POST /cart/:itemId → add item
  - [ ] PATCH /cart/:id/pay → simulate payment
- [ ] Add expiration logic (3-day limit)
- [ ] Auto-ban user if unpaid after expiry
- [ ] Payment simulation
- [ ] Log : Add_to_cart, cart_expired (ban)
- [ ] Notif : "Item added to cart", "cart expired"

## 9. Module: Transaction
- [x] Generate via nest g resource transaction --no-spec
- [ ] Protected routes:
  - [ ] POST /transaction/:cartId/pay
  - [ ] GET /transaction (user’s transaction history)
- [ ] Prisma logic: update SellerBalance + RevenueSummary
- [ ] integrate payment simulation (from cart)
- [ ] UPDATE SellerBalance n RevenueSummary
- [ ] Notification : "Payment received", "Transaction completed"
- [ ] Activity : MAKE_PAYMENT, WITHDRAWAL_REQUEST

## 10. Module: Follow / Wishlist / Like
- [x] Generate three lightweight modules (follow, wishlist, like)
- [ ] All routes JWT protected:
  - [ ] POST to toggle state
  - [ ] GET for lists
- [ ] Use existing many-to-many models
  - [ ] Follow → notif to target
  - [ ] Follow → activity log
  - [ ] Like → notif ke pemilik item
  - [ ] Wishlist → optional (no notif, hanya log)

## 11. Module: Notification
- [ ] JWT protected
- [x] GET /notification
- [x] POST /notification/:id/read
- [x] POST /notification/read-all
- [ ] PATCH /notification/:id/read
- [ ] Prisma logic: mark read/unread

## 12. Module: Chat
- [ ] Public read: GET /chat/:auctionId
- [ ] Protected post: POST /chat/:auctionId
- [ ] Later → WebSocket integration for realtime
- [ ] GET /chat/:auctionId → list pesan
- [ ] POST /chat/:auctionId → kirim pesan
- [ ] Integrasi Activity log (CHAT_SENT)
- [ ] Rencana: WebSocket live room

## 13. Module: Admin
- [ ] JWT + @Roles('admin') required
- [ ] Features:
  - [ ] Manage users (ban/unban, auctions, withdrawals)
  - [ ] Manage auctions (approve/reject/report)
  - [ ] Dashboard revenue summary, SellerBalance
  - [ ] Handle withdrawals
 
## 14. Shared Utilities
- [x] @Public() decorator added
- [x] JwtAuthGuard extended with Reflector
- [x] PrismaService universal provider
- [ ] Optional: add @CurrentUser() decorator (shortcut for req.user!)

## 15. Optional Enhancements (After Core Stable)
- [ ] Realtime updates via WebSocket (live auction)
- [ ] Cloud media storage (e.g. S3 / Cloudflare R2)
- [ ] Redis cache for trending items
- [ ] Cron jobs for expired cart/auction cleanup
- [ ] Analytics: track view counts, activity logs
- [ ] Notification events (bid placed, item sold, etc)
- [ ] Email / WhatsApp bot integration 

## 16. Deployment Prep
- [ ] .env sanitization (JWT_SECRET, DATABASE_URL)
- [ ] Dockerfile & docker-compose.yml (Postgre + Nest)
- [ ] Prisma migrate for production
- [ ] PM2 / Docker deploy script
- [ ] CI/CD setup (GitHub Actions)


rd /s /q node_modules\.prisma
rd /s /q node_modules\@prisma\client
npm install
npx prisma generate