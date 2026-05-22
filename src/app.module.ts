import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { ProductsModule } from './products/products.module.js';
import { CategoryModule } from './category/category.module';
import { WarehouseModule } from './warehouse/warehouse.module';
import { StockModule } from './stock/stock.module';
import { MovementModule } from './movement/movement.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { PurchaseModule } from './purchase/purchase.module';
import { SalesModule } from './sales/sales.module';
import { CustomersModule } from './customers/customers.module';
import { InvoicesModule } from './invoices/invoices.module';
import { DepartmentsModule } from './departments/departments.module';
import { PositionsModule } from './positions/positions.module';
import { EmployeesModule } from './employees/employees.module';
import { ActivityLogModule } from './activity-log/activity-log.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoryModule,
    WarehouseModule,
    StockModule,
    MovementModule,
    SuppliersModule,
    PurchaseModule,
    SalesModule,
    CustomersModule,
    InvoicesModule,
    DepartmentsModule,
    PositionsModule,
    EmployeesModule,
    ActivityLogModule,
  ],
})
export class AppModule {}