import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ExerciseDocument = Exercise & Document;

@Schema()
export class Exercise {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Number, required: true })
  sets: number;

  @Prop({ type: Number, required: true })
  reps: number;

  @Prop({ type: Number })
  weight: number;

  @Prop({ type: String })
  unit: string; // e.g., 'kg', 'lbs'
}

export const ExerciseSchema = SchemaFactory.createForClass(Exercise);
