import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UsePipes, ValidationPipe } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  @UsePipes(ValidationPipe)
  create(@Body() createGoalDto: CreateGoalDto, @Request() req) {
    return this.goalsService.create(createGoalDto, req.user.userId);
  }

  @Get()
  findAll(@Request() req) {
    return this.goalsService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.goalsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @UsePipes(ValidationPipe)
  update(@Param('id') id: string, @Body() updateGoalDto: CreateGoalDto, @Request() req) {
    return this.goalsService.update(id, updateGoalDto, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.goalsService.remove(id, req.user.userId);
  }
}
