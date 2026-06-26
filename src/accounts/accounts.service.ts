import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateAccountDto } from './dto/create-account.dto.js';
import { UpdateAccountDto } from './dto/update-account.dto.js';
import { UpdateBalanceDto } from './dto/update-balance.dto.js';
import { Prisma, AccountType } from '@prisma/client';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  private async generateReference(type: AccountType) {
    const prefixMap: Record<AccountType, string> = {
      cash: 'CASH',
      bank: 'BANK',
      ccp: 'CCP',
    };
    const prefix = prefixMap[type];

    const count = await this.prisma.account.count({ where: { type } });
    const seq = String(count + 1).padStart(3, '0');
    return `${prefix}-${seq}`;
  }

  async create(dto: CreateAccountDto) {
    const nameExists = await this.prisma.account.findUnique({
      where: { name: dto.name },
    });

    if (nameExists) {
      throw new ConflictException('اسم الحساب مستخدم مسبقاً');
    }

    if (dto.reference) {
      const refExists = await this.prisma.account.findUnique({
        where: { reference: dto.reference },
      });

      if (refExists) {
        throw new ConflictException('المرجع مستخدم مسبقاً');
      }
    }

    const reference = dto.reference ?? (await this.generateReference(dto.type));

    return this.prisma.account.create({
      data: {
        name: dto.name,
        type: dto.type,
        reference,
        balance: dto.balance ?? 0,
      },
    });
  }

  async findAll(query: any) {
    const { search, type, frozen } = query;

    const where: Prisma.AccountWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { reference: { contains: search, mode: Prisma.QueryMode.insensitive } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (frozen !== undefined) {
      where.frozen = frozen === 'true' || frozen === true;
    }

    return this.prisma.account.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const account = await this.prisma.account.findUnique({
      where: { id },
      include: {
        vouchers: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!account) {
      throw new NotFoundException('الحساب غير موجود');
    }

    return account;
  }

  async update(id: string, dto: UpdateAccountDto) {
    const account = await this.prisma.account.findUnique({ where: { id } });

    if (!account) {
      throw new NotFoundException('الحساب غير موجود');
    }

    if (dto.name) {
      const exists = await this.prisma.account.findUnique({
        where: { name: dto.name },
      });
      if (exists && exists.id !== id) {
        throw new ConflictException('اسم الحساب مستخدم مسبقاً');
      }
    }

    if (dto.reference) {
      const exists = await this.prisma.account.findUnique({
        where: { reference: dto.reference },
      });
      if (exists && exists.id !== id) {
        throw new ConflictException('المرجع مستخدم مسبقاً');
      }
    }

    return this.prisma.account.update({
      where: { id },
      data: dto,
    });
  }

  async updateBalance(id: string, dto: UpdateBalanceDto) {
    const account = await this.prisma.account.findUnique({ where: { id } });

    if (!account) {
      throw new NotFoundException('الحساب غير موجود');
    }

    return this.prisma.account.update({
      where: { id },
      data: { balance: dto.balance },
    });
  }

  async toggleFreeze(id: string) {
    const account = await this.prisma.account.findUnique({ where: { id } });

    if (!account) {
      throw new NotFoundException('الحساب غير موجود');
    }

    return this.prisma.account.update({
      where: { id },
      data: { frozen: !account.frozen },
    });
  }

  async getSummary() {
    const accounts = await this.prisma.account.findMany();

    const active = accounts.filter((a) => !a.frozen);
    const totalBalance = active.reduce((sum, a) => sum + a.balance, 0);

    const byType = (['cash', 'bank', 'ccp'] as AccountType[]).map((type) => ({
      type,
      total: active
        .filter((a) => a.type === type)
        .reduce((sum, a) => sum + a.balance, 0),
      count: active.filter((a) => a.type === type).length,
    }));

    return {
      totalBalance,
      activeCount: active.length,
      frozenCount: accounts.length - active.length,
      byType,
    };
  }

  async remove(id: string) {
    const account = await this.findOne(id);

    const vouchersCount = await this.prisma.voucher.count({
      where: { accountId: id },
    });

    if (vouchersCount > 0) {
      throw new ConflictException(
        'لا يمكن حذف حساب لديه سندات قبض أو دفع مرتبطة',
      );
    }

    return this.prisma.account.delete({ where: { id } });
  }
}
