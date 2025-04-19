import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('NotificationService', () => {
  let service: NotificationService;

  const mockRabbit = {
    consume: jest.fn(),
  };

  const sendMailMock = jest
    .fn()
    .mockResolvedValue({ messageId: 'mocked-message-id' });

  beforeEach(async () => {
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMailMock,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: RabbitmqService, useValue: mockRabbit },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should subscribe to the queue on init', async () => {
    await service.onModuleInit();
    expect(mockRabbit.consume).toHaveBeenCalledWith(
      'order.confirmation',
      expect.any(Function),
    );
  });

  it('should send an email on message received', async () => {
    const mockOrder = {
      _id: 'order123',
      customerEmail: 'customer@example.com',
      menuItems: ['Burger'],
      status: 'Pending',
    };

    const mockMsg = {
      content: Buffer.from(JSON.stringify(mockOrder)),
    };

    await (service as any).handleMessage(mockMsg);

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: mockOrder.customerEmail,
        subject: expect.stringContaining('Order Confirmation'),
        text: expect.stringContaining(mockOrder._id),
      }),
    );
  });
});
