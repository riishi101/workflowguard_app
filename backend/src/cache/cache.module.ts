import { Module, CacheModule } from '@nestjs/common';
import { CacheService } from './cache.service';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      ttl: 300, // 5 minutes default TTL
      max: 100, // maximum number of items in cache
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class AppCacheModule {} 