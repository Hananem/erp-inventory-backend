import { Controller, Get, Post, Body, Query, Param, Delete } from '@nestjs/common';
import { EmployeesService } from './employees.service.js';

@Controller('employees')
export class EmployeesController {
  constructor(private service: EmployeesService) {}

  @Post()
  create(@Body() dto: any) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}