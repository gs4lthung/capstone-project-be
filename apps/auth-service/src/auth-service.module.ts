import { Module } from '@nestjs/common';
import { AuthServiceController } from './auth-service.controller';
import { AuthServiceService } from './auth-service.service';
import { ConfigModule, ConfigService } from '@app/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@app/database/entities/user.entity';
import { DatabaseModule } from '@app/database';
import { Role } from '@app/database/entities/role.entity';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('jwt').secret,
        signOptions: { expiresIn: configService.get('jwt').expiration },
      }),
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([User, Role]),
  ],
  controllers: [AuthServiceController],
  providers: [AuthServiceService],
})
export class AuthServiceModule {}
