export interface Goal {
  _id?: string;
  userId?: string;
  name: string;
  targetValue: number;
  startValue: number;
  currentValue: number;
  unit: string;
  startDate: Date;
  endDate: Date;
  status: string;
  category?: string;
  duration?: number;
  frequency?: number;
  createdAt?: Date;
}
