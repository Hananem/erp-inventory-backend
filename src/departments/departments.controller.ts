import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { DepartmentService } from './departments.service.js';

@Controller('departments')
export class DepartmentController {
  constructor(private service: DepartmentService) {}

  @Post()
  create(@Body() body: { name: string }) {
    return this.service.create(body);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: { name?: string }) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}