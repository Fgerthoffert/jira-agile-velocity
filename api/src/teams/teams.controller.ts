import { Controller, Get } from '@nestjs/common';
import { TeamsService } from './teams.service';

@Controller('teams')
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @Get()
  async getTeams() {
    const teams = await this.teamsService.getTeams();
    return teams;
  }
}
