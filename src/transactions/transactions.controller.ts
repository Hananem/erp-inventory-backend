import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service.js';
import { JwtGuard } from '../auth/jwt.guard.js';

@UseGuards(JwtGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  // ✅ القائمة (pagination + search + filter)
  @Get()
  findAll(@Query() query: any) {
    return this.transactionsService.findAll(query);
  }

  // ✅ الإجماليات
  @Get('summary')
  getSummary() {
    return this.transactionsService.getSummary();
  }
}
