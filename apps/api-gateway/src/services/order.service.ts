import { Order } from '@app/database/entities/order.entity';
import { OrderMsgPattern } from '@app/shared/msg_patterns/order.msg_pattern';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @Inject('ORDER_SERVICE') private readonly orderServiceClient: ClientProxy,
  ) {}
  async findUserOrders(userId: number): Promise<Order[]> {
    const pattern = { cmd: OrderMsgPattern.FIND_USER_ORDERS };
    const payload = { userId };

    const response = await lastValueFrom(
      this.orderServiceClient.send<Order[]>(pattern, payload),
    );
    return response;
  }
}
