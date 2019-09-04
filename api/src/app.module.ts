import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VelocityModule } from './velocity/velocity.module';
import { RoadmapModule } from './roadmap/roadmap.module';
import { ConfigModule } from './config.module';

@Module({
  imports: [VelocityModule, RoadmapModule, ConfigModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
