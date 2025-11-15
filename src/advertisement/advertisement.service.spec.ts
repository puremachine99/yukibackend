import { Test, TestingModule } from '@nestjs/testing';
import { AdvertisementService } from './advertisement.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AdvertisementService', () => {
  let service: AdvertisementService;
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
      providers: [
        AdvertisementService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<AdvertisementService>(AdvertisementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
