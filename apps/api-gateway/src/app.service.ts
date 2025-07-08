import { ConfigService } from '@app/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}
  getHello(): string {
    return `Hello World! API Gateway is running on port ${this.configService.get('port').api_gateway}`;
  }
}
