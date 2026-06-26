import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateVoucherDto } from './dto/create-voucher.dto.js';
import { UpdateVoucherDto } from './dto/update-voucher.dto.js';
import { Prisma, VoucherKind } from '@prisma/client';

@Injectable()
export class VouchersService {
  constructor(private prisma: PrismaService) {}

  private async generateRef(kind: VoucherKind) {
    const year = new Date().getFullYear();
    const prefix = kind === 'RECEIPT' ? 'REC' : 'PAY';

    const count = await this.prisma.voucher.count({
      where: {
        kind,
        createdAt: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`),
        },
      },
    });

    const seq = String(count + 1).padStart(3, '0');
    return `${prefix}-${year}-${seq}`;
  }

  async create(dto: CreateVoucherDto) {
    const account = await this.prisma.account.findUnique({
      where: { id: dto.accountId },
    });

    if (!account) {
      throw new NotFoundException('الحساب غير موجود');
    }

    if (dto.kind === 'PAYMENT' && account.balance < dto.amount) {
      throw new ConflictException('الرصيد غير كافٍ في هذا الحساب');
    }

    const ref = await this.generateRef(dto.kind);
    const balanceChange = dto.kind === 'RECEIPT' ? dto.amount : -dto.amount;

    return this.prisma.$transaction(async (tx) => {
      const voucher = await tx.voucher.create({
        data: {
          ref,
          kind: dto.kind,
          party: dto.party,
          accountId: dto.accountId,
          amount: dto.amount,
          link: dto.link,
          date: dto.date ? new Date(dto.date) : new Date(),
        },
        include: { account: true },
      });

      await tx.account.update({
        where: { id: dto.accountId },
        data: { balance: { increment: balanceChange } },
      });

      return voucher;
    });
  }

  async findAll(query: any) {
    const {
      search,
      kind,
      accountId,
      from,
      to,
      page = 1,
      perPage = 10,
      paginate = 'true',
      sortBy = 'date',
      sortOrder = 'desc',
    } = query;

    const isPaginated = paginate === 'true';

    const where: Prisma.VoucherWhereInput = {};

    if (search) {
      where.OR = [
        { ref: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { party: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { link: { contains: search, mode: Prisma.QueryMode.insensitive } },
      ];
    }

    if (kind) {
      where.kind = kind;
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

    if (isPaginated) {
      const data = await this.prisma.voucher.findMany({
        where,
        include: { account: true },
        skip: (Number(page) - 1) * Number(perPage),
        take: Number(perPage),
        orderBy: { [sortBy]: sortOrder },
      });

      const total = await this.prisma.voucher.count({ where });

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

    return this.prisma.voucher.findMany({
      where,
      include: { account: true },
      orderBy: { [sortBy]: sortOrder },
    });
  }

  async findOne(id: string) {
    const voucher = await this.prisma.voucher.findUnique({
      where: { id },
      include: { account: true },
    });

    if (!voucher) {
      throw new NotFoundException('السند غير موجود');
    }

    return voucher;
  }

  async update(id: string, dto: UpdateVoucherDto) {
    const voucher = await this.prisma.voucher.findUnique({ where: { id } });

    if (!voucher) {
      throw new NotFoundException('السند غير موجود');
    }

    const newAccountId = dto.accountId ?? voucher.accountId;
    const newKind = dto.kind ?? voucher.kind;
    const newAmount = dto.amount ?? voucher.amount;

    if (newAccountId !== voucher.accountId) {
      const exists = await this.prisma.account.findUnique({
        where: { id: newAccountId },
      });
      if (!exists) {
        throw new NotFoundException('الحساب الجديد غير موجود');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const oldEffect =
        voucher.kind === 'RECEIPT' ? -voucher.amount : voucher.amount;

      await tx.account.update({
        where: { id: voucher.accountId },
        data: { balance: { increment: oldEffect } },
      });

      const targetAccount = await tx.account.findUnique({
        where: { id: newAccountId },
      });

      if (newKind === 'PAYMENT' && (targetAccount?.balance ?? 0) < newAmount) {
        throw new ConflictException('الرصيد غير كافٍ في الحساب لإتمام التعديل');
      }

      const newEffect = newKind === 'RECEIPT' ? newAmount : -newAmount;

      await tx.account.update({
        where: { id: newAccountId },
        data: { balance: { increment: newEffect } },
      });

      return tx.voucher.update({
        where: { id },
        data: {
          kind: dto.kind,
          party: dto.party,
          accountId: dto.accountId,
          amount: dto.amount,
          link: dto.link,
          date: dto.date ? new Date(dto.date) : undefined,
        },
        include: { account: true },
      });
    });
  }

  async remove(id: string) {
    const voucher = await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      const reverseEffect =
        voucher.kind === 'RECEIPT' ? -voucher.amount : voucher.amount;

      await tx.account.update({
        where: { id: voucher.accountId },
        data: { balance: { increment: reverseEffect } },
      });

      return tx.voucher.delete({ where: { id } });
    });
  }

  async search(query: string) {
    return this.prisma.voucher.findMany({
      where: {
        OR: [
          { ref: { contains: query, mode: Prisma.QueryMode.insensitive } },
          { party: { contains: query, mode: Prisma.QueryMode.insensitive } },
          { link: { contains: query, mode: Prisma.QueryMode.insensitive } },
        ],
      },
      include: { account: true },
    });
  }

  async getSummary(query: any) {
    const { from, to, accountId } = query;

    const where: Prisma.VoucherWhereInput = {};
    if (accountId) where.accountId = accountId;
    if (from || to) {
      where.date = {
        gte: from ? new Date(from) : undefined,
        lte: to ? new Date(to) : undefined,
      };
    }

    const [receipts, payments] = await Promise.all([
      this.prisma.voucher.aggregate({
        where: { ...where, kind: 'RECEIPT' },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.voucher.aggregate({
        where: { ...where, kind: 'PAYMENT' },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    const totalReceipts = receipts._sum.amount ?? 0;
    const totalPayments = payments._sum.amount ?? 0;

    return {
      totalReceipts,
      totalPayments,
      net: totalReceipts - totalPayments,
      receiptsCount: receipts._count,
      paymentsCount: payments._count,
    };
  }
}
