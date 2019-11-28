import { Controller, Get, Delete, Param } from '@nestjs/common';
import { CachedaysService } from './cachedays.service';

@Controller('cachedays')
export class CachedaysController {
  constructor(private cachedaysService: CachedaysService) {}

  @Get()
  async getCachedays() {
    const cachedays = await this.cachedaysService.getCachedays();
    return cachedays;
  }

  @Delete(':deleteDay')
  async deleteCachedays(@Param() params) {
    await this.cachedaysService.deleteCachedays(params.deleteDay);
    const cachedays = await this.cachedaysService.getCachedays();
    return cachedays;
  }
}
