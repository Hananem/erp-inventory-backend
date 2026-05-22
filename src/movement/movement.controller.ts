import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { MovementService } from './movement.service.js';
import { CreateMovementDto } from './dto/create-movement.dto.js';

@Controller('movements')
export class MovementController {
  constructor(private movementService: MovementService) {}

  @Post()
  create(@Body() dto: CreateMovementDto) {
    return this.movementService.create(dto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.movementService.findAll(query);
  }
}