import { Controller } from '@nestjs/common';
import { OrderServiceService } from './order-service.service';
import { MessagePattern } from '@nestjs/microservices';
import { Order } from '@app/database/entities/order.entity';

@Controller()
export class OrderServiceController {
  constructor(private readonly orderServiceService: OrderServiceService) {}

  @MessagePattern({ cmd: 'find_user_orders' })
  async findByUser(data: { userId: number }): Promise<Order[]> {
    return this.orderServiceService.findByUser(data.userId);
  }
}
