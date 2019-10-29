import { Controller, Req, Get } from '@nestjs/common';
import { Request } from 'express';
import { TeamsService } from './teams.service';

@Controller('teams')
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @Get()
  async getTeams(@Req() request: Request) {
    const teams = await this.teamsService.getTeams();
    return teams;
  }
}
