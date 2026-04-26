import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FoodItemDocument = FoodItem & Document;

@Schema()
export class FoodItem {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Number, required: true })
  calories: number;

  @Prop({ type: Number, required: true })
  protein: number; // in grams

  @Prop({ type: Number, required: true })
  carbs: number; // in grams

  @Prop({ type: Number, required: true })
  fat: number; // in grams

  @Prop({ type: Number, required: true })
  quantity: number; // e.g., 100g, 1 unit

  @Prop({ type: String })
  unit: string; // e.g., 'g', 'ml', 'unité'
}

export const FoodItemSchema = SchemaFactory.createForClass(FoodItem);
