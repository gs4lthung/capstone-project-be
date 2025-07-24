import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@app/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Error } from './entities/error.entity';
import { Role } from './entities/role.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database').host,
        port: configService.get('database').port,
        username: configService.get('database').username,
        password: configService.get('database').password,
        database: configService.get('database').database,
        entities: [User, Role, Error],
        logging: configService.get('node_env') === 'dev',
        autoLoadEntities: true,
        synchronize: configService.get('node_env') === 'dev',
        migrationsRun: configService.get('node_env') === 'dev',
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
