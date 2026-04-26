import { IsString, IsNotEmpty, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreateGoalDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  targetValue: number;

  @IsNumber()
  @IsNotEmpty()
  startValue: number;

  @IsNumber()
  @IsNotEmpty()
  currentValue: number;

  @IsString()
  @IsNotEmpty()
  unit: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: Date;

  @IsDateString()
  @IsNotEmpty()
  endDate: Date;
  @IsString()
  @IsOptional()
  category?: string;

  @IsNumber()
  @IsOptional()
  duration?: number;

  @IsNumber()
  @IsOptional()
  frequency?: number;
}
