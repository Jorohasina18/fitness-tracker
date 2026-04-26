import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WinstonModule } from 'nest-winston';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WorkoutsModule } from './workouts/workouts.module';
import { NutritionModule } from './nutrition/nutrition.module';
import { GoalsModule } from './goals/goals.module';
import { winstonConfig } from './config/winston.config';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://mongodb:27017/fitness-tracker'),
    WinstonModule.forRoot(winstonConfig),
    AuthModule,
    UsersModule,
    WorkoutsModule,
    NutritionModule,
    GoalsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
