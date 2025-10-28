import { Controller } from '@nestjs/common';
import { RequestService } from '../services/request.service';

@Controller('requests')
export class RequestController {
  constructor(private readonly requestService: RequestService) {}
}
