import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMovementDto } from './dto/create-movement.dto.js';
import { Prisma } from '@prisma/client';

@Injectable()
export class MovementService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMovementDto) {
    return this.prisma.stockMovement.create({
      data: {
        type: dto.type,
        quantity: dto.quantity,
        note: dto.note,
        productId: dto.productId,
        warehouseId: dto.warehouseId,
      },
    });
  }

  async findAll(query: any) {
    const {
      search,
      type,
      productId,
      warehouseId,
      from,
      to,
      page = 1,
      perPage = 10,
      paginate = 'true',
    } = query;

    const isPaginated = paginate === 'true';

    const where: Prisma.StockMovementWhereInput = {};

    // 🔍 Search (note)
    if (search) {
      where.note = {
        contains: search,
        mode: Prisma.QueryMode.insensitive,
      };
    }

    // 🎯 Filters
    if (type) where.type = type;
    if (productId) where.productId = productId;
    if (warehouseId) where.warehouseId = warehouseId;

    // 📅 Date filter
    if (from || to) {
      where.createdAt = {
        gte: from ? new Date(from) : undefined,
        lte: to ? new Date(to) : undefined,
      };
    }

    // 🟢 Pagination ON
    if (isPaginated) {
      const data = await this.prisma.stockMovement.findMany({
        where,
        include: {
          product: true,
          warehouse: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(perPage),
        take: Number(perPage),
      });

      const total = await this.prisma.stockMovement.count({ where });

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

    // 🟢 بدون pagination
    return this.prisma.stockMovement.findMany({
      where,
      include: {
        product: true,
        warehouse: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}