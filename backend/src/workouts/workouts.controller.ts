import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UsePipes, ValidationPipe } from '@nestjs/common';
import { WorkoutsService } from './workouts.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('workouts')
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  @Post()
  @UsePipes(ValidationPipe)
  create(@Body() createWorkoutDto: CreateWorkoutDto, @Request() req) {
    return this.workoutsService.create(createWorkoutDto, req.user.userId);
  }

  @Get()
  findAll(@Request() req) {
    return this.workoutsService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.workoutsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @UsePipes(ValidationPipe)
  update(@Param('id') id: string, @Body() updateWorkoutDto: CreateWorkoutDto, @Request() req) {
    return this.workoutsService.update(id, updateWorkoutDto, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.workoutsService.remove(id, req.user.userId);
  }

  @Get('stats/monthly/:year/:month')
  getMonthlyStats(@Param('year') year: number, @Param('month') month: number, @Request() req) {
    return this.workoutsService.getMonthlyStats(req.user.userId, year, month);
  }
}
