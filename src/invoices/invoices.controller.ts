import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { InvoicesService } from './invoices.service.js';
import { CreateInvoiceDto } from './dto/create-invoice.dto.js';

@Controller('invoices')
export class InvoicesController {
  constructor(private service: InvoicesService) {}

  // 🟢 إنشاء
  @Post()
  create(@Body() dto: CreateInvoiceDto) {
    return this.service.create(dto);
  }

  // 🟢 دفع
  @Post(':id/pay')
  pay(@Param('id') id: string) {
    return this.service.pay(id);
  }

  // 🟢 عرض مع فلترة
  @Get()
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  // 🟢 تفاصيل
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}