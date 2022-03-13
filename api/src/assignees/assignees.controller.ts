import { Controller, Get, Param } from '@nestjs/common';
import { AssigneesService } from './assignees.service';

@Controller('assignees')
export class AssigneesController {
  constructor(private assigneesService: AssigneesService) {}

  @Get(':teamId')
  async getVelocity(@Param() params) {
    const velocity = await this.assigneesService.getVelocity(params.teamId);
    return velocity;
  }
}
