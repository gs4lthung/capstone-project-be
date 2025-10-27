import { Module } from '@nestjs/common';
import { PayosService } from './payos.service';
import { ConfigModule } from '@app/config';
import { DatabaseModule } from '@app/database';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '@app/database/entities/payment.entity';

@Module({
  imports: [ConfigModule, DatabaseModule, TypeOrmModule.forFeature([Payment])],
  providers: [PayosService],
  exports: [PayosService],
})
export class PayosModule {}
