import * as request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('OrderService (E2E)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let orderId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    const moduleFixture = await Test.createTestingModule({
      imports: [MongooseModule.forRoot(mongoUri), AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    const menuModel = moduleFixture.get(getModelToken('Menu'));
    await menuModel.insertMany([
      { name: 'Burger', price: 50 },
      { name: 'Pizza', price: 75 },
    ]);
  });

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  });

  it('GET /menu should return menu items', async () => {
    const res = await request(app.getHttpServer()).get('/menu').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /order should place an order', async () => {
    const res = await request(app.getHttpServer())
      .post('/order')
      .send({
        customerEmail: 'test@mailtrap.io',
        menuItems: ['Burger'],
      })
      .expect(201);

    expect(res.body).toHaveProperty('orderId');
    orderId = res.body.orderId;
    expect(orderId).toBeDefined();
  });

  it('GET /order/:id should return order status', async () => {
    const res = await request(app.getHttpServer())
      .get(`/order/${orderId}`)
      .expect(200);

    expect(res.body).toHaveProperty('status');
  });
});
