import { Test, TestingModule } from '@nestjs/testing';
import { KitchenService } from './kitchen.service';
import { getModelToken } from '@nestjs/mongoose';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';

describe('KitchenService', () => {
  let service: KitchenService;

  const mockOrderModel = {
    findByIdAndUpdate: jest.fn(),
  };

  const mockRabbitmqService = {
    consume: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KitchenService,
        { provide: getModelToken('Order'), useValue: mockOrderModel },
        { provide: RabbitmqService, useValue: mockRabbitmqService },
      ],
    }).compile();

    service = module.get<KitchenService>(KitchenService);
  });

  it('should subscribe to queue on init', async () => {
    await service.onModuleInit();
    expect(mockRabbitmqService.consume).toHaveBeenCalledWith(
      'order.process',
      expect.any(Function),
    );
  });

  it('should process message and update order status', async () => {
    const mockMsg = {
      content: Buffer.from(JSON.stringify({ _id: 'abc123' })),
    };

    await (service as any).handleMessage(mockMsg);
    expect(mockOrderModel.findByIdAndUpdate).toHaveBeenCalledWith('abc123', {
      status: 'Processed',
    });
  });
});
