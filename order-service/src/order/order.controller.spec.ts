import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

describe('OrderController', () => {
  let controller: OrderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: {
            getMenu: jest
              .fn()
              .mockResolvedValue([{ name: 'Burger', price: 50 }]),
            placeOrder: jest.fn().mockResolvedValue({ orderId: 'order123' }),
            getOrderStatus: jest
              .fn()
              .mockResolvedValue({ _id: 'order123', status: 'Pending' }),
          },
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
  });

  it('should return menu', async () => {
    const menu = await controller.getMenu();
    expect(menu).toEqual([{ name: 'Burger', price: 50 }]);
  });

  it('should place an order', async () => {
    const dto = { customerEmail: 'user@test.com', menuItems: ['Burger'] };
    const result = await controller.placeOrder(dto);
    expect(result).toEqual({ orderId: 'order123' });
  });

  it('should return order status', async () => {
    const result = await controller.getOrder('order123');
    expect(result).toEqual({ _id: 'order123', status: 'Pending' });
  });
});
