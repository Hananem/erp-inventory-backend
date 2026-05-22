import { Module } from '@nestjs/common';
import { MovementService } from './movement.service.js';
import { MovementController } from './movement.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  controllers: [MovementController],
  providers: [MovementService, PrismaService],
})
export class MovementModule {}