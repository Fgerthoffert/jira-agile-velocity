import { Controller, Get, Delete, Param } from '@nestjs/common';
import { CachedaysService } from './cachedays.service';

@Controller('cachedays')
export class CachedaysController {
  constructor(private cachedaysService: CachedaysService) {}

  @Get('/:teamId')
  async getCachedays(@Param() params) {
    const cachedays = await this.cachedaysService.getCachedays(params.teamId);
    return cachedays;
  }

  @Delete('/:teamId/:deleteDay')
  async deleteCachedays(@Param() params) {
    await this.cachedaysService.deleteCachedays(
      params.deleteDay,
      params.teamId,
    );
    const cachedays = await this.cachedaysService.getCachedays(params.teamId);
    return cachedays;
  }
}
