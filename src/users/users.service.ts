import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(name: string, email: string, password: string, role: string) {
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) throw new ConflictException('البريد الإلكتروني مستخدم مسبقاً');

    const hashed = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: { name, email, password: hashed, role: role as any },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
  }

  async remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}