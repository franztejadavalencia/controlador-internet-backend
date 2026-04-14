import { Test, TestingModule } from '@nestjs/testing';
import { LeaseWatcherService } from './lease-watcher.service';

describe('LeaseWatcherService', () => {
  let service: LeaseWatcherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LeaseWatcherService],
    }).compile();

    service = module.get<LeaseWatcherService>(LeaseWatcherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
