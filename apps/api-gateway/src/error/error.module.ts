import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Error } from '@app/database/entities/error.entity';
import { ErrorLoggingFilter } from './error.filter';
import { ConfigModule } from '@app/config';
import { APP_FILTER } from '@nestjs/core';
import { User } from '@app/database/entities/user.entity';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Error, User])],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ErrorLoggingFilter,
    },
  ],
})
export class ErrorModule {}
