import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitmqService implements OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  async consume(queue: string, onMessage: (msg: amqp.ConsumeMessage) => void) {
    this.connection = await amqp.connect(process.env.RABBITMQ_URL);
    this.channel = await this.connection.createChannel();

    await this.channel.assertExchange('order_exchange', 'fanout', {
      durable: true,
    });
    await this.channel.assertQueue(queue, { durable: true });
    await this.channel.bindQueue(queue, 'order_exchange', '');

    await this.channel.consume(queue, (msg) => {
      if (msg) {
        onMessage(msg);
        this.channel.ack(msg);
      }
    });
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }
}
