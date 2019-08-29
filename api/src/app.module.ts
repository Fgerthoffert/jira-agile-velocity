import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VelocityModule } from './velocity/velocity.module';

@Module({
  imports: [VelocityModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
