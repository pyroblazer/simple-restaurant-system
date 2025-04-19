import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderSchema } from './schemas/order.schema';
import { MenuSchema } from './schemas/menu.schema';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Order', schema: OrderSchema },
      { name: 'Menu', schema: MenuSchema },
    ]),
    RabbitmqModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
