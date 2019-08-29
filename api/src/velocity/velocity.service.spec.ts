import { Test, TestingModule } from '@nestjs/testing';
import { VelocityService } from './velocity.service';

describe('VelocityService', () => {
  let service: VelocityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VelocityService],
    }).compile();

    service = module.get<VelocityService>(VelocityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
