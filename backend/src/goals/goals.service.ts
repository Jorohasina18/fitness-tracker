import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Goal, GoalDocument } from './schemas/goal.schema';
import { CreateGoalDto } from './dto/create-goal.dto';

@Injectable()
export class GoalsService {
  constructor(@InjectModel(Goal.name) private goalModel: Model<GoalDocument>) {}

  async create(createGoalDto: CreateGoalDto, userId: Types.ObjectId): Promise<Goal> {
    const createdGoal = new this.goalModel({ ...createGoalDto, userId });
    return createdGoal.save();
  }

  async findAll(userId: Types.ObjectId): Promise<Goal[]> {
    return this.goalModel.find({ userId }).exec();
  }

  async findOne(id: string, userId: Types.ObjectId): Promise<Goal> {
    return this.goalModel.findOne({ _id: id, userId }).exec();
  }

  async update(id: string, updateGoalDto: CreateGoalDto, userId: Types.ObjectId): Promise<Goal> {
    return this.goalModel.findOneAndUpdate({ _id: id, userId }, updateGoalDto, { new: true }).exec();
  }

  async remove(id: string, userId: Types.ObjectId): Promise<any> {
    return this.goalModel.deleteOne({ _id: id, userId }).exec();
  }
}
