import { Module } from '@nestjs/common';
import { AgoraService } from './agora.service';
import { ConfigModule } from '@app/config';

@Module({
  imports: [ConfigModule],
  providers: [AgoraService],
  exports: [AgoraService],
})
export class AgoraModule {}
