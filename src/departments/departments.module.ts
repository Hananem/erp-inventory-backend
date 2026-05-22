import { Module } from '@nestjs/common';
import { DepartmentService } from './departments.service';
import { DepartmentController } from './departments.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DepartmentController],
  providers: [DepartmentService],
})
export class DepartmentsModule {}