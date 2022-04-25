import { Module } from '@nestjs/common';
import { CompletionController } from './completion.controller';
import { CompletionService } from './completion.service';
import { ConfigModule } from '../config.module';

@Module({
  imports: [ConfigModule],
  controllers: [CompletionController],
  providers: [CompletionService],
})
export class CompletionModule {}
