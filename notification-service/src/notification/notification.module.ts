import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitmqModule],
  providers: [NotificationService],
})
export class NotificationModule {}
