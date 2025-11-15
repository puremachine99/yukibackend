import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { io, Socket } from 'socket.io-client';
import { Prisma } from '@prisma/client';

jest.setTimeout(5000);

describe('Seller happy-path flow (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let httpServer: any;
  let wsBaseUrl: string;
  let chatSocket: Socket | null = null;

  const sellerPayload = {
    name: 'Test Seller',
    email: `seller_${Date.now()}@example.com`,
    password: 'P@ssw0rd!',
    phone: '08123456789',
  };

  let accessToken: string;
  let refreshToken: string;
  let itemId: number;
  let auctionId: number;
  let itemOnAuctionId: number;
  let cartId: number;
  let buyerToken: string;
  let sellerId: number;
  let adminToken: string;
  let adminId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.listen(0);

    httpServer = app.getHttpServer();
    wsBaseUrl = await app.getUrl();
    prisma = app.get(PrismaService);

    await prisma.$transaction([
      // 1️⃣ Bersihkan semua entitas turunan dulu (yang punya FK ke user / item / auction)
      prisma.notification.deleteMany(),
      prisma.activity.deleteMany(),
      prisma.transactionLog.deleteMany(),
      prisma.bid.deleteMany(),
      prisma.chat.deleteMany(),
      prisma.wishlist.deleteMany(),
      prisma.like.deleteMany(),
      prisma.itemTag.deleteMany(),
      prisma.follow.deleteMany(),

      // 2️⃣ Baru hapus transaksi dan relasi keuangan
      prisma.transaction.deleteMany(),
      prisma.cart.deleteMany(),
      prisma.withdrawal.deleteMany(),
      prisma.sellerBalance.deleteMany(),
      prisma.revenueSummary.deleteMany(),

      // 3️⃣ Hapus relasi item–auction
      prisma.itemOnAuction.deleteMany(),
      prisma.media.deleteMany(),

      // 4️⃣ Baru hapus entity utama
      prisma.item.deleteMany(),
      prisma.auction.deleteMany(),
      prisma.user.deleteMany(),
    ]);
  });

  afterAll(async () => {
    if (chatSocket) {
      chatSocket.disconnect();
    }
    await app.close();
  });

  it('registers, login, refresh token, update profile', async () => {
    const registerRes = await request(httpServer)
      .post('/auth/register')
      .send(sellerPayload)
      .expect(201);

    expect(registerRes.body?.user?.email).toBe(sellerPayload.email);
    expect(registerRes.body?.access_token).toBeDefined();
    expect(registerRes.body?.refresh_token).toBeDefined();

    await request(httpServer)
      .get('/users/me')
      .set('Authorization', `Bearer ${registerRes.body.access_token}`)
      .expect(200);

    const loginRes = await request(httpServer)
      .post('/auth/login')
      .send({ email: sellerPayload.email, password: sellerPayload.password })
      .expect(201);

    expect(loginRes.body?.access_token).toBeDefined();
    expect(loginRes.body?.refresh_token).toBeDefined();
    accessToken = loginRes.body.access_token;
    refreshToken = loginRes.body.refresh_token;
    const refreshRes = await request(httpServer)
      .post('/auth/refresh')
      .send({ refreshToken })
      .expect(201);
    expect(refreshRes.body?.access_token).toBeDefined();
    expect(refreshRes.body?.refresh_token).toBeDefined();
    accessToken = refreshRes.body.access_token;
    refreshToken = refreshRes.body.refresh_token;

    await request(httpServer)
      .patch('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ city: 'Jakarta', bio: 'Hello there' })
      .expect(200);

    const meRes = await request(httpServer)
      .get('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(meRes.body?.city).toBe('Jakarta');

    const buyerRes = await request(httpServer)
      .post('/auth/register')
      .send({
        name: 'Buyer User',
        email: `buyer_${Date.now()}@example.com`,
        password: 'BuyerPass1!',
        phone: '0811111111',
      })
      .expect(201);
    buyerToken = buyerRes.body.access_token;
    sellerId = registerRes.body.user.id;

    const adminEmail = `admin_${Date.now()}@example.com`;
    await request(httpServer)
      .post('/auth/register')
      .send({
        name: 'Admin User',
        email: adminEmail,
        password: 'AdminPass1!',
        phone: '0899999999',
      })
      .expect(201);

    const adminUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });
    adminId = adminUser!.id;
    await prisma.user.update({
      where: { id: adminId },
      data: { role: 'admin' },
    });
    const adminLogin = await request(httpServer)
      .post('/auth/login')
      .send({ email: adminEmail, password: 'AdminPass1!' })
      .expect(201);
    adminToken = adminLogin.body.access_token;
  });

  it('seller coba bikin auction + inventory, ekspose ke publik(gaperlulogin)', async () => {
    const createItemRes = await request(httpServer)
      .post('/items')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Champion Koi',
        description: 'Beautiful koi for auction',
        category: 'koi',
        startingBid: 1000000,
        media: [
          {
            url: 'https://example.com/koi.jpg',
            type: 'image',
          },
        ],
      })
      .expect(201);

    expect(createItemRes.body.id).toBeDefined();
    itemId = createItemRes.body.id;

    const startTime = new Date(Date.now() - 60_000).toISOString();
    const endTime = new Date(Date.now() + 3_600_000).toISOString();

    const createAuctionRes = await request(httpServer)
      .post('/auction')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Evening Koi Auction',
        description: 'Live auction for prized koi',
        startTime,
        endTime,
      })
      .expect(201);

    expect(createAuctionRes.body.id).toBeDefined();
    auctionId = createAuctionRes.body.id;

    // force auction into active state for bidding tests
    await prisma.auction.update({
      where: { id: auctionId },
      data: { status: 'active' },
    });

    // ensure auction is visible publicly
    const publicAuctions = await request(httpServer)
      .get('/auction')
      .expect(200);
    expect(
      publicAuctions.body.some((a: any) => a.id === auctionId),
    ).toBeTruthy();

    const liveAuctions = await request(httpServer)
      .get('/auction/live')
      .expect(200);
    expect(liveAuctions.body.some((a: any) => a.id === auctionId)).toBeTruthy();

    const auctionDetail = await request(httpServer)
      .get(`/auction/${auctionId}`)
      .expect(200);
    expect(auctionDetail.body?.id).toBe(auctionId);
  });

  it('biddung, cart checkout, summary transaksi', async () => {
    // seed the item to the auction via Prisma (controller flow not built yet)
    // attach item to auction
    const ioa = await prisma.itemOnAuction.create({
      data: {
        itemId,
        auctionId,
      },
    });
    itemOnAuctionId = ioa.id;

    // seller should not bid on own item
    await request(httpServer)
      .post('/bid')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ itemOnAuctionId, amount: 1500000 })
      .expect(403);

    // buyer places a bid
    const buyerBidRes = await request(httpServer)
      .post('/bid')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ itemOnAuctionId, amount: 1600000 })
      .expect(201);
    expect(buyerBidRes.body.id).toBeDefined();

    // buyer attempts low bid (validation)
    await request(httpServer)
      .post('/bid')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ itemOnAuctionId, amount: 1000 })
      .expect(400);

    const buyNowRes = await request(httpServer)
      .post('/bid')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ itemOnAuctionId, amount: 2500000, isBuyNow: true })
      .expect(201);
    expect(buyNowRes.body.isBuyNow).toBe(true);

    const existingCart = await prisma.cart.findUnique({
      where: { itemOnAuctionId },
    });
    expect(existingCart).toBeDefined();
    cartId = existingCart!.id;

    const payRes = await request(httpServer)
      .patch(`/cart/${cartId}/pay`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ paymentMethod: 'manual_transfer' })
      .expect(200);
    expect(payRes.body.isPaid).toBe(true);

    const transactionsRes = await request(httpServer)
      .get('/transaction')
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(200);
    expect(transactionsRes.body[0].status).toBe('paid');
  });

  it('follow, unfollow, like, wishlist, notification', async () => {
    // follow seller
    await request(httpServer)
      .post(`/follow/${sellerId}`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(201);

    const followersRes = await request(httpServer)
      .get('/follow/followers')
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(200);
    expect(Array.isArray(followersRes.body)).toBe(true);

    const likeRes = await request(httpServer)
      .post(`/like/${itemId}`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(201);
    expect(likeRes.body.message).toBe('Liked');

    await request(httpServer)
      .post(`/wishlist/${itemId}`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(201);

    const wishlistRes = await request(httpServer)
      .get('/wishlist')
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(200);
    expect(wishlistRes.body.some((w: any) => w.itemId === itemId)).toBe(true);

    // check notifications for seller (like + follow + item sold)
    const sellerNotifications = await request(httpServer)
      .get('/notification')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(sellerNotifications.body.length).toBeGreaterThan(0);
    const notifId = sellerNotifications.body[0].id;

    await request(httpServer)
      .post(`/notification/${notifId}/read`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201);

    await request(httpServer)
      .patch(`/notification/${notifId}/read`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    await request(httpServer)
      .post('/notification/read-all')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201);
  });

  it('chat lewat webSocket', async () => {
    await request(httpServer)
      .post(`/chat/auction/${auctionId}`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        message: 'Hi there from HTTP',
        itemOnAuctionId,
      })
      .expect(201);

    const listRes = await request(httpServer)
      .get(`/chat/auction/${auctionId}`)
      .expect(200);
    expect(Array.isArray(listRes.body)).toBe(true);

    await new Promise<void>((resolve, reject) => {
      chatSocket = io(`${wsBaseUrl.replace(/\/$/, '')}/chat`, {
        auth: { token: buyerToken },
        transports: ['websocket'],
      });
      chatSocket.once('connect', () => resolve());
      chatSocket.once('connect_error', reject);
    });

    chatSocket!.emit('joinAuction', { auctionId });
    await new Promise((resolve) => setTimeout(resolve, 200));

    const wsMessagePromise = new Promise<any>((resolve) => {
      chatSocket!.once('chatMessage', (payload) => resolve(payload));
    });

    chatSocket!.emit('sendMessage', {
      auctionId,
      itemOnAuctionId,
      message: 'WS says hello',
    });

    const wsMessage = await wsMessagePromise;
    expect(wsMessage?.message).toBe('WS says hello');

    const activityRes = await request(httpServer)
      .get('/activity')
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(200);
    expect(
      activityRes.body.some((log: any) => log.action === 'CHAT_SENT'),
    ).toBe(true);
  });

  it('coba withdrawal dan admin', async () => {
    await prisma.sellerBalance.upsert({
      where: { sellerId },
      update: {
        netBalance: new Prisma.Decimal(1_000_000),
        totalSales: new Prisma.Decimal(1_000_000),
        status: 'available',
      },
      create: {
        sellerId,
        totalSales: new Prisma.Decimal(1_000_000),
        adminFee: new Prisma.Decimal(0),
        netBalance: new Prisma.Decimal(1_000_000),
        status: 'available',
      },
    });

    const withdrawRes = await request(httpServer)
      .post('/withdrawal')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ amount: 500000 })
      .expect(201);
    expect(withdrawRes.body.status).toBe('pending');

    const sellerWithdrawals = await request(httpServer)
      .get('/withdrawal')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(sellerWithdrawals.body.length).toBeGreaterThan(0);

    const adminList = await request(httpServer)
      .get('/withdrawal/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(adminList.body.some((w: any) => w.id === withdrawRes.body.id)).toBe(
      true,
    );

    await request(httpServer)
      .patch(`/withdrawal/${withdrawRes.body.id}/process`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'approved',
        payoutReference: 'PAYOUT-123',
      })
      .expect(200);

    const notifications = await request(httpServer)
      .get('/notification')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(
      notifications.body.some(
        (n: any) =>
          n.type === 'withdrawal_status' &&
          n.data?.withdrawalId === withdrawRes.body.id,
      ),
    ).toBe(true);
  });
});
