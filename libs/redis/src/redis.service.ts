import { ConfigService } from '@app/config';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import Redis, { RedisOptions } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  logger = new Logger('Redis Service');

  private readonly redisClient: Redis;
  private readonly subClient: Redis;
  constructor(private readonly configService: ConfigService) {
    const redisConfig = {
      host: this.configService.get('redis').host,
      port: this.configService.get('redis').port,
      username: this.configService.get('redis').username,
      password: this.configService.get('redis').password,
      keepAlive: 30000,
      connectTimeout: 10000,
      lazyConnect: true,
      retryStrategy: (times: number) => Math.min(times * 50, 2000),
    } as RedisOptions;
    this.redisClient = new Redis(redisConfig);
    this.subClient = new Redis(redisConfig);
  }

  onModuleInit() {
    this.redisClient.on('connect', () => {
      this.logger.verbose('Redis client connected');
    });
    this.redisClient.on('error', (error) => {
      this.logger.error('Redis connection error:', error);
    });
    this.subClient.on('connect', () => {
      this.logger.verbose('Redis subscriber client connected');
    });
    this.subClient.on('error', (error) => {
      this.logger.error('Redis subscriber connection error:', error);
    });
  }

  onModuleDestroy() {
    this.logger.verbose('Redis client disconnected');
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
    await this.redisClient.del(key);
  }

  async delByPattern(pattern: string): Promise<void> {
    let cursor = '0';
    let keys: string[] = [];

    do {
      const [nextCursor, resultKeys] = await this.redisClient.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        1000,
      );
      cursor = nextCursor;
      keys = keys.concat(resultKeys);
    } while (cursor !== '0');

    if (keys.length > 0) {
      const pipeline = this.redisClient.pipeline();
      keys.forEach((key) => pipeline.del(key));
      await pipeline.exec();
    }
  }

  async clear(): Promise<void> {
    await this.redisClient.flushall();
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
