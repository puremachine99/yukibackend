import { Module } from '@nestjs/common';
import { TransactionLogService } from './transaction-log.service';

@Module({
  providers: [TransactionLogService]
})
export class TransactionLogModule {}
