import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
  ) {}

  @Get()
  async getHello(): Promise<string> {
    await this.authService.connect();
    try {
      const response = await firstValueFrom(
        this.authService.send({ cmd: 'login' }, {}),
      );
      return response;
    } catch (error) {
      throw new Error(`Failed to call auth service: ${error}`);
    } finally {
      this.authService.close();
    }
  }
}
