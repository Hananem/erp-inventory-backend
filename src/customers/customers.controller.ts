import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import { CustomersService } from './customers.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';

@Controller('customers')
export class CustomersController {
  constructor(private service: CustomersService) {}

  // ✅ CREATE
  @Post()
  create(@Body() dto: CreateCustomerDto) {
    return this.service.create(dto);
  }

  // ✅ GET ALL (pagination + filters)
  @Get()
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  // ✅ GET ONE
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // ✅ UPDATE
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: CreateCustomerDto) {
    return this.service.update(id, dto);
  }

  // ✅ DELETE
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}