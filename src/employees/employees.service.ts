import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '@prisma/client';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  create(dto: any) {
    return this.prisma.employee.create({
      data: dto,
    });
  }

  async findAll(query: any) {
    const {
      search,
      departmentId,
      positionId,
      page = 1,
      perPage = 10,
      paginate = 'true',
    } = query;

    const where: Prisma.EmployeeWhereInput = {
      OR: search
        ? [
            {
              name: { contains: search, mode: 'insensitive' },
            },
            {
              email: { contains: search, mode: 'insensitive' },
            },
          ]
        : undefined,

      departmentId: departmentId || undefined,
      positionId: positionId || undefined,
    };

    const isPaginated = paginate === 'true';

    if (isPaginated) {
      const data = await this.prisma.employee.findMany({
        where,
        include: {
          department: true,
          position: true,
        },
        skip: (Number(page) - 1) * Number(perPage),
        take: Number(perPage),
        orderBy: { createdAt: 'desc' },
      });

      const total = await this.prisma.employee.count({ where });

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

    return this.prisma.employee.findMany({
      where,
      include: {
        department: true,
        position: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        position: true,
      },
    });
  }

  remove(id: string) {
    return this.prisma.employee.delete({
      where: { id },
    });
  }
}