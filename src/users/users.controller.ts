import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
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
  findAll() {
    return this.usersService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}