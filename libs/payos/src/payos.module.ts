import { Module } from '@nestjs/common';
import { PayosService } from './payos.service';
import { ConfigModule } from '@app/config';
import { DatabaseModule } from '@app/database';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '@app/database/entities/order.entity';

@Module({
  imports: [ConfigModule, DatabaseModule, TypeOrmModule.forFeature([Order])],
  providers: [PayosService],
  exports: [PayosService],
})
export class PayosModule {}
