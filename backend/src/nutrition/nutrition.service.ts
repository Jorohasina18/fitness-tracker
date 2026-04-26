import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Meal, MealDocument } from './schemas/meal.schema';
import { CreateMealDto } from './dto/create-meal.dto';

@Injectable()
export class NutritionService {
  constructor(@InjectModel(Meal.name) private mealModel: Model<MealDocument>) {}

  async create(createMealDto: CreateMealDto, userId: Types.ObjectId): Promise<Meal> {
    const createdMeal = new this.mealModel({ ...createMealDto, userId });
    return createdMeal.save();
  }

  async findAll(userId: Types.ObjectId): Promise<Meal[]> {
    return this.mealModel.find({ userId }).exec();
  }

  async findOne(id: string, userId: Types.ObjectId): Promise<Meal> {
    return this.mealModel.findOne({ _id: id, userId }).exec();
  }

  async update(id: string, updateMealDto: CreateMealDto, userId: Types.ObjectId): Promise<Meal> {
    return this.mealModel.findOneAndUpdate({ _id: id, userId }, updateMealDto, { new: true }).exec();
  }

  async remove(id: string, userId: Types.ObjectId): Promise<any> {
    return this.mealModel.deleteOne({ _id: id, userId }).exec();
  }

  async getDailyMacros(userId: Types.ObjectId, date: Date): Promise<any> {
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const result = await this.mealModel.aggregate([
      { $match: { userId: userId, date: { $gte: startOfDay, $lte: endOfDay } } },
      { $unwind: '$foodItems' },
      { $group: {
          _id: null,
          totalCalories: { $sum: '$foodItems.calories' },
          totalProtein: { $sum: '$foodItems.protein' },
          totalCarbs: { $sum: '$foodItems.carbs' },
          totalFat: { $sum: '$foodItems.fat' },
        }
      },
    ]).exec();

    return result.length > 0 ? result[0] : { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 };
  }
}
