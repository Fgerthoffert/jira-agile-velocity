import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VelocityModule } from './velocity/velocity.module';
import { RoadmapModule } from './roadmap/roadmap.module';

@Module({
  imports: [VelocityModule, RoadmapModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
