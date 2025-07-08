import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  private readonly config: Record<string, any>;

  constructor() {
    this.config = {
      port: {
        api_gateway: process.env.API_GATEWAY_PORT || 3000,
        auth_service: process.env.AUTH_SERVICE_PORT || 3001,
        user_service: process.env.USER_SERVICE_PORT || 3002,
      },
    };
  }

  get(key: string): any {
    return this.config[key];
  }

  getAll(): Record<string, any> {
    return this.config;
  }
}
