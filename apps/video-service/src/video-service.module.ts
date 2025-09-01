import { Module } from '@nestjs/common';
import { VideoServiceController } from './video-service.controller';
import { VideoServiceService } from './video-service.service';
import { FfmpegModule } from '@app/ffmpeg';
import { DatabaseModule } from '@app/database';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from '@app/database/entities/video.entity';
import { CloudinaryModule } from '@app/cloudinary';

@Module({
  imports: [
    FfmpegModule,
    CloudinaryModule,
    DatabaseModule,
    TypeOrmModule.forFeature([Video]),
  ],
  controllers: [VideoServiceController],
  providers: [VideoServiceService],
})
export class VideoServiceModule {}
