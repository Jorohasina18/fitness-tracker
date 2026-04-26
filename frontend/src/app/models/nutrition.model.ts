export interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: number;
  unit?: string;
}

export interface Meal {
  _id?: string;
  userId?: string;
  date: Date;
  type: string;
  foodItems: FoodItem[];
  createdAt?: Date;
}

export interface DailyMacros {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}
