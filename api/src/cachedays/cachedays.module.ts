import { Module } from '@nestjs/common';
import { CachedaysController } from './cachedays.controller';
import { CachedaysService } from './cachedays.service';
import { ConfigModule } from '../config.module';

@Module({
  imports: [ConfigModule],
  controllers: [CachedaysController],
  providers: [CachedaysService],
})
export class CachedaysModule {}
