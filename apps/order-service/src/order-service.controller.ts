import { Controller } from '@nestjs/common';
import { OrderServiceService } from './order-service.service';
import { MessagePattern } from '@nestjs/microservices';
import { Order } from '@app/database/entities/order.entity';
import { OrderMsgPattern } from '@app/shared/msg_patterns/order.msg_pattern';

@Controller()
export class OrderServiceController {
  constructor(private readonly orderServiceService: OrderServiceService) {}

  @MessagePattern({ cmd: OrderMsgPattern.FIND_USER_ORDERS })
  async findByUser(data: { userId: number }): Promise<Order[]> {
    return this.orderServiceService.findByUser(data.userId);
  }
}
