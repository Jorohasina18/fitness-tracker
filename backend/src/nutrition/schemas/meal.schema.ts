import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { FoodItem, FoodItemSchema } from './food-item.schema';

export type MealDocument = Meal & Document;

@Schema()
export class Meal {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  type: string; // e.g., 'Breakfast', 'Lunch', 'Dinner', 'Snack'

  @Prop({ type: [FoodItemSchema] })
  foodItems: FoodItem[];

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const MealSchema = SchemaFactory.createForClass(Meal);
