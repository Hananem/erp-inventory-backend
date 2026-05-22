import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { SalesService } from './sales.service.js';
import { CreateSalesDto } from './dto/create-sales.dto.js';

@Controller('sales')
export class SalesController {
  constructor(private service: SalesService) {}

  @Post()
  create(@Body() dto: CreateSalesDto) {
    return this.service.create(dto);
  }

  // 🔥 confirm sale
  @Post(':id/confirm')
  confirm(
    @Param('id') id: string,
    @Body('warehouseId') warehouseId: string,
  ) {
    return this.service.confirm(id, warehouseId);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}