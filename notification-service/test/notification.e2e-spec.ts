import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from '../src/notification/notification.service';
import { RabbitmqService } from '../src/rabbitmq/rabbitmq.service';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('NotificationService (E2E)', () => {
  let service: NotificationService;
  const sendMailMock = jest.fn().mockResolvedValue({ messageId: '123' });

  beforeEach(async () => {
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMailMock,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: RabbitmqService, useValue: { consume: jest.fn() } },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should send email for received order', async () => {
    const mockOrder = {
      _id: 'order123',
      customerEmail: 'test@mailtrap.io',
      menuItems: ['Burger'],
    };

    const mockMsg = {
      content: Buffer.from(JSON.stringify(mockOrder)),
    };

    await (service as any).handleMessage(mockMsg);

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: mockOrder.customerEmail,
        subject: expect.stringMatching(/Order Confirmation/i),
        text: expect.stringContaining(mockOrder._id),
      }),
    );
  });
});
