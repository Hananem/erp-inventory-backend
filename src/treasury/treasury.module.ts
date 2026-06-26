import { Module } from '@nestjs/common';
import { TreasuryService } from './treasury.service.js';
import { TreasuryController } from './treasury.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [TreasuryController],
  providers: [TreasuryService],
})
export class TreasuryModule {}
