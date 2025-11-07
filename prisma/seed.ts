import { PrismaClient, Prisma } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding...');

  // === USERS ===
  const users: Prisma.UserCreateManyInput[] = [];
  for (let i = 0; i < 10; i++) {
    users.push({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.helpers.fromRegExp(/628[0-9]{9,12}/), // ganti phone.number()
      password: faker.internet.password(),
      city: faker.location.city(),
      isVerified: faker.datatype.boolean(),
      isPriority: faker.datatype.boolean(),
      avatar: faker.image.avatar(),
    });
  }
  await prisma.user.createMany({ data: users });

  // === ITEMS ===
  const allUsers = await prisma.user.findMany();
  const items: Prisma.ItemCreateManyInput[] = [];
  for (let i = 0; i < 30; i++) {
    const owner = faker.helpers.arrayElement(allUsers);
    items.push({
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      size: faker.number.float({ min: 5, max: 100 }),
      weight: faker.number.float({ min: 0.1, max: 10 }),
      gender: faker.helpers.arrayElement(['male', 'female', 'unknown']),
      category: faker.commerce.department(),
      startingBid: new Prisma.Decimal(
        faker.number.float({ min: 100000, max: 500000 }),
      ),
      bidIncrement: new Prisma.Decimal(
        faker.number.float({ min: 5000, max: 20000 }),
      ),
      ownerId: owner.id,
    });
  }
  await prisma.item.createMany({ data: items });

  // === AUCTIONS ===
  const now = new Date();
  const auctions: Prisma.AuctionCreateManyInput[] = [];
  for (let i = 0; i < 5; i++) {
    const user = faker.helpers.arrayElement(allUsers);
    auctions.push({
      title: faker.commerce.productAdjective() + ' Auction',
      description: faker.lorem.sentences(2),
      startTime: now,
      endTime: faker.date.future(),
      status: 'active',
      userId: user.id,
    });
  }
  await prisma.auction.createMany({ data: auctions });

  console.log('✅ Seeding done!');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
