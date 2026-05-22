import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateInvoiceDto } from './dto/create-invoice.dto.js';
import { Prisma } from '@prisma/client';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  // 🟢 إنشاء فاتورة
  async create(dto: CreateInvoiceDto) {
    // 🔹 من Sales
    if (dto.type === 'SALES') {
      const order = await this.prisma.salesOrder.findUnique({
        where: { id: dto.salesOrderId },
        include: { items: true },
      });

      if (!order) throw new NotFoundException('Sales order not found');

      const total = order.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      return this.prisma.invoice.create({
        data: {
          type: 'SALES',
          total,
          customerId: order.customerId,
          salesOrderId: order.id,
        },
      });
    }

    // 🔹 من Purchase
    if (dto.type === 'PURCHASE') {
      const order = await this.prisma.purchaseOrder.findUnique({
        where: { id: dto.purchaseOrderId },
        include: { items: true },
      });

      if (!order) throw new NotFoundException('Purchase order not found');

      const total = order.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      return this.prisma.invoice.create({
        data: {
          type: 'PURCHASE',
          total,
          supplierId: order.supplierId,
          purchaseOrderId: order.id,
        },
      });
    }
  }

  // 🟢 دفع الفاتورة
  async pay(id: string) {
    return this.prisma.invoice.update({
      where: { id },
      data: { status: 'PAID' },
    });
  }

  // 🟢 عرض مع فلترة + pagination
  async findAll(query: any) {
    const {
      type,
      status,
      from,
      to,
      page = 1,
      perPage = 10,
      paginate = 'true',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const isPaginated = paginate === 'true';

    const where: Prisma.InvoiceWhereInput = {
      type: type || undefined,
      status: status || undefined,
      createdAt: {
        gte: from ? new Date(from) : undefined,
        lte: to ? new Date(to) : undefined,
      },
    };

    // 🟢 مع pagination
    if (isPaginated) {
      const data = await this.prisma.invoice.findMany({
        where,
        skip: (Number(page) - 1) * Number(perPage),
        take: Number(perPage),
        orderBy: {
          [sortBy]: sortOrder,
        },
      });

      const total = await this.prisma.invoice.count({ where });

      return {
        data,
        meta: {
          total,
          page: Number(page),
          perPage: Number(perPage),
          lastPage: Math.ceil(total / perPage),
        },
      };
    }

    // 🟢 بدون pagination
    return this.prisma.invoice.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });
  }

  // 🟢 فاتورة واحدة
  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
    });

    if (!invoice) throw new NotFoundException('Invoice not found');

    return invoice;
  }
}