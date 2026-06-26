import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AccountType } from '@prisma/client';

interface MonthlyFlowRow {
  month: Date;
  kind: string;
  total: number;
}

@Injectable()
export class TreasuryService {
  constructor(private prisma: PrismaService) {}

  async getBalances() {
    const accounts = await this.prisma.account.findMany({
      where: { frozen: false },
    });

    const byType = (['cash', 'bank', 'ccp'] as AccountType[]).map((type) => ({
      type,
      total: accounts
        .filter((a) => a.type === type)
        .reduce((sum, a) => sum + a.balance, 0),
    }));

    const total = accounts.reduce((sum, a) => sum + a.balance, 0);

    return { byType, total };
  }

  async getCurrentMonthSummary() {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const [receipts, payments] = await Promise.all([
      this.prisma.voucher.aggregate({
        where: { kind: 'RECEIPT', date: { gte: start, lt: end } },
        _sum: { amount: true },
      }),
      this.prisma.voucher.aggregate({
        where: { kind: 'PAYMENT', date: { gte: start, lt: end } },
        _sum: { amount: true },
      }),
    ]);

    const monthIn = receipts._sum.amount ?? 0;
    const monthOut = payments._sum.amount ?? 0;

    return { monthIn, monthOut, net: monthIn - monthOut };
  }

  async getMonthlyFlow(months = 8) {
    const rows: MonthlyFlowRow[] = await this.prisma.$queryRaw`
      SELECT date_trunc('month', "date") as month, kind, SUM(amount)::float as total
      FROM "Voucher"
      WHERE "date" >= date_trunc('month', now()) - (interval '1 month' * ${months})
      GROUP BY date_trunc('month', "date"), kind
      ORDER BY month ASC
    `;

    const map = new Map<string, { month: string; in: number; out: number }>();

    for (const row of rows) {
      const key = row.month.toISOString().slice(0, 7);
      if (!map.has(key)) {
        map.set(key, {
          month: row.month.toLocaleDateString('ar', { month: 'long' }),
          in: 0,
          out: 0,
        });
      }
      const entry = map.get(key)!;
      if (row.kind === 'RECEIPT') entry.in = Number(row.total);
      if (row.kind === 'PAYMENT') entry.out = Number(row.total);
    }

    return Array.from(map.values());
  }

  async getDashboard(months = 8) {
    const [balances, monthSummary, flow] = await Promise.all([
      this.getBalances(),
      this.getCurrentMonthSummary(),
      this.getMonthlyFlow(months),
    ]);

    return { balances, monthSummary, flow };
  }
}
