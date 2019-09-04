import { Test, TestingModule } from '@nestjs/testing';
import { RoadmapController } from './roadmap.controller';

describe('Roadmap Controller', () => {
  let controller: RoadmapController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoadmapController],
    }).compile();

    controller = module.get<RoadmapController>(RoadmapController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
