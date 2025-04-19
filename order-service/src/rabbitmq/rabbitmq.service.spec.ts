import { RabbitmqService } from './rabbitmq.service';
import * as amqp from 'amqplib';

describe('RabbitmqService', () => {
  let service: RabbitmqService;

  const fakeChannel = {
    assertExchange: jest.fn(),
    publish: jest.fn(),
    close: jest.fn(),
  };

  const fakeConnection = {
    createChannel: jest.fn().mockResolvedValue(fakeChannel),
    close: jest.fn(),
  };

  beforeEach(() => {
    service = new RabbitmqService();
    jest.spyOn(amqp, 'connect').mockResolvedValue(fakeConnection as any);
  });

  afterEach(async () => {
    await service.onModuleDestroy();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should publish order (mocked connection)', async () => {
    await service.publishOrder({
      _id: 'order123',
      customerEmail: 'user@test.com',
    });

    expect(fakeChannel.assertExchange).toHaveBeenCalled();
    expect(fakeChannel.publish).toHaveBeenCalled();
  });
});
