import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { WarehouseService } from './warehouse.service.js';

@Controller('warehouses')
export class WarehouseController {
  constructor(private warehouseService: WarehouseService) {}

  @Post()
  create(@Body() body: { name: string; location?: string }) {
    return this.warehouseService.create(body);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.warehouseService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.warehouseService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: { name?: string; location?: string },
  ) {
    return this.warehouseService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.warehouseService.remove(id);
  }
}