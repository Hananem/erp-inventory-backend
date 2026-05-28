import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { Prisma } from '@prisma/client';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  // ✅ CREATE
  async create(dto: CreateCustomerDto) {
    if (dto.email) {
      const exists = await this.prisma.customer.findFirst({
        where: { email: dto.email },
      });

      if (exists) {
        throw new ConflictException('Email already used');
      }
    }

  return this.prisma.customer.create({
  data: {
    name: dto.name,
    phone: dto.phone,
        email: dto.email,
    address: dto.address,
  },
});
  }

  // ✅ GET ALL (Search + Pagination + Sorting)
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

    const where: Prisma.CustomerWhereInput = {};

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
          email: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          phone: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      ];
    }

    // ✅ PAGINATION ON
    if (isPaginated) {
      const data = await this.prisma.customer.findMany({
        where,
        include: {
          _count: {
            select: { salesOrders: true },
          },
        },
        skip: (Number(page) - 1) * Number(perPage),
        take: Number(perPage),
        orderBy: {
          [sortBy]: sortOrder,
        },
      });

      const total = await this.prisma.customer.count({ where });

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
    return this.prisma.customer.findMany({
      where,
      include: {
        _count: {
          select: { salesOrders: true },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
    });
  }

  // ✅ GET ONE
  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        salesOrders: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  // ✅ UPDATE
  async update(id: string, dto: Partial<CreateCustomerDto>) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // تحقق من email
    if (dto.email) {
      const exists = await this.prisma.customer.findFirst({
        where: { email: dto.email },
      });

      if (exists && exists.id !== id) {
        throw new ConflictException('Email already used');
      }
    }

    return this.prisma.customer.update({
      where: { id },
      data: dto,
    });
  }

  // ✅ DELETE (مع حماية)
  async remove(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const orders = await this.prisma.salesOrder.count({
      where: { customerId: id },
    });

    if (orders > 0) {
      throw new ConflictException(
        'Cannot delete customer with existing sales orders',
      );
    }

    return this.prisma.customer.delete({
      where: { id },
    });
  }
}