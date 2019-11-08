import { Controller, Get, Param } from '@nestjs/common';
import { VelocityService } from './velocity.service';

@Controller('velocity')
export class VelocityController {
  constructor(private velocityService: VelocityService) {}

  @Get(':teamId')
  async getVelocity(@Param() params) {
    const velocity = await this.velocityService.getVelocity(params.teamId);
    return velocity;
  }
}
