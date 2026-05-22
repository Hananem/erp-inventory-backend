import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class WarehouseService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; location?: string }) {
    return this.prisma.warehouse.create({
      data,
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

    // 🔍 search by name or location
    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          location: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // 🟢 pagination
    if (isPaginated) {
      const data = await this.prisma.warehouse.findMany({
        where,
        include: {
          stocks: {
            include: { product: true },
          },
        },
        skip: (Number(page) - 1) * Number(perPage),
        take: Number(perPage),
        orderBy: { name: 'asc' },
      });

      const total = await this.prisma.warehouse.count({ where });

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
    return this.prisma.warehouse.findMany({
      where,
      include: {
        stocks: {
          include: { product: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
      include: {
        stocks: {
          include: { product: true },
        },
      },
    });

    if (!warehouse) throw new NotFoundException('Warehouse not found');
    return warehouse;
  }

  async update(id: string, data: { name?: string; location?: string }) {
    await this.findOne(id);

    return this.prisma.warehouse.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.warehouse.delete({
      where: { id },
    });
  }
}