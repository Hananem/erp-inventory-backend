import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '@prisma/client';

@Injectable()
export class DepartmentService {
  constructor(private prisma: PrismaService) {}

  async create(dto: { name: string }) {
    const exists = await this.prisma.department.findUnique({
      where: { name: dto.name },
    });

    if (exists) {
      throw new ConflictException('Department already exists');
    }

    return this.prisma.department.create({
      data: dto,
    });
  }

  async findAll(query: any) {
    const {
      search,
      page = 1,
      perPage = 10,
      paginate = 'true',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const isPaginated = paginate === 'true';

    const where: Prisma.DepartmentWhereInput = {
      name: search
        ? {
            contains: search,
            mode: 'insensitive',
          }
        : undefined,
    };

    // ✅ pagination ON
    if (isPaginated) {
      const data = await this.prisma.department.findMany({
        where,
        include: { employees: true },
        skip: (Number(page) - 1) * Number(perPage),
        take: Number(perPage),
        orderBy: {
          [sortBy]: sortOrder,
        },
      });

      const total = await this.prisma.department.count({ where });

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

    // ❌ بدون pagination
    return this.prisma.department.findMany({
      where,
      include: { employees: true },
      orderBy: {
        [sortBy]: sortOrder,
      },
    });
  }

  async findOne(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: { employees: true },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return department;
  }

  async update(id: string, data: { name?: string }) {
    await this.findOne(id);

    return this.prisma.department.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.department.delete({
      where: { id },
    });
  }
}