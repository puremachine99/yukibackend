import { Test, TestingModule } from '@nestjs/testing';
import { AdPlanService } from './ad-plan.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AdPlanService', () => {
  let service: AdPlanService;
  const prismaMock = {
    adPlan: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  } as unknown as PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdPlanService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<AdPlanService>(AdPlanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
