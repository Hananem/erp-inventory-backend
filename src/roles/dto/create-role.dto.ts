import { Permission } from '@prisma/client';

export class CreateRoleDto {
  name: string;
  description?: string;
  
  // نحدد هنا أن الصلاحيات قادمة كمصفوفة من الـ Enum المعرف في الـ Prisma
  permissions: Permission[]; 
}