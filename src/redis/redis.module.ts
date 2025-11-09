import { Global, Module, Injectable } from '@nestjs/common';
@Injectable()
export class RedisService {
  private client: unknown;
  getClient(): unknown {
    return this.client;
  }
}

@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
