import { Module } from '@nestjs/common';
import { StockService } from './stock.service.js';
import { StockController } from './stock.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  controllers: [StockController],
  providers: [StockService, PrismaService],
  exports: [StockService],
})
export class StockModule {}