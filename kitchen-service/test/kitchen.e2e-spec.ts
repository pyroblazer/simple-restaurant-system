import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { KitchenModule } from '../src/kitchen/kitchen.module';
import { OrderSchema } from '../src/schemas/order.schema';
import { KitchenService } from '../src/kitchen/kitchen.service';
import { RabbitmqService } from '../src/rabbitmq/rabbitmq.service';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { INestApplication } from '@nestjs/common';

describe('KitchenService (E2E)', () => {
  let app: INestApplication;
  let mongo: MongoMemoryServer;
  let orderModel: any;
  let kitchenService: KitchenService;

  beforeAll(async () => {
    // MongoDB Memory Server
    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongoUri),
        MongooseModule.forFeature([{ name: 'Order', schema: OrderSchema }]),
        KitchenModule,
      ],
    })
      .overrideProvider(RabbitmqService)
      .useValue({ consume: jest.fn() })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    kitchenService = moduleFixture.get(KitchenService);
    orderModel = moduleFixture.get(getModelToken('Order'));
  }, 20000);

  afterAll(async () => {
    await app.close();
    await mongo.stop();
  });

  it('should process order and update status', async () => {
    const order = await orderModel.create({
      customerEmail: 'test@x.com',
      menuItems: ['Burger'],
      status: 'Pending',
    });

    const mockMessage = {
      content: Buffer.from(JSON.stringify({ _id: order._id })),
    };

    await (kitchenService as any).handleMessage(mockMessage);

    const updated = await orderModel.findById(order._id);
    expect(updated.status).toBe('Processed');
  });
});
