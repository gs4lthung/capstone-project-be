import { ConfigService } from '@app/config';
import { FileUtils } from '@app/shared/utils/file.util';
import { HttpService } from '@nestjs/axios';
import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class BunnyService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async uploadToStorage({
    id,
    type,
    filePath,
  }: {
    id: number;
    filePath: string;
    type: 'credential_image' | 'avatar' | 'video' | 'video_thumbnail' | 'icon';
  }): Promise<string> {
    const fileStream = fs.createReadStream(filePath);
    const fileName = await FileUtils.extractFilenameFromPath(filePath);

    const url = `https://${this.configService.get('bunny').storage.host_name}/${this.configService.get('bunny').storage.zone_name}/${type}/${id}/${fileName}`;
    const res = await this.httpService
      .put(url, fileStream, {
        headers: {
          AccessKey: this.configService.get('bunny').storage.password,
          'Content-Type': 'application/octet-stream',
        },
        maxBodyLength: Infinity,
      })
      .toPromise();

    await FileUtils.deleteFile(filePath);
    if (res.status === HttpStatus.CREATED) {
      return `https://${this.configService.get('bunny').domain_storage_zone}/${type}/${id}/${fileName}`;
    } else {
      throw new InternalServerErrorException(
        'Failed to upload video to Bunny Storage',
      );
    }
  }
}
