import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { PurchaseService } from './purchase.service.js';
import { CreatePurchaseDto } from './dto/create-purchase.dto.js';

@Controller('purchase')
export class PurchaseController {
  constructor(private service: PurchaseService) {}

  // 🟢 create order
  @Post()
  create(@Body() dto: CreatePurchaseDto) {
    return this.service.create(dto);
  }

  // 🟢 confirm order
  @Post(':id/confirm')
  confirm(
    @Param('id') id: string,
    @Body('warehouseId') warehouseId: string,
  ) {
    return this.service.confirm(id, warehouseId);
  }

  // 🟢 list orders (filter + pagination)
  @Get()
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }
}