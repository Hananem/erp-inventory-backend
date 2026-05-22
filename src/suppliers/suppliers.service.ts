import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateSupplierDto } from './dto/create-supplier.dto.js';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateSupplierDto) {
    return this.prisma.supplier.create({
      data: dto,
    });
  }

  // 🟢 FIND ALL (FILTER + PAGINATION)
  async findAll(query: any) {
    const {
      search,
      page = 1,
      perPage = 10,
      paginate = 'true',
    } = query;

    const isPaginated = paginate === 'true';

    const where: any = {};

    // 🔍 search (name, email, phone)
    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          phone: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // 🟢 pagination
    if (isPaginated) {
      const data = await this.prisma.supplier.findMany({
        where,
        include: {
          purchaseOrders: true,
        },
        skip: (Number(page) - 1) * Number(perPage),
        take: Number(perPage),
        orderBy: { createdAt: 'desc' },
      });

      const total = await this.prisma.supplier.count({ where });

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

    // 🟢 no pagination
    return this.prisma.supplier.findMany({
      where,
      include: {
        purchaseOrders: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.supplier.findUnique({
      where: { id },
      include: {
        purchaseOrders: {
          include: {
            items: true,
          },
        },
      },
    });
  }

  remove(id: string) {
    return this.prisma.supplier.delete({
      where: { id },
    });
  }
}