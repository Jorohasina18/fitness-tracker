export interface User {
  _id?: string;
  username: string;
  password?: string;
  createdAt?: Date;
  currentWeight?: number;
  targetWeight?: number;
  height?: number;
  birthDate?: Date;
  gender?: string;
  activityLevel?: string;
  level?: string;
  age?: number;
  photo?: string;
}
