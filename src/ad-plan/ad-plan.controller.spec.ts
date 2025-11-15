import { Test, TestingModule } from '@nestjs/testing';
import { AdPlanController } from './ad-plan.controller';
import { AdPlanService } from './ad-plan.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AdPlanController', () => {
  let controller: AdPlanController;
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
      controllers: [AdPlanController],
      providers: [
        AdPlanService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    controller = module.get<AdPlanController>(AdPlanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
