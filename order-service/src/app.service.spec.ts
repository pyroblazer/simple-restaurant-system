import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(() => {
    service = new AppService();
  });

  it('should return status string', () => {
    expect(service.getStatus()).toBe('OrderService OK');
  });
});
