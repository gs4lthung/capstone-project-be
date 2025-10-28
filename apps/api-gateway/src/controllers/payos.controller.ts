import { PayosService } from '@app/payos';
import { Body, Controller, Post } from '@nestjs/common';

@Controller('payos')
export class PayosController {
  constructor(private readonly payosService: PayosService) {}

  @Post('confirm-webhook')
  async confirmWebhook(@Body('webhookUrl') url: string) {
    return this.payosService.confirmWebhook(url);
  }
}
