import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // 🟢 CREATE USER (كما هو بدون تغيير)
  async create(name: string, email: string, password: string, role: string) {
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) throw new ConflictException('البريد الإلكتروني مستخدم مسبقاً');

    const hashed = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: { name, email, password: hashed, role: role as any },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
  }

  // 🟢 FIND ALL (تحديث: إضافة الـ Filter + Pagination)
  async findAll(query: any) {
    const {
      search,      // للبحث عن طريق الاسم أو البريد الإلكتروني
      role,        // لتصفية المستخدمين بحسب الصلاحية (ADMIN, USER, إلخ)
      page = 1,
      perPage = 10,
      paginate = 'true',
    } = query;

    const isPaginated = paginate === 'true';

    // بناء شروط التصفية (Where Clause)
    const where: any = {
      role: role || undefined,
    };

    // إضافة منطق البحث الفضفاض (Insensitive Case-insensitive Search)
    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // الـ Fields التي نود إرجاعها لحماية كلمة المرور (Select Object)
    const selectFields = {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    };

    // 1️⃣ في حال تفعيل الترقيم (Pagination)
    if (isPaginated) {
      const data = await this.prisma.user.findMany({
        where,
        select: selectFields,
        skip: (Number(page) - 1) * Number(perPage),
        take: Number(perPage),
        orderBy: { createdAt: 'desc' }, // ترتيب من الأحدث للأقدم
      });

      // حساب العدد الكلي للمستخدمين المطابقين للشروط
      const total = await this.prisma.user.count({ where });

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

    // 2️⃣ في حال طلب جلب كل البيانات دفعة واحدة بدون ترقيم (paginate = 'false')
    return this.prisma.user.findMany({
      where,
      select: selectFields,
      orderBy: { createdAt: 'desc' },
    });
  }

  // 🟢 REMOVE USER (كما هو بدون تغيير)
  async remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}