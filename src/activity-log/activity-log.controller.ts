import { Controller, Get, Query } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';

@Controller('activity-log')
export class ActivityLogController {
  constructor(private readonly service: ActivityLogService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get('insights')
  getInsights() {
    return this.service.getInsights();
  }
}