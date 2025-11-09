import { Test, TestingModule } from '@nestjs/testing';
import { AdPlanService } from './ad-plan.service';

describe('AdPlanService', () => {
  let service: AdPlanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdPlanService],
    }).compile();

    service = module.get<AdPlanService>(AdPlanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
