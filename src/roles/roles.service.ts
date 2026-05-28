import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Permission } from '@prisma/client';

export interface CreateRoleDto {
  name: string;
  description?: string;
  permissions: Permission[]; // الصلاحيات القادمة من الـ Checkboxes
}

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  // 🟢 1. إنشاء دور جديد
  async create(dto: CreateRoleDto) {
    const exists = await this.prisma.role.findUnique({ where: { name: dto.name } });
    if (exists) throw new ConflictException('اسم هذا الدور موجود مسبقاً');

    return this.prisma.role.create({
      data: {
        name: dto.name,
        description: dto.description,
        permissions: {
          create: dto.permissions.map((perm) => ({ permission: perm })),
        },
      },
    });
  }

  // 🟢 2. جلب وتصفية الأدوار (البحث والترقيم الكامل)
  async findAll(query: any) {
    const { search, page = 1, perPage = 8 } = query;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // جلب البيانات مع حساب عدد المستخدمين وتضمين الصلاحيات
    const rawData = await this.prisma.role.findMany({
      where,
      include: {
        _count: { select: { users: true } },
        permissions: { select: { permission: true } },
      },
      skip: (Number(page) - 1) * Number(perPage),
      take: Number(perPage),
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.role.count({ where });

    // تحويل هيكلية البيانات لتطابق ما يتوقعه الفرونت اند تماماً
    const data = rawData.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      userCount: role._count.users,
      permissions: role.permissions.map((p) => p.permission), // مصفوفة نصوص [MANAGE_PRODUCTS, ...]
    }));

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

  // 🟢 3. تحديث دور موجود وصلاحياته
  async update(id: string, dto: CreateRoleDto) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) throw new NotFoundException('الدور غير موجود');

    return this.prisma.$transaction(async (tx) => {
      // حذف الصلاحيات القديمة للدور أولاً
      await tx.rolePermission.deleteMany({ where: { roleId: id } });

      // تحديث البيانات الأساسية وحقن الصلاحيات الجديدة
      return tx.role.update({
        where: { id },
        data: {
          name: dto.name,
          description: dto.description,
          permissions: {
            create: dto.permissions.map((perm) => ({ permission: perm })),
          },
        },
      });
    });
  }

  // 🟢 4. حذف دور
  async remove(id: string) {
    return this.prisma.role.delete({ where: { id } });
  }
}