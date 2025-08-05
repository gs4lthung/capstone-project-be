import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

interface Config {
  node_env: string;
  app: {
    name: string;
    version: string;
  };
  api_gateway: {
    host: string;
    port: number;
  };
  auth_service: {
    host: string;
    port: number;
  };
  user_service: {
    host: string;
    port: number;
  };
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
  jwt: {
    secret: string;
    expiration: string | number;
  };
  rate_limiter?: {
    max_requests?: number;
    time?: number;
  };
  password_salt_rounds?: number;
  cache?: {
    ttl?: number;
    max?: number;
  };
  redis: {
    username?: string;
    password?: string;
    host?: string;
    port?: number;
  };
  graphql?: {
    playground?: boolean;
    introspection?: boolean;
  };
  rabbitmq?: {
    host?: string;
    port?: number;
    durable?: boolean;
    autoDelete?: boolean;
  };
  firebase?: {
    type?: string;
    project_id?: string;
    private_key_id?: string;
    private_key?: string;
    client_email?: string;
    client_id?: string;
    auth_uri?: string;
    token_uri?: string;
    auth_provider_x509_cert_url?: string;
    universe_domain?: string;
  };
}

@Injectable()
export class ConfigService {
  private readonly config: Config;
  constructor(private nestConfigService: NestConfigService) {
    this.config = {
      app: {
        name: this.nestConfigService.get('APP_NAME', 'Capstone Project'),
        version: this.nestConfigService.get('APP_VERSION', 'v1'),
      },
      node_env: this.nestConfigService.get('NODE_ENV', 'dev'),
      api_gateway: {
        host: this.nestConfigService.get('API_GATEWAY_HOST', 'localhost'),
        port: this.nestConfigService.get('API_GATEWAY_PORT', 8386),
      },
      auth_service: {
        host: this.nestConfigService.get('AUTH_SERVICE_HOST', 'localhost'),
        port: this.nestConfigService.get('AUTH_SERVICE_PORT', 8387),
      },
      user_service: {
        host: this.nestConfigService.get('USER_SERVICE_HOST', 'localhost'),
        port: this.nestConfigService.get('USER_SERVICE_PORT', 8388),
      },
      database: {
        host: this.nestConfigService.get('DB_HOST', 'localhost'),
        port: this.nestConfigService.get('DB_PORT', 5432),
        username: this.nestConfigService.get('DB_USERNAME', 'postgres'),
        password: this.nestConfigService.get('DB_PASSWORD', '12345'),
        database: this.nestConfigService.get('DB_NAME', 'mydatabase'),
      },
      jwt: {
        secret: this.nestConfigService.get('JWT_SECRET', 'defaultsecret'),
        expiration: this.nestConfigService.get('JWT_EXPIRATION', '7d'),
      },
      rate_limiter: {
        max_requests: Number(
          this.nestConfigService.get('RATE_LIMITER_MAX_REQUESTS', 1000),
        ),
        time: Number(this.nestConfigService.get('RATE_LIMITER_TIME', 60)),
      },
      password_salt_rounds: Number(
        this.nestConfigService.get('PASSWORD_SALT_ROUNDS', 10),
      ),
      cache: {
        ttl: Number(this.nestConfigService.get('CACHE_TTL', 60000)),
        max: Number(this.nestConfigService.get('CACHE_MAX', 1000)),
      },
      redis: {
        username: this.nestConfigService.get('REDIS_USERNAME', 'default'),
        password: this.nestConfigService.get('REDIS_PASSWORD', ''),
        host: this.nestConfigService.get('REDIS_HOST', 'localhost'),
        port: Number(this.nestConfigService.get('REDIS_PORT', 17454)),
      },
      graphql: {
        playground: this.nestConfigService.get('GRAPHQL_PLAYGROUND', true),
        introspection: this.nestConfigService.get(
          'GRAPHQL_INTROSPECTION',
          true,
        ),
      },
      rabbitmq: {
        host: this.nestConfigService.get('RABBITMQ_HOST', 'localhost'),
        port: Number(this.nestConfigService.get('RABBITMQ_PORT', 5672)),
        durable:
          this.nestConfigService.get('RABBITMQ_DURABLE', true) === 'true',
        autoDelete:
          this.nestConfigService.get('RABBITMQ_AUTO_DELETE', false) === 'true',
      },
      firebase: {
        type: this.nestConfigService.get('FIREBASE_TYPE', 'service_account'),
        project_id: this.nestConfigService.get('FIREBASE_PROJECT_ID', ''),
        private_key_id: this.nestConfigService.get(
          'FIREBASE_PRIVATE_KEY_ID',
          '',
        ),
        private_key: this.nestConfigService.get('FIREBASE_PRIVATE_KEY', ''),
        client_email: this.nestConfigService.get('FIREBASE_CLIENT_EMAIL', ''),
        client_id: this.nestConfigService.get('FIREBASE_CLIENT_ID', ''),
        auth_uri: this.nestConfigService.get('FIREBASE_AUTH_URI', ''),
        token_uri: this.nestConfigService.get('FIREBASE_TOKEN_URI', ''),
        auth_provider_x509_cert_url: this.nestConfigService.get(
          'FIREBASE_AUTH_PROVIDER_X509_CERT_URL',
          '',
        ),
        universe_domain: this.nestConfigService.get(
          'FIREBASE_UNIVERSE_DOMAIN',
          '',
        ),
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
