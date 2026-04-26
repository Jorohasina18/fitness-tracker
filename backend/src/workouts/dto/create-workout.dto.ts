import { IsString, IsNotEmpty, IsDateString, IsArray, ValidateNested, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateExerciseDto } from './create-exercise.dto';

export class CreateWorkoutDto {
  @IsDateString()
  @IsNotEmpty()
  date: Date;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExerciseDto)
  exercises: CreateExerciseDto[];

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  targetMuscle?: string;

  @IsString()
  @IsOptional()
  intensity?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  difficulty?: string;

  @IsNumber()
  @IsOptional()
  timeSpent?: number;

  @IsNumber()
  @IsOptional()
  caloriesBurned?: number;
}
