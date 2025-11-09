import { Test, TestingModule } from '@nestjs/testing';
import { ItemOnAuctionService } from './item-on-auction.service';

describe('ItemOnAuctionService', () => {
  let service: ItemOnAuctionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ItemOnAuctionService],
    }).compile();

    service = module.get<ItemOnAuctionService>(ItemOnAuctionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
