import { Test, TestingModule } from '@nestjs/testing';
import { InitiativesController } from './initiatives.controller';

describe('Initiatives Controller', () => {
  let controller: InitiativesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InitiativesController],
    }).compile();

    controller = module.get<InitiativesController>(InitiativesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
