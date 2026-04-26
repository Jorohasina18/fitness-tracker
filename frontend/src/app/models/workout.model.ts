export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  unit?: string;
  rpe?: number;
  notes?: string;
  volume?: number;
}

export interface Workout {
  _id?: string;
  userId?: string;
  date: Date | string;
  type: string;
  exercises: Exercise[];
  notes?: string;
  targetMuscle?: string;
  intensity?: string;
  status?: string; // 'planned', 'completed'
  difficulty?: string; // 'easy', 'medium', 'hard'
  timeSpent?: number;
  caloriesBurned?: number;
  painLevel?: number;
  sleepQuality?: number;
  energyLevel?: number;
  createdAt?: Date;
}
