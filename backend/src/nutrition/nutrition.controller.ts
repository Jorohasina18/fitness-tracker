import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UsePipes, ValidationPipe } from '@nestjs/common';
import { NutritionService } from './nutrition.service';
import { CreateMealDto } from './dto/create-meal.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('nutrition')
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @Post()
  @UsePipes(ValidationPipe)
  create(@Body() createMealDto: CreateMealDto, @Request() req) {
    return this.nutritionService.create(createMealDto, req.user.userId);
  }

  @Get()
  findAll(@Request() req) {
    return this.nutritionService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.nutritionService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @UsePipes(ValidationPipe)
  update(@Param('id') id: string, @Body() updateMealDto: CreateMealDto, @Request() req) {
    return this.nutritionService.update(id, updateMealDto, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.nutritionService.remove(id, req.user.userId);
  }

  @Get('macros/daily/:year/:month/:day')
  getDailyMacros(
    @Param('year') year: number,
    @Param('month') month: number,
    @Param('day') day: number,
    @Request() req,
  ) {
    const date = new Date(year, month - 1, day);
    return this.nutritionService.getDailyMacros(req.user.userId, date);
  }
}
