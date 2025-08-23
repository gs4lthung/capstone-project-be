import { Order } from '@app/database/entities/order.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class OrderServiceService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}
  async findAll(): Promise<Order[]> {
    return this.orderRepository.find();
  }

  async findOne(id: number): Promise<Order> {
    return this.orderRepository.findOne({ where: { id } });
  }

  async findByUser(userId: number): Promise<Order[]> {
    return this.orderRepository.find({ where: { user: { id: userId } } });
  }
}
