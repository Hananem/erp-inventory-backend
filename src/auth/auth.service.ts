import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    // 🟢 قمنا بتعديل الاستعلام لتضمين بيانات جدول الـ Role الجديد المرتبط بالمستخدم
    const user = await this.prisma.user.findUnique({ 
      where: { email },
      include: {
        role: true // جلب بيانات الدور بالكامل من قاعدة البيانات
      }
    });

    if (!user) throw new UnauthorizedException('البريد أو كلمة المرور غير صحيحة');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('البريد أو كلمة المرور غير صحيحة');

    // 🟢 قمنا بتغيير user.role إلى user.role?.name لاستخراج النص ("ADMIN" أو "محاسب" إلخ) بشكل آمن
    const token = this.jwt.sign({ sub: user.id, email: user.email, role: user.role?.name });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role?.name, // 🟢 إرجاع اسم الدور للفرونت اند
      },
    };
  }
}