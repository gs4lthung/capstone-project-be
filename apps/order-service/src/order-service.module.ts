import { Module } from '@nestjs/common';
import { OrderServiceController } from './order-service.controller';
import { OrderServiceService } from './order-service.service';
import { ConfigModule } from '@app/config';
import { DatabaseModule } from '@app/database';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '@app/database/entities/order.entity';

@Module({
  imports: [ConfigModule, DatabaseModule, TypeOrmModule.forFeature([Order])],
  controllers: [OrderServiceController],
  providers: [OrderServiceService],
})
export class OrderServiceModule {}
