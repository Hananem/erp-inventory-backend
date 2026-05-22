import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePurchaseDto } from './dto/create-purchase.dto.js';
import { OrderStatus, MovementType } from '@prisma/client';

@Injectable()
export class PurchaseService {
  constructor(private prisma: PrismaService) {}

  // 🟢 CREATE PURCHASE ORDER
  async create(dto: CreatePurchaseDto) {
    return this.prisma.purchaseOrder.create({
      data: {
        supplierId: dto.supplierId,
        status: OrderStatus.PENDING,
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        supplier: true,
        items: { include: { product: true } },
      },
    });
  }

  // 🟢 CONFIRM PURCHASE ORDER
  async confirm(id: string, warehouseId: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.purchaseOrder.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!order) throw new NotFoundException('Order not found');

      if (order.status === OrderStatus.CONFIRMED) {
        throw new BadRequestException('Order already confirmed');
      }

      for (const item of order.items) {
        // update stock
        await tx.stock.upsert({
          where: {
            productId_warehouseId: {
              productId: item.productId,
              warehouseId,
            },
          },
          update: {
            quantity: { increment: item.quantity },
          },
          create: {
            productId: item.productId,
            warehouseId,
            quantity: item.quantity,
          },
        });

        // stock movement
        await tx.stockMovement.create({
          data: {
            type: MovementType.IN,
            quantity: item.quantity,
            productId: item.productId,
            warehouseId,
            note: `Purchase Order ${order.id}`,
          },
        });
      }

      return tx.purchaseOrder.update({
        where: { id },
        data: { status: OrderStatus.CONFIRMED },
      });
    });
  }

  // 🟢 FIND ALL (FILTER + PAGINATION)
  async findAll(query: any) {
    const {
      search,
      status,
      supplierId,
      from,
      to,
      page = 1,
      perPage = 10,
      paginate = 'true',
    } = query;

    const isPaginated = paginate === 'true';

    const where: any = {
      supplierId: supplierId || undefined,
      status: status || undefined,

      createdAt: {
        gte: from ? new Date(from) : undefined,
        lte: to ? new Date(to) : undefined,
      },
    };

    if (search) {
      where.OR = [
        {
          id: {
            contains: search,
          },
        },
        {
          supplier: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    if (isPaginated) {
      const data = await this.prisma.purchaseOrder.findMany({
        where,
        include: {
          supplier: true,
          items: { include: { product: true } },
        },
        skip: (Number(page) - 1) * Number(perPage),
        take: Number(perPage),
        orderBy: { createdAt: 'desc' },
      });

      const total = await this.prisma.purchaseOrder.count({ where });

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

    return this.prisma.purchaseOrder.findMany({
      where,
      include: {
        supplier: true,
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}