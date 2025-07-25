import { CustomRcpException } from '@app/shared/exceptions/custom-rcp.exception';
import {
  ArgumentMetadata,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const maxSize = 25 * 1024 * 1024; // 25 MB in bytes

    if (value && value.size > maxSize) {
      throw new CustomRcpException(
        `File size exceeds the maximum limit of ${maxSize} bytes`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return value.size < maxSize;
  }
}
