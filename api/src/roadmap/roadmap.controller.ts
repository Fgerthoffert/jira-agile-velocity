import {
  Controller,
  Req,
  Get,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { RoadmapService } from './roadmap.service';

@Controller('roadmap')
export class RoadmapController {
  constructor(private roadmapService: RoadmapService) {}

  @Get()
  async getRoadmap(@Req() request: Request) {
    const roadmap = await this.roadmapService.getRoadmap();
    return roadmap;
  }
}
