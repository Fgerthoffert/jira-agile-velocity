import {
  Controller,
  Req,
  Get,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { VelocityService } from './velocity.service';

@Controller('velocity')
export class VelocityController {
  constructor(private velocityService: VelocityService) {}

  @Get()
  async getVelocity(@Req() request: Request) {
    const velocity = await this.velocityService.getVelocity();
    return velocity;
  }
}
