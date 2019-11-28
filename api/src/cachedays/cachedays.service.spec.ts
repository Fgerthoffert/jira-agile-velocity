import { Test, TestingModule } from '@nestjs/testing';
import { CachedaysService } from './cachedays.service';

describe('CachedaysService', () => {
  let service: CachedaysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CachedaysService],
    }).compile();

    service = module.get<CachedaysService>(CachedaysService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
