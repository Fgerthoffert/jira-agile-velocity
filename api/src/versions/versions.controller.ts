import { Controller, Get, Param } from '@nestjs/common';
import { VersionsService } from './versions.service';

@Controller('versions')
export class VersionsController {
  constructor(private versionsService: VersionsService) {}

  @Get()
  async getVersions() {
    const control = await this.versionsService.getVersions();
    return control;
  }
}
