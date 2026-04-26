import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateFoodItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  calories: number;

  @IsNumber()
  @IsNotEmpty()
  protein: number;

  @IsNumber()
  @IsNotEmpty()
  carbs: number;

  @IsNumber()
  @IsNotEmpty()
  fat: number;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsString()
  @IsOptional()
  unit?: string;
}
