import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service.js';
import { PermissionsController } from './permissions.controller.js';

@Module({
  controllers: [PermissionsController], // تسجيل المتحكم المسؤول عن مسار /permissions
  providers: [PermissionsService],     // تسجيل الخدمة التي تحتوي على المنطق البرمجي للـ Enums
})
export class PermissionsModule {}