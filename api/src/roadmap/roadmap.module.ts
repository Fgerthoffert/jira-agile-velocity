import { Module } from '@nestjs/common';
import { RoadmapController } from './roadmap.controller';
import { RoadmapService } from './roadmap.service';

@Module({
  controllers: [RoadmapController],
  providers: [RoadmapService],
})
export class RoadmapModule {}
