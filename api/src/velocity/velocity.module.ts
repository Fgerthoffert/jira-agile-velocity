import { Module } from '@nestjs/common';
import { VelocityController } from './velocity.controller';
import { VelocityService } from './velocity.service';

@Module({
  controllers: [VelocityController],
  providers: [VelocityService],
})
export class VelocityModule {}
