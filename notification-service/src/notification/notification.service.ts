import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly rabbit: RabbitmqService) {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async onModuleInit() {
    await this.rabbit.consume('order.confirmation', (msg) => {
      void this.handleMessage(msg);
    });
  }

  private async handleMessage(msg: any): Promise<void> {
    const order = JSON.parse(String(msg.content));

    const message = {
      from: '"Restaurant" <noreply@restaurant.com>',
      to: order.customerEmail,
      subject: 'Order Confirmation',
      text: `Hello! Your order with ID ${order._id} has been placed.`,
      html: `<p>Hello!</p><p>Your order with ID <strong>${order._id}</strong> has been placed.</p>`,
    };

    try {
      const info = await this.transporter.sendMail(message);
      this.logger.log(
        `Email sent to ${order.customerEmail}: ${info.messageId}`,
      );
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
    }
  }
}
