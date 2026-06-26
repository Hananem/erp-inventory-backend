import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { TreasuryService } from './treasury.service.js';
import { JwtGuard } from '../auth/jwt.guard.js';

@UseGuards(JwtGuard)
@Controller('treasury')
export class TreasuryController {
  constructor(private treasuryService: TreasuryService) {}

  // ✅ الأرصدة حسب النوع
  @Get('balances')
  getBalances() {
    return this.treasuryService.getBalances();
  }

  // ✅ ملخص الشهر الحالي
  @Get('monthly-summary')
  getMonthlySummary() {
    return this.treasuryService.getCurrentMonthSummary();
  }

  // ✅ منحنى التدفقات (?months=8)
  @Get('flow')
  getFlow(@Query('months') months?: string) {
    return this.treasuryService.getMonthlyFlow(months ? Number(months) : 8);
  }

  // ✅ كل بيانات اللوحة دفعة واحدة
  @Get('dashboard')
  getDashboard(@Query('months') months?: string) {
    return this.treasuryService.getDashboard(months ? Number(months) : 8);
  }
}
