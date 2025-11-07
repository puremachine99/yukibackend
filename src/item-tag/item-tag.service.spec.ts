import { Test, TestingModule } from '@nestjs/testing';
import { ItemTagService } from './item-tag.service';

describe('ItemTagService', () => {
  let service: ItemTagService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ItemTagService],
    }).compile();

    service = module.get<ItemTagService>(ItemTagService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
