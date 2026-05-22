import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateSalesDto } from './dto/create-sales.dto.js';
import { MovementType, OrderStatus } from '@prisma/client';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  // 🟢 CREATE ORDER
  async create(dto: CreateSalesDto) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId },
    });

    if (!customer) throw new NotFoundException('Customer not found');

    return this.prisma.salesOrder.create({
      data: {
        customerId: dto.customerId,
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
        customer: true,
        items: { include: { product: true } },
      },
    });
  }

  // 🟢 CONFIRM (خصم المخزون 🔥)
  async confirm(id: string, warehouseId: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.salesOrder.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!order) throw new NotFoundException('Order not found');

      if (order.status === OrderStatus.CONFIRMED) {
        throw new BadRequestException('Already confirmed');
      }

      for (const item of order.items) {
        const stock = await tx.stock.findUnique({
          where: {
            productId_warehouseId: {
              productId: item.productId,
              warehouseId,
            },
          },
        });

        if (!stock || stock.quantity < item.quantity) {
          throw new BadRequestException('Not enough stock');
        }

        // 🔴 خصم المخزون
        await tx.stock.update({
          where: {
            productId_warehouseId: {
              productId: item.productId,
              warehouseId,
            },
          },
          data: {
            quantity: { decrement: item.quantity },
          },
        });

        // 🔴 تسجيل حركة
        await tx.stockMovement.create({
          data: {
            type: MovementType.OUT,
            quantity: item.quantity,
            productId: item.productId,
            warehouseId,
            note: `Sales Order ${order.id}`,
          },
        });
      }

      return tx.salesOrder.update({
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
      customerId,
      page = 1,
      perPage = 10,
      paginate = 'true',
    } = query;

    const isPaginated = paginate === 'true';

    const where: any = {
      customerId: customerId || undefined,
      status: status || undefined,
    };

    if (search) {
      where.OR = [
        { id: { contains: search } },
        {
          customer: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    if (isPaginated) {
      const data = await this.prisma.salesOrder.findMany({
        where,
        include: {
          customer: true,
          items: { include: { product: true } },
        },
        skip: (Number(page) - 1) * Number(perPage),
        take: Number(perPage),
        orderBy: { createdAt: 'desc' },
      });

      const total = await this.prisma.salesOrder.count({ where });

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

    return this.prisma.salesOrder.findMany({
      where,
      include: {
        customer: true,
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.salesOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        items: { include: { product: true } },
      },
    });
  }
}