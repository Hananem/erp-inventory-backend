import { Controller, Get, Query } from '@nestjs/common';
import { PermissionsService } from './permissions.service.js'; // تأكد من الـ .js إذا كان مشروعك يعتمدها

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.permissionsService.findAll(query);
  }
}