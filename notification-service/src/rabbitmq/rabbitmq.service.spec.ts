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

  it('should connect and consume from the queue', async () => {
    await service.consume('order.confirmation', jest.fn());
    expect(amqp.connect).toHaveBeenCalled();
    expect(mockChannel.assertExchange).toHaveBeenCalled();
    expect(mockChannel.assertQueue).toHaveBeenCalled();
    expect(mockChannel.bindQueue).toHaveBeenCalled();
    expect(mockChannel.consume).toHaveBeenCalled();
  });

  it('should cleanly close on destroy', async () => {
    await service.onModuleDestroy();
    expect(mockChannel.close).toHaveBeenCalled();
    expect(mockConnection.close).toHaveBeenCalled();
  });
});
