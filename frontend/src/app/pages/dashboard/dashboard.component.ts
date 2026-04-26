import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { WorkoutService } from '../../services/workout.service';
import { NutritionService } from '../../services/nutrition.service';
import { GoalService } from '../../services/goal.service';
import { UserService } from '../../services/user.service';
import { RecommendationService } from '../../services/recommendation.service';
import { Workout } from '../../models/workout.model';
import { Meal } from '../../models/nutrition.model';
import { Goal } from '../../models/goal.model';
import { DailyMacros } from '../../models/nutrition.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: any;
  recentWorkouts: Workout[] = [];
  recentMeals: Meal[] = [];
  goals: Goal[] = [];
  dailyMacros: DailyMacros = { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 };
  loading = true;
  userProfile: any = { 
    firstName: '', 
    lastName: '', 
    gender: '', 
    currentWeight: 0, 
    targetWeight: 0, 
    height: 0, 
    age: 0,
    activityLevel: '',
    level: 'beginner'
  };
  smartSummary: any = null;
  activeGoal: Goal | null = null;
  showProfileEdit = false;
  nextSessionDate: Date | null = null;
  coachStatus: any = null;
  today: Date = new Date();

  // New interactive states
  searchQuery = '';
  searchResults: any[] = [];
  showSearchResults = false;
  selectedDate: number | null = null;
  showProgressModal = false;
  
  // Advanced Training States
  activeWorkout: Workout | null = null;
  totalVolume = 0;
  calendarDays: any[] = [];
  selectedDateObj: Date = new Date();
  
  // Progress Data
  volumeHistory: any[] = [];
  beforePhoto: string = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&q=80';
  afterPhoto: string = 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=300&q=80';

  constructor(
    private authService: AuthService,
    private workoutService: WorkoutService,
    private nutritionService: NutritionService,
    private goalService: GoalService,
    private userService: UserService,
    private recommendationService: RecommendationService,
    private router: Router
  ) {
    this.currentUser = this.authService.currentUserValue;
  }

  ngOnInit(): void {
    this.loadDashboardData();
    this.generateCalendar();
  }

  loadDashboardData(): void {
    this.loading = true;
    const userId = this.currentUser.id || this.currentUser._id;

    this.userService.getProfile(userId).subscribe(profile => {
      this.userProfile = profile;
    });

    this.workoutService.getWorkouts().subscribe({
      next: (workouts: Workout[]) => {
        this.recentWorkouts = workouts.slice(0, 5);
        this.activeWorkout = this.recentWorkouts[0] || null;
        this.calculateTotalVolume();
        this.generateCalendar();
        this.prepareVolumeHistory();
        this.updateCoachStatus();
        this.updateSmartSummary();
      }
    });

    this.nutritionService.getMeals().subscribe({
      next: (meals: Meal[]) => {
        this.recentMeals = meals.slice(0, 5);
        this.calculateTodayMacros(meals);
        this.updateSmartSummary();
      }
    });

    this.goalService.getGoals().subscribe({
      next: (goals: Goal[]) => {
        this.goals = goals;
        this.activeGoal = goals.find((g: Goal) => g.status === 'active') || null;
        this.calculateNextSession();
        this.updateCoachStatus();
        this.updateSmartSummary();
        this.loading = false;
      }
    });
  }

  calculateNextSession(): void {
    if (!this.activeGoal) {
      this.nextSessionDate = null;
      return;
    }

    if (this.recentWorkouts.length === 0) {
      this.nextSessionDate = new Date();
      return;
    }
    
    const freq = this.activeGoal.frequency || 3;
    const daysInterval = Math.round(7 / freq);
    
    const lastDate = new Date(this.recentWorkouts[0].date);
    const nextDate = new Date(lastDate);
    nextDate.setDate(lastDate.getDate() + daysInterval);
    
    this.nextSessionDate = nextDate;
  }

  updateSmartSummary(): void {
  }

  updateCoachStatus(): void {
    this.coachStatus = this.recommendationService.getCoachStatus(
      this.userProfile,
      this.activeGoal,
      this.recentWorkouts
    );
  }

  onCoachAction(): void {
    if (!this.coachStatus) return;

    switch (this.coachStatus.state) {
      case 'PROFILE_MISSING':
        this.showProfileEdit = true;
        break;
      case 'GOAL_PROPOSED':
        this.acceptAutoGoal();
        break;
      case 'GOAL_MISSING':
        this.router.navigate(['/goals']);
        break;
      case 'FIRST_WORKOUT_PENDING':
        this.router.navigate(['/workouts'], { queryParams: { startSuggested: 'true' } });
        break;
      case 'READY':
        break;
    }
  }

  acceptAutoGoal(): void {
    if (!this.coachStatus?.suggestedGoal) return;
    
    this.loading = true;
    this.goalService.createGoal(this.coachStatus.suggestedGoal).subscribe({
      next: () => {
        this.loadDashboardData();
        alert('Objectif activé ! Vos programmes personnalisés sont prêts.');
      },
      error: (err: any) => {
        console.error('Error accepting goal:', err);
        this.loading = false;
      }
    });
  }

  toggleProfileEdit(): void {
    this.showProfileEdit = !this.showProfileEdit;
  }

  saveProfile(): void {
    const userId = this.currentUser.id || this.currentUser._id;
    this.userService.updateProfile(userId, this.userProfile).subscribe((updatedProfile: any) => {
      this.userProfile = updatedProfile;
      this.authService.updateCurrentUser(updatedProfile);
      this.showProfileEdit = false;
      this.updateCoachStatus();
    });
  }

  calculateTodayMacros(meals: Meal[]): void {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayMeals = meals.filter(m => {
      const mDate = new Date(m.date).toISOString().split('T')[0];
      return mDate === todayStr;
    });
    
    let cal = 0, prot = 0, carbs = 0, fat = 0;
    todayMeals.forEach(meal => {
      meal.foodItems.forEach(item => {
        const qty = item.quantity || 1;
        cal += (item.calories || 0) * qty;
        prot += (item.protein || 0) * qty;
        carbs += (item.carbs || 0) * qty;
        fat += (item.fat || 0) * qty;
      });
    });

    this.dailyMacros = {
      totalCalories: Math.round(cal),
      totalProtein: Math.round(prot * 10) / 10,
      totalCarbs: Math.round(carbs * 10) / 10,
      totalFat: Math.round(fat * 10) / 10
    };
  }

  onPhotoSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.userProfile.photo = e.target.result;
        this.saveProfile();
      };
      reader.readAsDataURL(file);
    }
  }

  getWorkoutIcon(type: string): string {
    switch (type) {
      case 'Force': return '💪';
      case 'Cardio': return '🏃';
      case 'Yoga': return '🧘';
      case 'Flexibilité': return '🤸';
      default: return '🏋️';
    }
  }

  getGoalProgress(goal: Goal): number {
    return this.recommendationService.calculateGoalProgress(goal, this.recentWorkouts);
  }

  getGoalProgressText(goal: Goal): string {
    const unit = goal.unit || 'units';
    return `${goal.currentValue} / ${goal.targetValue} ${unit}`;
  }

  getGoalMessage(goal: Goal): string {
    const diff = Math.abs(goal.targetValue - goal.startValue);
    const remaining = Math.abs((goal.targetValue || 0) - (goal.currentValue || 0));
    
    if (remaining <= 0) return 'Objectif atteint ! Félicitations ! 🎉';
    
    return `Encore ${remaining} ${goal.unit} pour atteindre votre cible.`;
  }

  // ── ADVANCED PERFORMANCE METHODS ──
  
  calculateTotalVolume(): void {
    if (!this.activeWorkout) return;
    let total = 0;
    this.activeWorkout.exercises.forEach(ex => {
      const vol = (ex.sets || 0) * (ex.reps || 0) * (ex.weight || 0);
      ex.volume = vol; // Store individual volume
      total += vol;
    });
    this.totalVolume = total;
  }

  updateExercisePerf(exercise: any): void {
    exercise.volume = (exercise.sets || 0) * (exercise.reps || 0) * (exercise.weight || 0);
    this.calculateTotalVolume();
    // In a real app, we would debounce and auto-save here
  }

  saveActiveWorkout(): void {
    if (!this.activeWorkout?._id) return;
    this.loading = true;
    this.workoutService.updateWorkout(this.activeWorkout._id, this.activeWorkout).subscribe({
      next: (updated) => {
        this.activeWorkout = updated;
        this.calculateTotalVolume();
        this.loading = false;
        alert('Séance enregistrée avec succès ! Tonnage total: ' + this.totalVolume + 'kg');
      },
      error: (err) => {
        console.error('Error saving workout:', err);
        this.loading = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  getInitials(): string {
    const f = this.userProfile?.firstName?.charAt(0) || this.currentUser?.username?.charAt(0) || 'J';
    const l = this.userProfile?.lastName?.charAt(0) || 'H';
    return `${f}${l}`.toUpperCase();
  }

  onSearch(event: any): void {
    const q = event.target.value.toLowerCase();
    this.searchQuery = q;
    
    if (q.length < 2) {
      this.searchResults = [];
      this.showSearchResults = false;
      return;
    }

    const results: any[] = [];
    
    this.recentWorkouts.forEach(w => {
      if (w.type.toLowerCase().includes(q)) results.push({ type: 'Workout', icon: '🏃', name: w.type, url: '/workouts' });
    });
    
    this.goals.forEach(g => {
      if (g.name.toLowerCase().includes(q)) results.push({ type: 'Objectif', icon: '🎯', name: g.name, url: '/goals' });
    });
    
    this.searchResults = results;
    this.showSearchResults = results.length > 0;
  }

  closeSearch(): void {
    setTimeout(() => this.showSearchResults = false, 200);
  }

  onDayClick(day: any): void {
    if (day.type === 'empty') return;
    this.selectedDate = day.date.getDate();
    this.selectedDateObj = day.date;
  }

  generateCalendar(): void {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const days: any[] = [];
    
    // Fill empty days at start
    for (let i = 0; i < startOfMonth.getDay(); i++) {
      days.push({ type: 'empty' });
    }
    
    // Fill actual days
    for (let d = 1; d <= endOfMonth.getDate(); d++) {
      const date = new Date(now.getFullYear(), now.getMonth(), d);
      const workoutsOnDay = this.recentWorkouts.filter(w => 
        new Date(w.date).toDateString() === date.toDateString()
      );
      
      let statusClass = '';
      if (workoutsOnDay.length > 0) {
        const type = workoutsOnDay[0].type.toLowerCase();
        if (type.includes('force')) statusClass = 'active-orange';
        else if (type.includes('cardio')) statusClass = 'active-green';
        else if (type.includes('yoga')) statusClass = 'active-pink';
        else statusClass = 'active-blue';
      }

      days.push({
        dayNumber: d,
        date: date,
        type: 'day',
        statusClass: statusClass,
        isToday: date.toDateString() === now.toDateString()
      });
    }
    
    this.calendarDays = days;
  }

  prepareVolumeHistory(): void {
    // Generate volume chart data from last 7 workouts
    const history = this.recentWorkouts.map(w => {
      let vol = 0;
      w.exercises.forEach(ex => vol += (ex.sets || 0) * (ex.reps || 0) * (ex.weight || 0));
      return {
        date: new Date(w.date).toLocaleDateString('fr-FR', { weekday: 'short' }),
        volume: vol,
        height: 0 // Will be set relative to max
      };
    }).reverse();

    const maxVol = Math.max(...history.map(h => h.volume)) || 1;
    history.forEach(h => h.height = (h.volume / maxVol) * 100);
    this.volumeHistory = history;
  }

  toggleProgressModal(): void {
    this.showProgressModal = !this.showProgressModal;
    if (this.showProgressModal) {
      this.prepareVolumeHistory();
    }
  }
}
