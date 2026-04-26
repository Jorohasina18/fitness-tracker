import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NutritionService } from './nutrition.service';
import { NutritionController } from './nutrition.controller';
import { Meal, MealSchema } from './schemas/meal.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Meal.name, schema: MealSchema }])],
  providers: [NutritionService],
  controllers: [NutritionController],
})
export class NutritionModule {}
