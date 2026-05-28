import { Injectable } from '@nestjs/common';
import { Permission } from '@prisma/client';

@Injectable()
export class PermissionsService {
  
  // دالة داخلية تحتوي على النصوص والوصف العربي لكل صلاحية في قاعدة البيانات
  private getPermissionsMetadata() {
    const descriptions: Record<Permission, { name: string; module: string; description: string }> = {
      VIEW_DASHBOARD: { name: 'عرض لوحة التحكم', module: 'الرئيسية', description: 'السماح برؤية الإحصائيات العامة للمخازن والمبيعات' },
      MANAGE_PRODUCTS: { name: 'إدارة المنتجات', module: 'المخزون', description: 'إضافة، تعديل، وحذف المنتجات وبياناتها' },
      MANAGE_CATEGORIES: { name: 'إدارة الأقسام', module: 'المخزون', description: 'التحكم في تصنيفات المنتجات المتاحة' },
      MANAGE_WAREHOUSES: { name: 'إدارة المستودعات', module: 'المخزون', description: 'إضافة مستودعات جديدة وتعديل مواقعها' },
      MANAGE_STOCK: { name: 'إدارة حركات المخزون', module: 'المخزون', description: 'تسوية الجرد، تحويل الكميات، ومتابعة الأرصدة' },
      MANAGE_SUPPLIERS: { name: 'إدارة الموردين', module: 'المشتريات', description: 'التحكم في سجلات الموردين وبيانات التواصل' },
      MANAGE_CUSTOMERS: { name: 'إدارة العملاء', module: 'المبيعات', description: 'التحكم في سجلات العملاء وحساباتهم الأنشطة' },
      MANAGE_SALES: { name: 'إدارة المبيعات', module: 'المبيعات', description: 'إنشاء فواتير المبيعات وتأكيد الطلبات الصادرة' },
      MANAGE_PURCHASES: { name: 'إدارة المشتريات', module: 'المشتريات', description: 'إنشاء أوامر الشراء وتأكيد دخول البضائع للمخازن' },
    };

    // تحويل الـ Enum القادم من الـ Prisma Client إلى مصفوفة كائنات تناسب الجدول
    return Object.values(Permission).map((key) => ({
      id: key,
      key: key,
      name: descriptions[key]?.name || key,
      module: descriptions[key]?.module || 'عام',
      description: descriptions[key]?.description || '—',
    }));
  }

  // الدالة الرئيسية لجلب وتصفية الصلاحيات
  async findAll(query: any) {
    const { search } = query;
    let list = this.getPermissionsMetadata();

    if (search) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.key.toLowerCase().includes(q) ||
          p.module.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    return list;
  }
}