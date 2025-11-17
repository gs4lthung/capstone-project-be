import { Module } from '@nestjs/common';
import { BunnyService } from './bunny.service';
import { ConfigModule } from '@app/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ConfigModule, HttpModule],
  providers: [BunnyService],
  exports: [BunnyService],
})
export class BunnyModule {}
