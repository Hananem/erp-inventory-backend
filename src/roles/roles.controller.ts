import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { RolesService } from './roles.service.js';

// 🟢 قمنا بفصل الـ Dto واستيراده باستخدام "import type" لحل مشكلة الـ TypeScript الصارم
import type { CreateRoleDto } from './roles.service.js';
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.rolesService.findAll(query);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: CreateRoleDto) {
    return this.rolesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
