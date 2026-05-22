import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { StockService } from './stock.service.js';
import { UpdateStockDto } from './dto/update-stock.dto.js';

@Controller('stock')
export class StockController {
  constructor(private stockService: StockService) {}

  @Post('set')
  set(@Body() dto: UpdateStockDto) {
    return this.stockService.setStock(
      dto.productId,
      dto.warehouseId,
      dto.quantity,
    );
  }

  @Post('add')
  add(@Body() dto: UpdateStockDto) {
    return this.stockService.addStock(
      dto.productId,
      dto.warehouseId,
      dto.quantity,
    );
  }

  @Post('remove')
  remove(@Body() dto: UpdateStockDto) {
    return this.stockService.removeStock(
      dto.productId,
      dto.warehouseId,
      dto.quantity,
    );
  }

  @Get(':productId')
  get(@Param('productId') productId: string) {
    return this.stockService.getStock(productId);
  }
}