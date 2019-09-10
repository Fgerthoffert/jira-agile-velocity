import {
  Controller,
  Req,
  Get,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { VelocityService } from './velocity.service';

@Controller('velocity')
export class VelocityController {
  constructor(private velocityService: VelocityService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getVelocity(@Req() request: Request) {
    const velocity = await this.velocityService.getVelocity();
    return velocity;
  }
}
