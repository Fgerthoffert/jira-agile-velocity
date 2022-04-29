import { Controller, Get, Param } from '@nestjs/common';
import { CompletionService } from './completion.service';

@Controller('completion')
export class CompletionController {
  constructor(private completionService: CompletionService) {}

  @Get(':teamId')
  async getCompletion(@Param() params) {
    const control = await this.completionService.getCompletion(params.teamId);
    return control;
  }
}
