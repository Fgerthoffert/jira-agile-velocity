import { Controller, Get, Param } from '@nestjs/common';
import { ControlService } from './control.service';

@Controller('control')
export class ControlController {
  constructor(private controlService: ControlService) {}

  @Get(':teamId')
  async getControl(@Param() params) {
    const control = await this.controlService.getVelocity(params.teamId);
    return control;
  }
}
