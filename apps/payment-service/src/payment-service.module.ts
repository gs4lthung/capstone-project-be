import { Module } from '@nestjs/common';
import { PaymentServiceController } from './payment-service.controller';
import { PaymentServiceService } from './payment-service.service';
import { PayosModule } from '@app/payos';
import { DatabaseModule } from '@app/database';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '@app/database/entities/order.entity';

@Module({
  imports: [PayosModule, DatabaseModule, TypeOrmModule.forFeature([Order])],
  controllers: [PaymentServiceController],
  providers: [PaymentServiceService],
})
export class PaymentServiceModule {}
