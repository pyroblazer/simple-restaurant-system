import { RabbitmqService } from './rabbitmq.service';
import * as amqp from 'amqplib';

describe('RabbitmqService', () => {
  let service: RabbitmqService;

  const mockChannel = {
    assertExchange: jest.fn(),
    assertQueue: jest.fn(),
    bindQueue: jest.fn(),
    consume: jest.fn(),
    ack: jest.fn(),
    close: jest.fn(),
  };

  const mockConnection = {
    createChannel: jest.fn().mockResolvedValue(mockChannel),
    close: jest.fn(),
  };

  beforeEach(() => {
    jest.spyOn(amqp, 'connect').mockResolvedValue(mockConnection as any);
    service = new RabbitmqService();
  });

  afterEach(async () => {
    await service.onModuleDestroy();
  });

  it('should connect and consume messages', async () => {
    const queue = 'order.process';
    const onMessage = jest.fn();

    await service.consume(queue, onMessage);

    expect(amqp.connect).toHaveBeenCalled();
    expect(mockChannel.assertExchange).toHaveBeenCalledWith(
      'order_exchange',
      'fanout',
      { durable: true },
    );
    expect(mockChannel.assertQueue).toHaveBeenCalledWith(queue, {
      durable: true,
    });
    expect(mockChannel.bindQueue).toHaveBeenCalledWith(
      queue,
      'order_exchange',
      '',
    );
    expect(mockChannel.consume).toHaveBeenCalledWith(
      queue,
      expect.any(Function),
    );
  });

  it('should close connection on destroy', async () => {
    await service.onModuleDestroy();
    expect(mockChannel.close).toHaveBeenCalled();
    expect(mockConnection.close).toHaveBeenCalled();
  });
});
