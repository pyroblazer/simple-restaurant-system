import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitmqService implements OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  async publishOrder(order: any) {
    if (!this.channel) {
      this.connection = await amqp.connect(process.env.RABBITMQ_URL);
      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange('order_exchange', 'fanout', {
        durable: true,
      });
    }
    this.channel.publish(
      'order_exchange',
      '',
      Buffer.from(JSON.stringify(order)),
    );
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }
}
