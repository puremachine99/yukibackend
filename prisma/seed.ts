import { PrismaClient, Prisma, AuctionStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const FISH_COLORS = [
  'Kohaku',
  'Sanke',
  'Showa',
  'Bekko',
  'Shiro Utsuri',
  'Asagi',
  'Doitsu',
  'Ginrin',
  'Ochiba',
  'Platinum'
];

const FISH_TYPES = ['Koi', 'Nishikigoi', 'Butterfly Koi', 'Shortfin Koi'];
const BASE_PASSWORD = 'nopel123';
const USERS_COUNT = 5;
const ITEMS_PER_USER = 10;
const ITEMS_PER_AUCTION = 5;

async function resetTables() {
  await prisma.$transaction([
    prisma.bid.deleteMany(),
    prisma.chat.deleteMany(),
    prisma.cart.deleteMany(),
    prisma.itemOnAuction.deleteMany(),
    prisma.item.deleteMany(),
    prisma.auction.deleteMany(),
    prisma.user.deleteMany()
  ]);
}

function buildFishName(index: number) {
  const color = FISH_COLORS[index % FISH_COLORS.length];
  const type = FISH_TYPES[index % FISH_TYPES.length];
  return `${color} ${type} #${index + 1}`;
}

async function createAdmin(hashedPassword: string) {
  return prisma.user.create({
    data: {
      name: 'Admin Nextyuki',
      email: 'admin@yukiauction.test',
      phone: '6280000000000',
      password: hashedPassword,
      role: 'admin',
      city: 'Jakarta',
      isVerified: true,
      isPriority: true,
      avatar: faker.image.avatar()
    }
  });
}

type CreatedUser = Awaited<ReturnType<typeof prisma.user.create>>;
type CreatedItem = Awaited<ReturnType<typeof prisma.item.create>>;

async function createSellers(hashedPassword: string) {
  const sellers: CreatedUser[] = [];

  for (let i = 0; i < USERS_COUNT; i++) {
    const seller = await prisma.user.create({
      data: {
        name: `Seller ${i + 1}`,
        email: `seller${i + 1}@yukiauction.test`,
        phone: `62812${faker.string.numeric(8)}${i}`,
        password: hashedPassword,
        role: 'user',
        city: faker.location.city(),
        isVerified: true,
        isPriority: i % 2 === 0,
        avatar: faker.image.avatar(),
        bio: 'Hobi budidaya ikan koi dan sering ikut lelang.'
      }
    });
    sellers.push(seller);
  }

  return sellers;
}

async function createItemsForUser(userId: number) {
  const items: CreatedItem[] = [];

  for (let i = 0; i < ITEMS_PER_USER; i++) {
    const item = await prisma.item.create({
      data: {
        name: buildFishName(i),
        description: faker.lorem.sentences({ min: 1, max: 2 }),
        size: faker.number.float({ min: 15, max: 85, fractionDigits: 2 }),
        weight: faker.number.float({ min: 0.5, max: 6, fractionDigits: 2 }),
        gender: faker.helpers.arrayElement(['male', 'female', 'unknown']),
        category: 'Koi',
        origin: faker.location.city(),
        breeder: faker.company.name(),
        startingBid: new Prisma.Decimal(faker.number.float({ min: 300000, max: 800000, fractionDigits: 0 })),
        bidIncrement: new Prisma.Decimal(faker.number.float({ min: 10000, max: 50000, fractionDigits: 0 })),
        buyItNow: new Prisma.Decimal(faker.number.float({ min: 800000, max: 2500000, fractionDigits: 0 })),
        ownerId: userId,
        attributes: {
          pattern: faker.helpers.arrayElement(['Tancho', 'Metallic', 'Doitsu', 'Konjo']),
          ageMonths: faker.number.int({ min: 6, max: 36 })
        }
      }
    });
    items.push(item);
  }

  return items;
}

async function createAuctionForUser(userId: number, items: { id: number }[]) {
  const startTime = new Date();
  const endTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const auction = await prisma.auction.create({
    data: {
      title: `Lelang Spesial Koi ${userId}`,
      description: 'Paket ikan koi pilihan, siap dikirim ke seluruh Indonesia.',
      startTime,
      endTime,
      status: AuctionStatus.active,
      userId
    }
  });

  const selectedItems = items.slice(0, ITEMS_PER_AUCTION);
  await prisma.$transaction(
    selectedItems.map((item) =>
      prisma.itemOnAuction.create({
        data: {
          auctionId: auction.id,
          itemId: item.id,
          status: 'active'
        }
      })
    )
  );

  return auction;
}

async function main() {
  console.log('🌱 Start seeding yukiauction data...');
  const hashedPassword = await bcrypt.hash(BASE_PASSWORD, 10);

  await resetTables();
  await createAdmin(hashedPassword);
  const sellers = await createSellers(hashedPassword);

  for (const seller of sellers) {
    const items = await createItemsForUser(seller.id);
    await createAuctionForUser(seller.id, items);
  }

  console.log('✅ Seed finished. Default password for all accounts: nopel123');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
