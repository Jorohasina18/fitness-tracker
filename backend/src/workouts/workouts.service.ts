import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Workout, WorkoutDocument } from './schemas/workout.schema';
import { CreateWorkoutDto } from './dto/create-workout.dto';

@Injectable()
export class WorkoutsService {
  constructor(@InjectModel(Workout.name) private workoutModel: Model<WorkoutDocument>) {}

  async create(createWorkoutDto: CreateWorkoutDto, userId: Types.ObjectId): Promise<Workout> {
    const createdWorkout = new this.workoutModel({ ...createWorkoutDto, userId });
    return createdWorkout.save();
  }

  async findAll(userId: Types.ObjectId): Promise<Workout[]> {
    return this.workoutModel.find({ userId }).exec();
  }

  async findOne(id: string, userId: Types.ObjectId): Promise<Workout> {
    return this.workoutModel.findOne({ _id: id, userId }).exec();
  }

  async update(id: string, updateWorkoutDto: CreateWorkoutDto, userId: Types.ObjectId): Promise<Workout> {
    return this.workoutModel.findOneAndUpdate({ _id: id, userId }, updateWorkoutDto, { new: true }).exec();
  }

  async remove(id: string, userId: Types.ObjectId): Promise<any> {
    return this.workoutModel.deleteOne({ _id: id, userId }).exec();
  }

  async getMonthlyStats(userId: Types.ObjectId, year: number, month: number): Promise<any[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return this.workoutModel.aggregate([
      { $match: { userId: userId, date: { $gte: startDate, $lte: endDate } } },
      { $unwind: '$exercises' },
      { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalWeightLifted: { $sum: { $multiply: ['$exercises.weight', '$exercises.sets', '$exercises.reps'] } },
          totalExercises: { $sum: 1 },
          workoutTypes: { $addToSet: '$type' }
        }
      },
      { $sort: { _id: 1 } }
    ]).exec();
  }
}
