import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AccountsService } from './accounts.service.js';
import { CreateAccountDto } from './dto/create-account.dto.js';
import { UpdateAccountDto } from './dto/update-account.dto.js';
import { UpdateBalanceDto } from './dto/update-balance.dto.js';
import { JwtGuard } from '../auth/jwt.guard.js';

@UseGuards(JwtGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private accountsService: AccountsService) {}

  @Post()
  create(@Body() dto: CreateAccountDto) {
    return this.accountsService.create(dto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.accountsService.findAll(query);
  }

  @Get('summary')
  getSummary() {
    return this.accountsService.getSummary();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAccountDto) {
    return this.accountsService.update(id, dto);
  }

  @Patch(':id/balance')
  updateBalance(@Param('id') id: string, @Body() dto: UpdateBalanceDto) {
    return this.accountsService.updateBalance(id, dto);
  }

  @Patch(':id/freeze')
  toggleFreeze(@Param('id') id: string) {
    return this.accountsService.toggleFreeze(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountsService.remove(id);
  }
}
