import { Module } from '@nestjs/common';
import { UserServiceService } from './user-service.service';
import { DatabaseModule } from '@app/database';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@app/database/entities/user.entity';
import { ConfigModule } from '@app/config';
import { UserServiceController } from './user-service.controller';

@Module({
  imports: [ConfigModule, DatabaseModule, TypeOrmModule.forFeature([User])],
  controllers: [UserServiceController],
  providers: [UserServiceService],
})
export class UserServiceModule {}
