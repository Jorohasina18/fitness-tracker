import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop()
  currentWeight: number;

  @Prop()
  targetWeight: number;

  @Prop()
  height: number;

  @Prop()
  birthDate: Date;

  @Prop()
  gender: string;

  @Prop()
  activityLevel: string; // e.g., 'sedentary', 'active', 'very_active'

  @Prop({ default: 'beginner' })
  level: string; // 'beginner', 'intermediate', 'advanced'

  @Prop()
  age: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
