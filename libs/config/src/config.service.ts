import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

export interface Config {
  node_env: 'dev' | 'prod' | 'test';
  app: {
    name: string;
    version: string;
    url: string;
  };
  front_end?: {
    url?: string;
    verify_email_url?: string;
  };
  api_gateway: TcpServiceConfig;
  auth_service: TcpServiceConfig;
  user_service: TcpServiceConfig;
  order_service: TcpServiceConfig;
  chat_service: TcpServiceConfig;
  coach_service: TcpServiceConfig;
  learner_service?: TcpServiceConfig;
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
  jwt: {
    access_token: {
      secret: string;
      expiration: string;
    };
    refresh_token: {
      secret: string;
      expiration: string;
    };
    verify_email_token: {
      secret: string;
      expiration: string;
    };
    reset_password_token: {
      secret: string;
      expiration: string;
    };
  };
  rate_limiter?: {
    max_requests?: number;
    time?: number;
  };
  password_salt_rounds?: number;
  mail?: {
    host?: string;
    port?: number;
    user?: string;
    pass?: string;
    secure?: boolean;
  };
  google?: {
    oauth?: {
      clientId?: string;
      clientSecret?: string;
    };
  };
  payos: {
    client_id?: string;
    api_key?: string;
    checksum_key?: string;
    url?: string;
    return_url?: string;
    cancel_url?: string;
  };
  aws: {
    s3: {
      public_bucket: string;
      region: string;
      access_key_id: string;
      secret_access_key: string;
    };
  };
  twilio: {
    accountSid: string;
    authToken: string;
  };
  agora?: {
    appId?: string;
    appCertificate?: string;
  };
}

export interface TcpServiceConfig {
  host: string;
  port: number;
}

@Injectable()
export class ConfigService {
  private readonly config: Config;
  constructor(private nestConfigService: NestConfigService) {
    this.config = {
      app: {
        name: this.nestConfigService.get('APP_NAME', 'Capstone Project'),
        version: this.nestConfigService.get('APP_VERSION', 'v1'),
        url: this.nestConfigService.get('APP_URL', 'http://localhost:8386'),
      },
      front_end: {
        url: this.nestConfigService.get(
          'FRONT_END_URL',
          'http://localhost:3000',
        ),
        verify_email_url: this.nestConfigService.get(
          'FRONT_END_VERIFY_EMAIL_URL',
          'http://localhost:3000/verify-email',
        ),
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
      order_service: {
        host: this.nestConfigService.get('ORDER_SERVICE_HOST', 'localhost'),
        port: this.nestConfigService.get('ORDER_SERVICE_PORT', 8389),
      },
      chat_service: {
        host: this.nestConfigService.get('CHAT_SERVICE_HOST', 'localhost'),
        port: this.nestConfigService.get('CHAT_SERVICE_PORT', 8390),
      },
      coach_service: {
        host: this.nestConfigService.get('COACH_SERVICE_HOST', 'localhost'),
        port: this.nestConfigService.get('COACH_SERVICE_PORT', 8391),
      },
      learner_service: {
        host: this.nestConfigService.get('LEARNER_SERVICE_HOST', 'localhost'),
        port: this.nestConfigService.get('LEARNER_SERVICE_PORT', 8392),
      },
      database: {
        host: this.nestConfigService.get('DB_HOST', 'localhost'),
        port: this.nestConfigService.get('DB_PORT', 5432),
        username: this.nestConfigService.get('DB_USERNAME', 'postgres'),
        password: this.nestConfigService.get('DB_PASSWORD', '12345'),
        database: this.nestConfigService.get('DB_NAME', 'mydatabase'),
      },
      jwt: {
        access_token: {
          secret: this.nestConfigService.get('JWT_ACCESS_TOKEN_SECRET', 'cc'),
          expiration: this.nestConfigService.get(
            'JWT_ACCESS_TOKEN_EXPIRATION',
            '15m',
          ),
        },
        refresh_token: {
          secret: this.nestConfigService.get('JWT_REFRESH_TOKEN_SECRET', 'cc'),
          expiration: this.nestConfigService.get(
            'JWT_REFRESH_TOKEN_EXPIRATION',
            '7d',
          ),
        },
        verify_email_token: {
          secret: this.nestConfigService.get(
            'JWT_VERIFY_EMAIL_TOKEN_SECRET',
            'cc',
          ),
          expiration: this.nestConfigService.get(
            'JWT_VERIFY_EMAIL_TOKEN_EXPIRATION',
            '15m',
          ),
        },
        reset_password_token: {
          secret: this.nestConfigService.get(
            'JWT_RESET_PASSWORD_TOKEN_SECRET',
            'cc',
          ),
          expiration: this.nestConfigService.get(
            'JWT_RESET_PASSWORD_TOKEN_EXPIRATION',
            '1h',
          ),
        },
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
      mail: {
        host: this.nestConfigService.get('MAIL_HOST', 'smtp.gmail.com'),
        port: Number(this.nestConfigService.get('MAIL_PORT', 587)),
        user: this.nestConfigService.get('MAIL_USER', 'mail@gmail.com'),
        pass: this.nestConfigService.get(
          'MAIL_PASSWORD',
          'xxxx xxxx xxxx xxxx',
        ),
        secure: this.nestConfigService.get('MAIL_SECURE', false) === 'true',
      },
      google: {
        oauth: {
          clientId: this.nestConfigService.get(
            'GOOGLE_OAUTH_CLIENT_ID',
            'default-client-id',
          ),
          clientSecret: this.nestConfigService.get(
            'GOOGLE_OAUTH_CLIENT_SECRET',
            'default-client-secret',
          ),
        },
      },
      payos: {
        client_id: this.nestConfigService.get('PAYOS_CLIENT_ID', ''),
        api_key: this.nestConfigService.get('PAYOS_API_KEY', ''),
        checksum_key: this.nestConfigService.get('PAYOS_CHECKSUM_KEY', ''),
        url: this.nestConfigService.get(
          'PAYOS_URL',
          'https://api-merchant.payos.vn',
        ),
        return_url: this.nestConfigService.get('PAYOS_RETURN_URL', ''),
        cancel_url: this.nestConfigService.get('PAYOS_CANCEL_URL', ''),
      },
      aws: {
        s3: {
          public_bucket: this.nestConfigService.get('AWS_S3_PUBLIC_BUCKET', ''),
          region: this.nestConfigService.get('AWS_S3_REGION', ''),
          access_key_id: this.nestConfigService.get('AWS_S3_ACCESS_KEY_ID', ''),
          secret_access_key: this.nestConfigService.get(
            'AWS_S3_SECRET_ACCESS_KEY',
            '',
          ),
        },
      },
      twilio: {
        accountSid: this.nestConfigService.get('TWILIO_ACCOUNT_SID', ''),
        authToken: this.nestConfigService.get('TWILIO_AUTH_TOKEN', ''),
      },
      agora: {
        appId: this.nestConfigService.get('AGORA_APP_ID', ''),
        appCertificate: this.nestConfigService.get('AGORA_APP_CERTIFICATE', ''),
      },
    };
  }

  get<T extends keyof Config>(key: T): Config[T] {
    return this.config[key];
  }

  getAll(): Config {
    return this.config;
  }

  getByServiceName(serviceName: string): TcpServiceConfig | undefined {
    return this.config[serviceName] as TcpServiceConfig;
  }
}
