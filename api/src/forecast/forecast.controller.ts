import { Controller, Get, Param } from '@nestjs/common';
import { ForecastService } from './forecast.service';

@Controller('forecast')
export class ForecastController {
  constructor(private forecastService: ForecastService) {}

  @Get(':teamId')
  async getForecast(@Param() params) {
    const control = await this.forecastService.getForecast(params.teamId);
    return control;
  }
}
