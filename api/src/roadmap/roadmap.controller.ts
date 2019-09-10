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
import { RoadmapService } from './roadmap.service';

@Controller('roadmap')
export class RoadmapController {
  constructor(private roadmapService: RoadmapService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getRoadmap(@Req() request: Request) {
    const roadmap = await this.roadmapService.getRoadmap();
    return roadmap;
  }
}
