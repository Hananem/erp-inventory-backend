import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma, VoucherKind } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  private mapKindToType(kind: VoucherKind) {
    return kind === 'RECEIPT' ? 'IN' : 'OUT';
  }

  private mapTypeToKind(type: string): VoucherKind | undefined {
    if (type === 'IN') return 'RECEIPT';
    if (type === 'OUT') return 'PAYMENT';
    return undefined;
  }

  // ✅ القائمة المفلترة + المبحوثة + المرقّمة (Pagination)
  async findAll(query: any) {
    const {
      search,
      type, // 'all' | 'IN' | 'OUT'
      accountId,
      from,
      to,
      page = 1,
      perPage = 8,
    } = query;

    const where: Prisma.VoucherWhereInput = {};

    if (search) {
      where.OR = [
        { ref: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { category: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { note: { contains: search, mode: Prisma.QueryMode.insensitive } },
      ];
    }

    if (type && type !== 'all') {
      const kind = this.mapTypeToKind(type);
      if (kind) where.kind = kind;
    }

    if (accountId) {
      where.accountId = accountId;
    }

    if (from || to) {
      where.date = {
        gte: from ? new Date(from) : undefined,
        lte: to ? new Date(to) : undefined,
      };
    }

    const [rows, total] = await Promise.all([
      this.prisma.voucher.findMany({
        where,
        include: { account: true },
        orderBy: { date: 'desc' },
        skip: (Number(page) - 1) * Number(perPage),
        take: Number(perPage),
      }),
      this.prisma.voucher.count({ where }),
    ]);

    const data = rows.map((v) => ({
      id: v.id,
      ref: v.ref,
      date: v.date.toISOString().slice(0, 10),
      account: v.account.name,
      type: this.mapKindToType(v.kind),
      amount: v.amount,
      category: v.category ?? '—',
      note: v.note ?? '',
    }));

    return {
      data,
      meta: {
        total,
        page: Number(page),
        perPage: Number(perPage),
        lastPage: Math.ceil(total / Number(perPage)),
      },
    };
  }

  // ✅ إجمالي الداخل / الخارج / الصافي (على كل البيانات بدون فلترة)
  async getSummary() {
    const [receipts, payments] = await Promise.all([
      this.prisma.voucher.aggregate({
        where: { kind: 'RECEIPT' },
        _sum: { amount: true },
      }),
      this.prisma.voucher.aggregate({
        where: { kind: 'PAYMENT' },
        _sum: { amount: true },
      }),
    ]);

    const totalIn = receipts._sum.amount ?? 0;
    const totalOut = payments._sum.amount ?? 0;

    return { totalIn, totalOut, net: totalIn - totalOut };
  }
}
