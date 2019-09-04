import { Test, TestingModule } from '@nestjs/testing';
import { VelocityController } from './velocity.controller';

describe('Velocity Controller', () => {
  let controller: VelocityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VelocityController],
    }).compile();

    controller = module.get<VelocityController>(VelocityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
