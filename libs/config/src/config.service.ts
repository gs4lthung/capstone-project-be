import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

interface Config {
  port: {
    api_gateway: number;
    auth_service: number;
    user_service: number;
  };
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
}

@Injectable()
export class ConfigService {
  private readonly config: Config;
  constructor(private nestConfigService: NestConfigService) {
    this.config = {
      port: {
        api_gateway: this.nestConfigService.get('PORT_API_GATEWAY', 8386),
        auth_service: this.nestConfigService.get('PORT_AUTH_SERVICE', 8387),
        user_service: this.nestConfigService.get('PORT_USER_SERVICE', 8388),
      },
      database: {
        host: this.nestConfigService.get('DB_HOST', 'localhost'),
        port: this.nestConfigService.get('DB_PORT', 5432),
        username: this.nestConfigService.get('DB_USERNAME', 'postgres'),
        password: this.nestConfigService.get('DB_PASSWORD', '12345'),
        database: this.nestConfigService.get('DB_NAME', 'mydatabase'),
      },
    };
  }

  get<T extends keyof Config>(key: T): Config[T] {
    return this.config[key];
  }

  getAll(): Config {
    return this.config;
  }
}
