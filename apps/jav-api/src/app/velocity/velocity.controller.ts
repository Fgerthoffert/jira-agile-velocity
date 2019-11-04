import { Controller, Req, Get, Param } from '@nestjs/common';
import { Request } from 'express';
import { VelocityService } from './velocity.service';

@Controller('velocity')
export class VelocityController {
  constructor(private velocityService: VelocityService) {}

  @Get(':teamId')
  async getVelocity(@Param() params, @Req() request: Request) {
    const velocity: any = await this.velocityService.getVelocity(params.teamId);
    return velocity;
  }
}
