import { Module } from '@nestjs/common';
import { ItemTagService } from './item-tag.service';

@Module({
  providers: [ItemTagService]
})
export class ItemTagModule {}
