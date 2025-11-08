import { ConfigService } from '@app/config';
import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, ListBucketsCommand } from '@aws-sdk/client-s3';
import { FileUtils } from '@app/shared/utils/file.util';
import { UploadFileDto } from '@app/shared/dtos/files/file.dto';

@Injectable()
export class AwsService {
  private s3_client: S3Client;
  constructor(private readonly configService: ConfigService) {
    const awsConfig = this.configService.get('aws').s3;
    
    console.log('🔷 [AWS] Config loaded:');
    console.log('  - Bucket:', awsConfig.public_bucket);
    console.log('  - Region:', awsConfig.region);
    console.log('  - Access Key:', awsConfig.access_key_id ? `${awsConfig.access_key_id.substring(0, 8)}...` : 'MISSING');
    console.log('  - Secret Key:', awsConfig.secret_access_key ? 'EXISTS' : 'MISSING');
    
    this.s3_client = new S3Client({
      region: awsConfig.region,
      credentials: {
        accessKeyId: awsConfig.access_key_id,
        secretAccessKey: awsConfig.secret_access_key,
      },
      requestHandler: {
        requestTimeout: 30000, // 30 seconds timeout
        httpsAgent: undefined,
      },
      maxAttempts: 1, // Không retry để debug nhanh
    });
    
    console.log('🔷 [AWS] S3Client initialized successfully');
  }
  
  /**
   * TEST METHOD - Kiểm tra credentials có hoạt động không
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🔷 [AWS TEST] Testing S3 connection...');
      const command = new ListBucketsCommand({});
      const response = await this.s3_client.send(command);
      console.log('🔷 [AWS TEST] SUCCESS! Found', response.Buckets?.length || 0, 'buckets');
      return {
        success: true,
        message: `Connected! Found ${response.Buckets?.length || 0} buckets`,
      };
    } catch (error) {
      console.error('🔷 [AWS TEST] FAILED:');
      console.error('  - Error code:', error.Code || error.code || 'UNKNOWN');
      console.error('  - Error message:', error.message);
      console.error('  - Error name:', error.name);
      return {
        success: false,
        message: `Failed: ${error.message}`,
      };
    }
  }
  
  async uploadFileToPublicBucket(
    data: UploadFileDto,
  ): Promise<{ url: string; key: string }> {
    const bucketName = this.configService.get('aws').s3.public_bucket;
    const region = this.configService.get('aws').s3.region;
    
    console.log('🔷 [AWS] Upload details:');
    console.log('  - Bucket:', bucketName);
    console.log('  - Region:', region);
    console.log('  - File size:', data.file.size, 'bytes');
    console.log('  - File type:', data.file.mimetype);
    
    // Generate key: nếu có path thì dùng path, không thì generate từ filename
    let key: string;
    if (data.file.path) {
      // File từ disk storage (có path)
      key = data.file.path.replace(/\\/g, '/').replace('uploads/', '');
    } else {
      // File từ memory storage (không có path) → generate key từ filename + timestamp
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(7);
      const filename = data.file.originalname || data.file.filename || 'file';
      key = `uploads/${timestamp}-${randomStr}-${filename}`;
    }
    
    console.log('  - S3 Key:', key);
    console.log('🔷 [AWS] Sending PutObjectCommand to S3...');
    
    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: data.file.buffer,
        ContentType: data.file.mimetype,
        // ACL: 'public-read', // ← Tạm bỏ ACL để test
        ContentLength: data.file.size,
      });
      
      await this.s3_client.send(command);
      console.log('🔷 [AWS] PutObjectCommand completed successfully');
    } catch (error) {
      console.error('🔷 [AWS] PutObjectCommand FAILED:');
      console.error('  - Error code:', error.Code || error.code || 'UNKNOWN');
      console.error('  - Error message:', error.message);
      console.error('  - Error name:', error.name);
      throw error;
    }

    // Chỉ xóa file từ disk nếu có path
    if (data.file.path) {
      await FileUtils.deleteFile(data.file.path);
    }

    const url = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
    console.log('🔷 [AWS] Final URL:', url);
    
    return {
      url: url,
      key: key,
    };
  }
}
