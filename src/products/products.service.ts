import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // ✅ CREATE
  async create(dto: CreateProductDto) {
    const exists = await this.prisma.product.findUnique({
      where: { code: dto.code },
    });

    if (exists) {
      throw new ConflictException('كود المنتج مستخدم مسبقاً');
    }

    if (dto.barcode) {
      const barcodeExists = await this.prisma.product.findUnique({
        where: { barcode: dto.barcode },
      });

      if (barcodeExists) {
        throw new ConflictException('Barcode مستخدم مسبقاً');
      }
    }

    return this.prisma.product.create({
      data: {
        ...dto,
        unit: dto.unit ?? 'pcs',
        minStock: dto.minStock ?? 0,
      },
      include: { category: true },
    });
  }

  // ✅ GET ALL (Pagination + Filter + Search)
  async findAll(query: any) {
    const {
      search,
      categoryId,
      from,
      to,
      page = 1,
      perPage = 10,
      paginate = 'true',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const isPaginated = paginate === 'true';

    const where: Prisma.ProductWhereInput = {};

    // 🔍 SEARCH
    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          code: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          barcode: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      ];
    }

    // 🧩 FILTERS
    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (from || to) {
      where.createdAt = {
        gte: from ? new Date(from) : undefined,
        lte: to ? new Date(to) : undefined,
      };
    }

    // ✅ PAGINATION
    if (isPaginated) {
      const data = await this.prisma.product.findMany({
        where,
        include: {
          category: true,
          stocks: { include: { warehouse: true } },
        },
        skip: (Number(page) - 1) * Number(perPage),
        take: Number(perPage),
        orderBy: {
          [sortBy]: sortOrder,
        },
      });

      const total = await this.prisma.product.count({ where });

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

    // ❌ بدون pagination
    return this.prisma.product.findMany({
      where,
      include: {
        category: true,
        stocks: { include: { warehouse: true } },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
    });
  }

  // ✅ GET ONE
  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        stocks: {
          include: { warehouse: true },
        },
        movements: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!product) {
      throw new NotFoundException('المنتج غير موجود');
    }

    return product;
  }

  // ✅ UPDATE (محسّن 🔥)
  async update(id: string, dto: Partial<CreateProductDto>) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('المنتج غير موجود');
    }

    // 🔒 code check
    if (dto.code) {
      const exists = await this.prisma.product.findUnique({
        where: { code: dto.code },
      });

      if (exists && exists.id !== id) {
        throw new ConflictException('كود المنتج مستخدم مسبقاً');
      }
    }

    // 🔒 barcode check
    if (dto.barcode) {
      const exists = await this.prisma.product.findUnique({
        where: { barcode: dto.barcode },
      });

      if (exists && exists.id !== id) {
        throw new ConflictException('Barcode مستخدم مسبقاً');
      }
    }

    // 🔥 منع تغيير category إذا فيه movements
    if (dto.categoryId && dto.categoryId !== product.categoryId) {
      const hasMovements = await this.prisma.stockMovement.count({
        where: { productId: id },
      });

      if (hasMovements > 0) {
        throw new ConflictException(
          'لا يمكن تغيير التصنيف لمنتج لديه حركات مخزون',
        );
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        ...dto,
        unit: dto.unit ?? product.unit,
        minStock: dto.minStock ?? product.minStock,
      },
      include: {
        category: true,
        stocks: { include: { warehouse: true } },
      },
    });
  }

  // ✅ DELETE
  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.product.delete({
      where: { id },
    });
  }

  // ✅ SEARCH (اختياري)
  async search(query: string) {
    return this.prisma.product.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            code: {
              contains: query,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            barcode: {
              contains: query,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
      },
      include: { category: true },
    });
  }

  // ✅ LOW STOCK
  async getLowStock() {
    return this.prisma.product.findMany({
      where: {
        stocks: {
          some: {
            quantity: {
              lte: 0, // تقدر تطورها لاحقاً حسب minStock
            },
          },
        },
      },
      include: {
        category: true,
        stocks: { include: { warehouse: true } },
      },
    });
  }
}