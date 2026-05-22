import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    const exists = await this.prisma.category.findUnique({
      where: { name: dto.name },
    });

    if (exists) {
      throw new ConflictException('Category already exists');
    }

    return this.prisma.category.create({
      data: dto,
    });
  }

  async findAll(query: any) {
    const {
      search,
      page = 1,
      perPage = 10,
      paginate = 'true',
      sortBy = 'name',
      sortOrder = 'asc',
    } = query;

    const isPaginated = paginate === 'true';

    const where: Prisma.CategoryWhereInput = {};

    // 🔍 Search
    if (search) {
      where.name = {
        contains: search,
        mode: Prisma.QueryMode.insensitive,
      };
    }

    // 🟢 Pagination ON
    if (isPaginated) {
      const data = await this.prisma.category.findMany({
        where,
        include: { products: true },
        skip: (Number(page) - 1) * Number(perPage),
        take: Number(perPage),
        orderBy: {
          [sortBy]: sortOrder,
        },
      });

      const total = await this.prisma.category.count({ where });

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

    // 🟢 بدون Pagination
    return this.prisma.category.findMany({
      where,
      include: { products: true },
      orderBy: {
        [sortBy]: sortOrder,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.category.findUnique({
      where: { id },
      include: { products: true },
    });
  }
  async update(id: string, dto: Partial<CreateCategoryDto>) {
  // تحقق إذا موجود
  const category = await this.prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new Error('Category not found');
  }

  // تحقق من تكرار الاسم
  if (dto.name) {
    const exists = await this.prisma.category.findUnique({
      where: { name: dto.name },
    });

    if (exists && exists.id !== id) {
      throw new ConflictException('Category already exists');
    }
  }

  return this.prisma.category.update({
    where: { id },
    data: dto,
  });
}

  async remove(id: string) {
    return this.prisma.category.delete({
      where: { id },
    });
  }
}