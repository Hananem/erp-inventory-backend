import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ActivityType, Prisma } from '@prisma/client';

@Injectable()
export class ActivityLogService {
  constructor(private prisma: PrismaService) {}

  async log(data: {
    type: ActivityType;
    actorId?: string;
    entityType: string;
    entityId: string;
    delta?: object;
    metadata?: object;
  }) {
    return this.prisma.activityLog.create({ data });
  }

  async findAll(query: any) {
    const {
      page = 1,
      perPage = 20,
      type,
      entityType,
      actorId,
    } = query;

    const where: Prisma.ActivityLogWhereInput = {
      ...(type && { type }),
      ...(entityType && { entityType }),
      ...(actorId && { actorId }),
    };

    const [data, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        include: { actor: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(perPage),
        take: Number(perPage),
      }),
      this.prisma.activityLog.count({ where }),
    ]);

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

  async getInsights() {
    const since = new Date(Date.now() - 3 * 60 * 60 * 1000); // آخر 3 ساعات

    const [recentCount, todayCount, byType] = await Promise.all([
      this.prisma.activityLog.count({ where: { createdAt: { gte: since } } }),
      this.prisma.activityLog.count({
        where: { createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } },
      }),
      this.prisma.activityLog.groupBy({
        by: ['type'],
        _count: true,
        where: { createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } },
        orderBy: { _count: { type: 'desc' } },
      }),
    ]);

    return { recentCount, todayCount, byType };
  }
}