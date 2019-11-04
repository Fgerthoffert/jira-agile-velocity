import { Module } from '@nestjs/common';
import { InitiativesController } from './initiatives.controller';
import { InitiativesService } from './initiatives.service';
import { ConfigModule } from '../config.module';

@Module({
  imports: [ConfigModule],
  controllers: [InitiativesController],
  providers: [InitiativesService],
})
export class InitiativesModule {}
