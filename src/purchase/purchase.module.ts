import { Module } from '@nestjs/common';
import { PurchaseService } from './purchase.service.js';
import { PurchaseController } from './purchase.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  controllers: [PurchaseController],
  providers: [PurchaseService, PrismaService],
})
export class PurchaseModule {}
