import { ConfigService } from '@app/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly redisClient: Redis;
  private readonly subClient: Redis;
  constructor(
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    const redisConfig = {
      host: this.configService.get('redis').host,
      port: this.configService.get('redis').port,
      username: this.configService.get('redis').username,
      password: this.configService.get('redis').password,
      keepAlive: 30000,
    };
    this.redisClient = new Redis(redisConfig);
    this.subClient = new Redis(redisConfig);
  }

  async get(key: string): Promise<any | null> {
    const value = await this.redisClient.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.redisClient.set(
      key,
      JSON.stringify(value),
      ttl ? 'PX' : undefined,
      ttl ? ttl * 1000 : undefined,
    );
  }
  async hset(
    key: string,
    field: string,
    value: string,
    ttl?: number,
  ): Promise<void> {
    await this.redisClient.hset(key, field, value);
    if (ttl) {
      await this.redisClient.hexpire(key, ttl, 'NX', 'FIELDS', 1, field);
    }
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async delByPattern(key: string): Promise<void> {
    await this.cacheManager.del(`${key}*`);
  }

  async clear(): Promise<void> {
    await this.cacheManager.clear();
  }

  async setOnlineUser(userId: number, socketId: string, ttl: number) {
    await this.hset('online_users', userId.toString(), socketId, ttl);
  }

  async refreshOnlineUserTTL(userId: number, socketId: string, ttl: number) {
    const res = await this.redisClient.hexpire(
      'online_users',
      ttl,
      'XX',
      'FIELDS',
      1,
      userId.toString(),
    );
    if (res[0] === -2) await this.setOnlineUser(userId, socketId, ttl);
  }

  async delOnlineUser(userId: number) {
    await this.redisClient.hdel('online_users', userId.toString());
  }

  async getOnlineUser(userId: number): Promise<string | null> {
    return await this.redisClient.hget('online_users', userId.toString());
  }

  async isUserOnline(userId: number): Promise<boolean> {
    const exists = await this.redisClient.hexists(
      'online_users',
      userId.toString(),
    );
    return exists === 1;
  }

  async publish<T>(channel: string, payload: T): Promise<void> {
    await this.redisClient.publish(channel, JSON.stringify(payload));
  }

  subscribe<T>(channel: string, callback: (payload: T) => void) {
    this.subClient.subscribe(channel);

    this.subClient.on('message', (subscribedChannel, message) => {
      if (subscribedChannel === channel) {
        try {
          callback(JSON.parse(message));
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      }
    });
  }
}
