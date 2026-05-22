import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { JwtGuard } from '../auth/jwt.guard.js';

@UseGuards(JwtGuard)
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  // ✅ CREATE
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  // ✅ GET ALL (pagination + filter)
  @Get()
  findAll(@Query() query: any) {
    return this.productsService.findAll(query);
  }

  // ✅ SEARCH
  @Get('search')
  search(@Query('q') query: string) {
    return this.productsService.search(query);
  }

  // ✅ LOW STOCK
  @Get('low-stock')
  getLowStock() {
    return this.productsService.getLowStock();
  }

  // ✅ GET ONE
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  // ✅ UPDATE
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateProductDto>) {
    return this.productsService.update(id, dto);
  }

  // ✅ DELETE
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}