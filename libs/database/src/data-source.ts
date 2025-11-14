import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

config();

const isDev = process.env.NODE_ENV === 'dev';

const entitiesPath = isDev
  ? path.resolve(__dirname, 'entities/*.entity{.ts,.js}')
  : path.resolve(__dirname, 'entities/*.entity{.ts,.js}');

const migrationsPath = isDev
  ? path.resolve(__dirname, 'migrations/*{.ts,.js}')
  : path.resolve(__dirname, 'migrations/*{.ts,.js}');

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [entitiesPath],
  migrations: [migrationsPath],
  ssl: isDev ? { rejectUnauthorized: false } : false,
  logging: isDev,
});
