import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { SuppliersService } from './suppliers.service.js';
import { CreateSupplierDto } from './dto/create-supplier.dto.js';

@Controller('suppliers')
export class SuppliersController {
  constructor(private suppliersService: SuppliersService) {}

  @Post()
  create(@Body() dto: CreateSupplierDto) {
    return this.suppliersService.create(dto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.suppliersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.suppliersService.remove(id);
  }
}