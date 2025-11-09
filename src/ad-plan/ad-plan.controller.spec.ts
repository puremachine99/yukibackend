import { Test, TestingModule } from '@nestjs/testing';
import { AdPlanController } from './ad-plan.controller';
import { AdPlanService } from './ad-plan.service';

describe('AdPlanController', () => {
  let controller: AdPlanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdPlanController],
      providers: [AdPlanService],
    }).compile();

    controller = module.get<AdPlanController>(AdPlanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
