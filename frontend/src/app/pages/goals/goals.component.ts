import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GoalService } from '../../services/goal.service';
import { AuthService } from '../../services/auth.service';
import { WorkoutService } from '../../services/workout.service';
import { RecommendationService } from '../../services/recommendation.service';
import { Goal } from '../../models/goal.model';
import { Workout } from '../../models/workout.model';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './goals.component.html',
  styleUrls: ['./goals.component.scss']
})
export class GoalsComponent implements OnInit {
  goals: Goal[] = [];
  workouts: Workout[] = [];
  goalForm: FormGroup;
  loading = false;
  submitted = false;
  showForm = false;
  currentUser: any;

  constructor(
    private goalService: GoalService,
    private authService: AuthService,
    private workoutService: WorkoutService,
    private recommendationService: RecommendationService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.currentUser = this.authService.currentUserValue;
    this.goalForm = this.formBuilder.group({
      name: ['', Validators.required],
      targetValue: ['', [Validators.required, Validators.min(0)]],
      startValue: ['', [Validators.required, Validators.min(0)]],
      currentValue: ['', [Validators.required, Validators.min(0)]],
      unit: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      category: ['weight_loss', Validators.required],
      duration: [30, [Validators.required, Validators.min(1)]],
      frequency: [3, [Validators.required, Validators.min(1), Validators.max(7)]]
    });
  }

  ngOnInit(): void {
    this.loadGoals();
    this.loadWorkouts();
  }

  loadWorkouts(): void {
    this.workoutService.getWorkouts().subscribe({
      next: (workouts: any) => { this.workouts = workouts; },
      error: () => {}
    });
  }

  loadGoals(): void {
    this.loading = true;
    this.goalService.getGoals().subscribe({
      next: (goals) => {
        this.goals = goals;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading goals:', error);
        this.loading = false;
      }
    });
  }

  get f() { return this.goalForm.controls; }

  onSubmit(): void {
    this.submitted = true;

    if (this.goalForm.invalid) {
      return;
    }

    this.loading = true;
    const formValue = this.goalForm.value;
    const goal: Goal = {
      name: formValue.name,
      targetValue: formValue.targetValue,
      startValue: formValue.startValue,
      currentValue: formValue.currentValue,
      unit: formValue.unit,
      startDate: new Date(formValue.startDate),
      endDate: new Date(formValue.endDate),
      category: formValue.category,
      duration: formValue.duration,
      frequency: formValue.frequency,
      status: 'active'
    };

    this.goalService.createGoal(goal).subscribe({
      next: () => {
        this.goalForm.reset();
        this.submitted = false;
        this.showForm = false;
        this.loadGoals();
      },
      error: (error) => {
        console.error('Error creating goal:', error);
        this.loading = false;
      }
    });
  }

  deleteGoal(id: string | undefined): void {
    if (id && confirm('Êtes-vous sûr de vouloir supprimer cet objectif?')) {
      this.goalService.deleteGoal(id).subscribe({
        next: () => {
          this.loadGoals();
        },
        error: (error) => {
          console.error('Error deleting goal:', error);
        }
      });
    }
  }

  getProgressPercentage(goal: Goal): number {
    return this.recommendationService.calculateGoalProgress(goal, this.workouts);
  }

  getGoalMessage(goal: Goal): string {
    const remaining = Math.abs(goal.targetValue - goal.currentValue);
    if (remaining <= 0) return 'Objectif atteint ! 🎉';
    return `Encore ${remaining} ${goal.unit} pour atteindre votre cible.`;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
