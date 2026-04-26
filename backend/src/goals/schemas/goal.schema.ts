import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type GoalDocument = Goal & Document;

@Schema()
export class Goal {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  name: string; // e.g., 'Perdre 5kg', 'Courir 10km'

  @Prop({ required: true })
  targetValue: number;

  @Prop({ required: true, default: 0 })
  startValue: number;

  @Prop({ required: true, default: 0 })
  currentValue: number;

  @Prop({ required: true })
  unit: string; // e.g., 'kg', 'km', 'minutes'

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ default: 'active' })
  status: string; // e.g., 'active', 'completed', 'failed'

  @Prop({ required: false })
  category: string; // e.g., 'weight_loss', 'muscle_gain', 'endurance', 'health'

  @Prop({ default: 30 })
  duration: number; // days

  @Prop({ default: 3 })
  frequency: number; // sessions per week

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const GoalSchema = SchemaFactory.createForClass(Goal);
