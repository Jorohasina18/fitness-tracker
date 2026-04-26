import { IsString, IsNotEmpty, IsDateString, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateFoodItemDto } from './create-food-item.dto';

export class CreateMealDto {
  @IsDateString()
  @IsNotEmpty()
  date: Date;

  @IsString()
  @IsNotEmpty()
  type: string; // e.g., 'Breakfast', 'Lunch', 'Dinner', 'Snack'

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFoodItemDto)
  foodItems: CreateFoodItemDto[];

  @IsString()
  @IsOptional()
  notes?: string;
}
