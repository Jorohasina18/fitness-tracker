import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Exercise, ExerciseSchema } from './exercise.schema';

export type WorkoutDocument = Workout & Document;

@Schema()
export class Workout {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  type: string; // e.g., 'Force', 'Cardio', 'Yoga'

  @Prop({ type: [ExerciseSchema] })
  exercises: Exercise[];

  @Prop({ type: String })
  notes: string;

  @Prop({ required: false })
  targetMuscle: string; // e.g., 'Arms', 'Legs', 'Full Body'

  @Prop({ required: false })
  intensity: string; // e.g., 'Low', 'Moderate', 'High'

  @Prop({ default: 'completed' })
  status: string; // 'planned', 'completed'

  @Prop()
  difficulty: string; // 'easy', 'medium', 'hard'

  @Prop()
  timeSpent: number; // minutes

  @Prop()
  caloriesBurned: number;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const WorkoutSchema = SchemaFactory.createForClass(Workout);
