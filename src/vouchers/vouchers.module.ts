import { Module } from '@nestjs/common';
import { VouchersService } from './vouchers.service.js';
import { VouchersController } from './vouchers.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [VouchersController],
  providers: [VouchersService],
})
export class VouchersModule {}
