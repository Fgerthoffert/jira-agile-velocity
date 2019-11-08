import { Test, TestingModule } from '@nestjs/testing';
import { InitiativesService } from './initiatives.service';

describe('InitiativesService', () => {
  let service: InitiativesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InitiativesService],
    }).compile();

    service = module.get<InitiativesService>(InitiativesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
