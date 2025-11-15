import { Test, TestingModule } from '@nestjs/testing';
import { AdvertisementController } from './advertisement.controller';
import { AdvertisementService } from './advertisement.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AdvertisementController', () => {
  let controller: AdvertisementController;
  const prismaMock = {
    adPlan: {
      count: jest.fn().mockResolvedValue(0),
      createMany: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    advertisement: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    transaction: {
      findUnique: jest.fn(),
    },
  } as unknown as PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdvertisementController],
      providers: [
        AdvertisementService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    controller = module.get<AdvertisementController>(AdvertisementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
