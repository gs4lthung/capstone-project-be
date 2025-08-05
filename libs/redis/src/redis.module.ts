import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { ConfigModule, ConfigService } from '@app/config';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis, { Keyv } from '@keyv/redis';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        stores: [
          new Keyv({
            store: new KeyvRedis({
              url: `redis://${configService.get('redis').username}:${configService.get('redis').password}@${configService.get('redis').host}:${configService.get('redis').port}`,
            }),
          }),
        ],
        ttl: configService.get('cache').ttl,
        max: configService.get('cache').max,
      }),
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
