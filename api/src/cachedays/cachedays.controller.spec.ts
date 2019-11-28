import { Test, TestingModule } from '@nestjs/testing';
import { CachedaysController } from './cachedays.controller';

describe('Cachedays Controller', () => {
  let controller: CachedaysController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CachedaysController],
    }).compile();

    controller = module.get<CachedaysController>(CachedaysController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
