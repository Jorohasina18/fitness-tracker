import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsNumber()
  @IsOptional()
  currentWeight?: number;

  @IsNumber()
  @IsOptional()
  targetWeight?: number;

  @IsNumber()
  @IsOptional()
  height?: number;

  @IsDateString()
  @IsOptional()
  birthDate?: Date;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  activityLevel?: string;

  @IsString()
  @IsOptional()
  level?: string;

  @IsNumber()
  @IsOptional()
  age?: number;
}
