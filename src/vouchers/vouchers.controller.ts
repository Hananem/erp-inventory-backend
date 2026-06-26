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
import { VouchersService } from './vouchers.service.js';
import { CreateVoucherDto } from './dto/create-voucher.dto.js';
import { UpdateVoucherDto } from './dto/update-voucher.dto.js';
import { JwtGuard } from '../auth/jwt.guard.js';

@UseGuards(JwtGuard)
@Controller('vouchers')
export class VouchersController {
  constructor(private vouchersService: VouchersService) {}

  @Post()
  create(@Body() dto: CreateVoucherDto) {
    return this.vouchersService.create(dto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.vouchersService.findAll(query);
  }

  @Get('search')
  search(@Query('q') query: string) {
    return this.vouchersService.search(query);
  }

  @Get('summary')
  getSummary(@Query() query: any) {
    return this.vouchersService.getSummary(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vouchersService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVoucherDto) {
    return this.vouchersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vouchersService.remove(id);
  }
}
