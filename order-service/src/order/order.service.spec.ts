import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { getModelToken } from '@nestjs/mongoose';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';

describe('OrderService', () => {
  let service: OrderService;

  const mockOrderModel = {
    create: jest.fn().mockImplementation((dto) => ({
      _id: 'order123',
      ...dto,
      toObject: () => ({ _id: 'order123', ...dto }),
    })),
    findById: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue({ _id: 'order123', status: 'Pending' }),
    }),
  };

  const mockMenuModel = {
    find: jest.fn().mockImplementation((query?: any) => {
      if (!query) {
        return {
          lean: jest.fn().mockResolvedValue([
            { name: 'Burger', price: 50 },
            { name: 'Pizza', price: 75 },
          ]),
        };
      }

      const requested = query.name?.$in || [];
      return Promise.resolve(
        requested.map((item) => ({ name: item, price: 50 })),
      );
    }),
  };

  const mockRabbitmq = {
    publishOrder: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: getModelToken('Order'), useValue: mockOrderModel },
        { provide: getModelToken('Menu'), useValue: mockMenuModel },
        { provide: RabbitmqService, useValue: mockRabbitmq },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  it('should fetch menu', async () => {
    const result = await service.getMenu();
    expect(result).toEqual([
      { name: 'Burger', price: 50 },
      { name: 'Pizza', price: 75 },
    ]);
  });

  it('should place an order and publish it', async () => {
    const dto = {
      customerEmail: 'user@test.com',
      menuItems: ['Burger', 'Pizza'],
    };
    const result = await service.placeOrder(dto);
    expect(result).toEqual({ orderId: 'order123' });
    expect(mockRabbitmq.publishOrder).toHaveBeenCalled();
  });

  it('should return order status', async () => {
    const result = await service.getOrderStatus('order123');
    expect(result).toHaveProperty('status');
  });
});
