import { Controller, Get } from '@nestjs/common';
import { InitiativesService } from './initiatives.service';

@Controller('initiatives')
export class InitiativesController {
  constructor(private initiativesService: InitiativesService) {}

  @Get()
  async getInitiatives() {
    const initiatives = await this.initiativesService.getInitiatives();
    return initiatives;
  }
}
