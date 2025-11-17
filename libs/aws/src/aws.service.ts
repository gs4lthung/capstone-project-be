import { ConfigService } from '@app/config';
import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { FileUtils } from '@app/shared/utils/file.util';
import { UploadFileDto } from '@app/shared/dtos/files/file.dto';
import * as fs from 'fs';

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
    
    // Generate unique key từ originalname hoặc path
    let key: string;
    if (data.file.path) {
      // Nếu có path (từ disk storage)
      key = data.file.path.replace(/\\/g, '/').replace('uploads/', '');
    } else {
      // Nếu không có path (từ memory storage / multipart upload)
      // Generate key với format: folder/timestamp-originalname
      const timestamp = Date.now();
      const sanitizedFilename = data.file.originalname
        .replace(/[^a-zA-Z0-9.]/g, '-') // Replace special chars với -
        .toLowerCase();
      key = `achievements/${timestamp}-${sanitizedFilename}`;
    }
    
    // Lấy buffer: ưu tiên từ memory, nếu không có thì đọc từ disk
    let fileBuffer: Buffer;
    if (data.file.buffer && data.file.buffer.length > 0) {
      fileBuffer = data.file.buffer;
    } else if (data.file.path) {
      // Đọc file từ disk nếu buffer rỗng
      fileBuffer = await fs.promises.readFile(data.file.path);
    } else {
      throw new Error('No file buffer or path available for upload');
    }
    
    await this.s3_client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: data.file.mimetype,
        ACL: 'public-read',
        ContentLength: fileBuffer.length,
      }),
    );

    // Chỉ delete file nếu có path (file trên disk)
    if (data.file.path) {
      await FileUtils.deleteFile(data.file.path);
    }

    return {
      url: `https://${bucketName}.s3.${this.configService.get('aws').s3.region}.amazonaws.com/${key}`,
      key: key,
    };
  }
}
