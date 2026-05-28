import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common'; // 👈 أضفنا استيراد Query هنا
import { UsersService } from './users.service.js';

class CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: string;
}

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  create(@Body() body: CreateUserDto) {
    return this.usersService.create(body.name, body.email, body.password, body.role);
  }

  @Get()
  findAll(@Query() query: any) { // 👈 استقبلنا الـ Query params القادمة من المتصفح هنا
    return this.usersService.findAll(query); // 👈 قمنا بتمريها للـ Service لتنفيذ الفلترة والترقيم
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}