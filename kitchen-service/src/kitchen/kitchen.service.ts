import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class KitchenService implements OnModuleInit {
  constructor(
    @InjectModel('Order') private readonly orderModel: Model<any>,
    private readonly rabbit: RabbitmqService,
  ) {}

  async onModuleInit() {
    await this.rabbit.consume('order.process', (msg) => {
      void this.handleMessage(msg);
    });
  }

  private async handleMessage(msg: any): Promise<void> {
    const order = JSON.parse(String(msg.content));
    await this.orderModel.findByIdAndUpdate(order._id, { status: 'Processed' });
  }
}
