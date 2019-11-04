import { Module } from '@nestjs/common';
import { VelocityController } from './velocity.controller';
import { VelocityService } from './velocity.service';
import { ConfigModule } from '../config.module';

@Module({
  imports: [ConfigModule],
  controllers: [VelocityController],
  providers: [VelocityService],
})
export class VelocityModule {}
