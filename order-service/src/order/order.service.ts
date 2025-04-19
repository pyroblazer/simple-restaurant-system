import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel('Order') private readonly orderModel: Model<any>,
    @InjectModel('Menu') private readonly menuModel: Model<any>,
    private readonly rabbit: RabbitmqService,
  ) {}

  async getMenu() {
    return this.menuModel.find().lean();
  }

  async placeOrder(data: { customerEmail: string; menuItems: string[] }) {
    const menuItems = await this.menuModel.find({
      name: { $in: data.menuItems },
    });
    if (menuItems.length !== data.menuItems.length) {
      throw new NotFoundException('One or more menu items not found');
    }

    const order = await this.orderModel.create({
      customerEmail: data.customerEmail,
      menuItems: data.menuItems,
      status: 'Pending',
    });

    await this.rabbit.publishOrder(order.toObject());

    return { orderId: order._id };
  }

  async getOrderStatus(id: string) {
    const order = await this.orderModel.findById(id).lean();
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}
