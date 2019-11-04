import { Controller, Req, Get } from '@nestjs/common';
import { Request } from 'express';
import { InitiativesService } from './initiatives.service';

@Controller('initiatives')
export class InitiativesController {
  constructor(private initiativesService: InitiativesService) {}

  @Get()
  async getInitiatives(@Req() request: Request) {
    const initiatives = await this.initiativesService.getInitiatives();
    return initiatives;
  }
}
