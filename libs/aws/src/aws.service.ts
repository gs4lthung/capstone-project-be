import { ConfigService } from '@app/config';
import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { FileUtils } from '@app/shared/utils/file.util';
import { UploadFileDto } from '@app/shared/dtos/files/file.dto';

@Injectable()
export class AwsService {
  private s3_client: S3Client;
  constructor(private readonly configService: ConfigService) {
    this.s3_client = new S3Client({
      region: this.configService.get('aws').s3.region,
      credentials: {
        accessKeyId: this.configService.get('aws').s3.access_key_id,
        secretAccessKey: this.configService.get('aws').s3.secret_access_key,
      },
    });
  }
  async uploadFileToPublicBucket(
    data: UploadFileDto,
  ): Promise<{ url: string; key: string }> {
    const bucketName = this.configService.get('aws').s3.public_bucket;
    const key = data.file.path.replace(/\\/g, '/').replace('uploads/', '');
    await this.s3_client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: data.file.buffer,
        ContentType: data.file.mimetype,
        ACL: 'public-read',
        ContentLength: data.file.size,
      }),
    );

    FileUtils.deleteFile(data.file.path);

    return {
      url: `https://${bucketName}.s3.${this.configService.get('aws').s3.region}.amazonaws.com/${key}`,
      key: key,
    };
  }
}
