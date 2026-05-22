import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service.js';
import { CustomersController } from './customers.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  controllers: [CustomersController],
  providers: [CustomersService, PrismaService],
})
export class CustomersModule {}