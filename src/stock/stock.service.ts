import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  async setStock(productId: string, warehouseId: string, quantity: number) {
    return this.prisma.stock.upsert({
      where: {
        productId_warehouseId: {
          productId,
          warehouseId,
        },
      },
      update: {
        quantity,
      },
      create: {
        productId,
        warehouseId,
        quantity,
      },
    });
  }

  async getStock(productId: string) {
    return this.prisma.stock.findMany({
      where: { productId },
      include: { warehouse: true },
    });
  }

  async addStock(productId: string, warehouseId: string, quantity: number) {
    const stock = await this.prisma.stock.findUnique({
      where: {
        productId_warehouseId: {
          productId,
          warehouseId,
        },
      },
    });

    if (!stock) {
      return this.setStock(productId, warehouseId, quantity);
    }

    return this.prisma.stock.update({
      where: {
        productId_warehouseId: {
          productId,
          warehouseId,
        },
      },
      data: {
        quantity: stock.quantity + quantity,
      },
    });
  }

  async removeStock(productId: string, warehouseId: string, quantity: number) {
    const stock = await this.prisma.stock.findUnique({
      where: {
        productId_warehouseId: {
          productId,
          warehouseId,
        },
      },
    });

    if (!stock) throw new NotFoundException('Stock not found');

    if (stock.quantity < quantity) {
      throw new Error('Not enough stock');
    }

    return this.prisma.stock.update({
      where: {
        productId_warehouseId: {
          productId,
          warehouseId,
        },
      },
      data: {
        quantity: stock.quantity - quantity,
      },
    });
  }
}