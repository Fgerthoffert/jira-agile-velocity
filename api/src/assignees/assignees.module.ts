import { Module } from '@nestjs/common';
import { AssigneesController } from './assignees.controller';
import { AssigneesService } from './assignees.service';
import { ConfigModule } from '../config.module';

@Module({
  imports: [ConfigModule],
  controllers: [AssigneesController],
  providers: [AssigneesService],
})
export class AssigneesModule {}
