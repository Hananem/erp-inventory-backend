import { Module } from '@nestjs/common';
import { SuppliersService } from './suppliers.service.js';
import { SuppliersController } from './suppliers.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  controllers: [SuppliersController],
  providers: [SuppliersService, PrismaService],
})
export class SuppliersModule {}