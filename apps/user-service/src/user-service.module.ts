import { Module } from '@nestjs/common';
import { UserServiceService } from './user-service.service';
import { DatabaseModule } from '@app/database';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@app/database/entities/user.entity';
import { ConfigModule } from '@app/config';
import { UserServiceController } from './user-service.controller';
import { CloudinaryModule } from '@app/cloudinary';
import { Role } from '@app/database/entities/role.entity';

@Module({
  imports: [
    ConfigModule,
    CloudinaryModule,
    DatabaseModule,
    TypeOrmModule.forFeature([User, Role]),
  ],
  controllers: [UserServiceController],
  providers: [UserServiceService],
})
export class UserServiceModule {}
