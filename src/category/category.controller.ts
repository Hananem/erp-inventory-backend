import { Controller, Get, Post, Body, Param, Delete,Put, Query } from '@nestjs/common';
import { CategoryService } from './category.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';

@Controller('categories')
export class CategoryController {
  constructor(private service: CategoryService) {}

  @Post()
  create(@Body() dto: CreateCategoryDto) {
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

  @Put(':id')
update(@Param('id') id: string, @Body() dto: CreateCategoryDto) {
  return this.service.update(id, dto);
}

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}