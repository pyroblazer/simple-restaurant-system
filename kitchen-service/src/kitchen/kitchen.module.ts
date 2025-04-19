import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KitchenService } from './kitchen.service';
import { OrderSchema } from '../schemas/order.schema';
import { InventorySchema } from '../schemas/inventory.schema';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Order', schema: OrderSchema },
      { name: 'Inventory', schema: InventorySchema },
    ]),
    RabbitmqModule,
  ],
  providers: [KitchenService, RabbitmqService],
})
export class KitchenModule {}
