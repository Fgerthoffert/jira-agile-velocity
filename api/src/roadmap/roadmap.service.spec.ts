import { Test, TestingModule } from '@nestjs/testing';
import { RoadmapService } from './roadmap.service';

describe('RoadmapService', () => {
  let service: RoadmapService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoadmapService],
    }).compile();

    service = module.get<RoadmapService>(RoadmapService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
