import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NutritionService } from '../../services/nutrition.service';
import { AuthService } from '../../services/auth.service';
import { GoalService } from '../../services/goal.service';
import { RecommendationService } from '../../services/recommendation.service';
import { WorkoutService } from '../../services/workout.service';
import { Meal, DailyMacros } from '../../models/nutrition.model';
import { Goal } from '../../models/goal.model';
import { Workout } from '../../models/workout.model';

@Component({
  selector: 'app-nutrition',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './nutrition.component.html',
  styleUrls: ['./nutrition.component.scss']
})
export class NutritionComponent implements OnInit {
  meals: Meal[] = [];
  mealForm: FormGroup;
  loading = false;
  submitted = false;
  showForm = false;
  currentUser: any;
  dailyMacros: DailyMacros | null = null;
  activeGoals: Goal[] = [];
  guidance: any = null;
  mealPlan: any = null;

  constructor(
    private nutritionService: NutritionService,
    private authService: AuthService,
    private goalService: GoalService,
    private recommendationService: RecommendationService,
    private workoutService: WorkoutService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.currentUser = this.authService.currentUserValue;
    this.mealForm = this.formBuilder.group({
      date: ['', Validators.required],
      type: ['', Validators.required],
      foodItems: this.formBuilder.array([]),
    });
  }

  ngOnInit(): void {
    this.loadMeals();
    this.loadActiveGoals();
  }

  loadActiveGoals(): void {
    this.goalService.getGoals().subscribe(goals => {
      this.activeGoals = goals.filter(g => g.status === 'active');
      this.updateGuidance();
    });
  }

  updateGuidance(): void {
    const mainGoal = this.activeGoals[0];
    
    // Fetch workouts to find the next planned session type
    this.workoutService.getWorkouts().subscribe(workouts => {
      const nextWorkout = workouts.find((w: Workout) => w.status !== 'completed');
      const workoutType = nextWorkout?.type || 'Autre';

      this.guidance = this.recommendationService.getNutritionGuidance(mainGoal?.category, workoutType);
      
      // Update the recommendation service to accept workoutType for meals
      this.mealPlan = this.recommendationService.getDailyMealPlan(mainGoal?.category, this.currentUser?.level, workoutType);
    });
  }

  generateAIPlan(): void {
    if (!this.mealPlan) return;
    this.loading = true;

    const mealsToAdd = Object.values(this.mealPlan).map((m: any) => ({
      date: new Date(),
      type: m.type,
      foodItems: [{
        name: m.name,
        calories: m.calories,
        protein: m.protein,
        carbs: m.carbs,
        fat: m.fat,
        quantity: 1,
        unit: 'portion'
      }]
    }));

    // Sequential creation to avoid race conditions or overwhelming backend
    let count = 0;
    mealsToAdd.forEach(meal => {
      this.nutritionService.createMeal(meal as any).subscribe({
        next: () => {
          count++;
          if (count === mealsToAdd.length) {
            this.loadMeals();
            alert('Menu complet ajouté avec succès pour aujourd\'hui !');
          }
        }
      });
    });
  }

  loadMeals(): void {
    this.loading = true;
    this.nutritionService.getMeals().subscribe({
      next: (meals) => {
        this.meals = meals;
        this.calculateDailyMacros();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading meals:', error);
        this.loading = false;
      }
    });
  }

  calculateDailyMacros(): void {
    const today = new Date();
    const todayMeals = this.meals.filter(meal => {
      const mealDate = new Date(meal.date);
      return mealDate.toDateString() === today.toDateString();
    });

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    todayMeals.forEach(meal => {
      meal.foodItems.forEach(item => {
        totalCalories += item.calories * item.quantity;
        totalProtein += item.protein * item.quantity;
        totalCarbs += item.carbs * item.quantity;
        totalFat += item.fat * item.quantity;
      });
    });

    this.dailyMacros = {
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat
    };
  }

  get f() { return this.mealForm.controls; }

  get foodItems() {
    return this.mealForm.get('foodItems') as FormArray;
  }

  addFoodItem(): void {
    const foodForm = this.formBuilder.group({
      name: ['', Validators.required],
      calories: [0, [Validators.required, Validators.min(0)]],
      protein: [0, [Validators.required, Validators.min(0)]],
      carbs: [0, [Validators.required, Validators.min(0)]],
      fat: [0, [Validators.required, Validators.min(0)]],
      quantity: [1, [Validators.required, Validators.min(0.1)]],
      unit: ['portion']
    });
    this.foodItems.push(foodForm);
  }

  removeFoodItem(index: number): void {
    this.foodItems.removeAt(index);
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.mealForm.invalid) {
      return;
    }

    this.loading = true;
    const formValue = this.mealForm.value;
    const meal: Meal = {
      date: new Date(formValue.date),
      type: formValue.type,
      foodItems: formValue.foodItems || [],
    };

    this.nutritionService.createMeal(meal).subscribe({
      next: () => {
        this.mealForm.reset();
        this.submitted = false;
        this.showForm = false;
        this.loadMeals();
      },
      error: (error) => {
        console.error('Error creating meal:', error);
        this.loading = false;
      }
    });
  }

  deleteMeal(id: string | undefined): void {
    if (id && confirm('Êtes-vous sûr de vouloir supprimer ce repas?')) {
      this.nutritionService.deleteMeal(id).subscribe({
        next: () => {
          this.loadMeals();
        },
        error: (error) => {
          console.error('Error deleting meal:', error);
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  getMealIcon(type: string): string {
    switch (type) {
      case 'Petit-déjeuner': return '🥣';
      case 'Déjeuner': return '🥗';
      case 'Dîner': return '🍽️';
      case 'Snack': return '🍎';
      default: return '🍴';
    }
  }
}
