import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { WorkoutService } from '../../services/workout.service';
import { AuthService } from '../../services/auth.service';
import { GoalService } from '../../services/goal.service';
import { RecommendationService } from '../../services/recommendation.service';
import { UserService } from '../../services/user.service';
import { Workout, Exercise } from '../../models/workout.model';
import { Goal } from '../../models/goal.model';

@Component({
  selector: 'app-workouts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './workouts.component.html',
  styleUrls: ['./workouts.component.scss']
})
export class WorkoutsComponent implements OnInit {
  workouts: Workout[] = [];
  workoutForm: FormGroup;
  loading = false;
  submitted = false;
  showForm = false;
  currentUser: any;
  activeGoals: Goal[] = [];
  suggestions: Exercise[] = [];
  userLevel: string = 'beginner';
  lastWorkout: Workout | undefined;

  // ─── Live Workout Mode ───────────────────────────────────────────────
  liveMode = false;
  liveWorkout: Workout | null = null;
  activeExerciseIndex = 0;
  exerciseDone: boolean[] = [];
  // ─────────────────────────────────────────────────────────────────────

  constructor(
    private workoutService: WorkoutService,
    private authService: AuthService,
    private goalService: GoalService,
    private recommendationService: RecommendationService,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.currentUser = this.authService.currentUserValue;
    this.workoutForm = this.formBuilder.group({
      date: ['', Validators.required],
      type: ['', Validators.required],
      targetMuscle: [''],
      intensity: ['Moderate'],
      exercises: this.formBuilder.array([]),
      notes: ['']
    });

    this.workoutForm.get('targetMuscle')?.valueChanges.subscribe(() => {
      this.updateSuggestions();
    });
  }

  ngOnInit(): void {
    this.loadWorkouts();
    this.loadActiveGoals();
    this.loadUserProfile();

    this.route.queryParams.subscribe(params => {
      if (params['startSuggested'] === 'true' && !this.showForm) {
        this.toggleForm();
      }
    });
  }

  // ─── Form ────────────────────────────────────────────────────────────
  toggleForm(): void {
    this.showForm = !this.showForm;
    if (this.showForm) {
      this.workoutForm.patchValue({
        date: new Date().toISOString().split('T')[0],
        type: this.activeGoals[0]?.category === 'weight_loss' ? 'Cardio' : 'Force'
      });
      setTimeout(() => {
        if (this.suggestions.length > 0 && this.exercises.length === 0) {
          this.suggestions.slice(0, 4).forEach(s => this.addExercise(s));
        }
      }, 300);
    }
  }

  // ─── AI Session ──────────────────────────────────────────────────────
  generateAISession(autoStart: boolean = false): void {
    this.loading = true;
    const goalCategory = this.activeGoals[0]?.category;
    const completedSessionsCount = this.workouts.filter(w => w.status === 'completed').length;
    
    const aiWorkout = this.recommendationService.generateFullAISession(
      goalCategory, 
      this.userLevel, 
      this.lastWorkout, 
      completedSessionsCount
    );

    this.workoutService.createWorkout(aiWorkout).subscribe({
      next: (createdWorkout) => {
        this.loadWorkouts();
        this.showForm = false;
        this.loading = false;
        if (autoStart && createdWorkout) {
          this.startLiveWorkout(createdWorkout);
        } else {
          alert('Séance générée ! Cliquez sur "Commencer" pour débuter.');
        }
      },
      error: () => { this.loading = false; }
    });
  }

  // ─── Live Workout Mode ───────────────────────────────────────────────
  startLiveWorkout(workout: Workout): void {
    if (!workout.exercises || workout.exercises.length === 0) {
      alert('Aucun exercice dans cette séance.');
      return;
    }
    this.liveWorkout = workout;
    this.activeExerciseIndex = 0;
    this.exerciseDone = new Array(workout.exercises.length).fill(false);
    this.liveMode = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get currentExercise(): Exercise | null {
    if (!this.liveWorkout?.exercises) return null;
    return this.liveWorkout.exercises[this.activeExerciseIndex] || null;
  }

  get totalExercises(): number {
    return this.liveWorkout?.exercises?.length ?? 0;
  }

  get isLastExercise(): boolean {
    return this.activeExerciseIndex === this.totalExercises - 1;
  }

  nextExercise(): void {
    this.exerciseDone[this.activeExerciseIndex] = true;
    if (!this.isLastExercise) {
      this.activeExerciseIndex++;
    }
  }

  prevExercise(): void {
    if (this.activeExerciseIndex > 0) {
      this.activeExerciseIndex--;
    }
  }

  finishLiveWorkout(difficulty: string = 'medium'): void {
    const workoutId = this.liveWorkout?._id || (this.liveWorkout as any)?.id;
    if (!workoutId) {
      console.error('Impossible de terminer la séance, ID manquant', this.liveWorkout);
      alert('Erreur: Impossible d\'identifier la séance.');
      return;
    }
    this.exerciseDone[this.activeExerciseIndex] = true;
    this.loading = true;

    const updated: any = { ...this.liveWorkout, status: 'completed', difficulty };
    this.workoutService.updateWorkout(workoutId, updated).subscribe({
      next: (res) => {
        // Sync the local liveWorkout state so the HTML success card shows up immediately
        if (this.liveWorkout) {
          this.liveWorkout.status = 'completed';
          this.liveWorkout.difficulty = difficulty;
        }
        this.syncGoalProgress();
        this.loadWorkouts();
        this.loading = false;
      },
      error: (err) => { 
        console.error('Finish workout error:', err);
        this.loading = false; 
        alert('Erreur lors de l\'enregistrement de la séance.');
      }
    });
  }

  closeLiveWorkout(): void {
    this.liveMode = false;
    this.liveWorkout = null;
    this.loadWorkouts();
  }

  cancelLiveWorkout(): void {
    this.liveMode = false;
    this.liveWorkout = null;
    this.exerciseDone = [];
    this.activeExerciseIndex = 0;
  }

  /**
   * After a workout is completed, add activity-based progress to the active goal.
   * Each completed workout adds a fixed bonus (e.g. 8%) toward the goal, capped at 100%.
   */
  syncGoalProgress(): void {
    if (this.activeGoals.length === 0) { this.loading = false; return; }
    const goal = this.activeGoals[0];
    if (!goal._id) { this.loading = false; return; }

    const totalRange = Math.abs((goal.targetValue ?? 0) - (goal.startValue ?? 0));
    // Each completed workout = 8% progress of total range
    const bonusPerWorkout = totalRange * 0.08;
    const isLoss = (goal.targetValue ?? 0) < (goal.startValue ?? 0);
    const newVal = isLoss
      ? Math.max(goal.targetValue ?? 0, (goal.currentValue ?? goal.startValue ?? 0) - bonusPerWorkout)
      : Math.min(goal.targetValue ?? 0, (goal.currentValue ?? goal.startValue ?? 0) + bonusPerWorkout);

    this.goalService.updateGoal(goal._id, { ...goal, currentValue: newVal } as any).subscribe({
      next: () => {
        this.loadActiveGoals();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  // ─── Data Loading ────────────────────────────────────────────────────
  loadUserProfile(): void {
    if (this.currentUser?.username) {
      this.userService.getProfile(this.currentUser.username).subscribe((profile: any) => {
        if (profile) {
          this.userLevel = profile.level || 'beginner';
          this.updateSuggestions();
        }
      });
    }
  }

  loadActiveGoals(): void {
    this.goalService.getGoals().subscribe((goals: any) => {
      this.activeGoals = goals.filter((g: any) => g.status === 'active');
      this.updateSuggestions();
    });
  }

  updateSuggestions(): void {
    const mainGoal = this.activeGoals[0];
    this.lastWorkout = this.workouts.find(w => w.status === 'completed');
    this.suggestions = this.recommendationService.getExerciseSuggestions(
      mainGoal?.category,
      this.workoutForm.get('targetMuscle')?.value,
      this.userLevel,
      this.lastWorkout
    );
  }

  loadWorkouts(): void {
    this.loading = true;
    this.workoutService.getWorkouts().subscribe({
      next: (workouts: any) => {
        this.workouts = workouts;
        this.updateSuggestions();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  // ─── Form Helpers ────────────────────────────────────────────────────
  get f() { return this.workoutForm.controls; }
  get exercises() { return this.workoutForm.get('exercises') as FormArray; }

  addExercise(suggested?: Exercise): void {
    const exerciseForm = this.formBuilder.group({
      name: [suggested?.name || '', Validators.required],
      sets: [suggested?.sets || 0, [Validators.required, Validators.min(1)]],
      reps: [suggested?.reps || 0, [Validators.required, Validators.min(1)]],
      weight: [suggested?.weight || 0],
      unit: [suggested?.unit || 'kg']
    });
    this.exercises.push(exerciseForm);
  }

  removeExercise(index: number): void {
    this.exercises.removeAt(index);
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.workoutForm.invalid) return;
    this.loading = true;
    const formValue = this.workoutForm.value;
    const workout: Workout = {
      date: new Date(formValue.date),
      type: formValue.type,
      exercises: formValue.exercises || [],
      notes: formValue.notes
    };
    this.workoutService.createWorkout(workout).subscribe({
      next: () => {
        this.workoutForm.reset();
        this.submitted = false;
        this.showForm = false;
        this.loadWorkouts();
      },
      error: () => { this.loading = false; }
    });
  }

  deleteWorkout(id: string | undefined): void {
    if (id && confirm('Êtes-vous sûr de vouloir supprimer cet entraînement?')) {
      this.workoutService.deleteWorkout(id).subscribe({
        next: () => { this.loadWorkouts(); },
        error: (e: any) => { console.error(e); }
      });
    }
  }

  markAsCompleted(workout: Workout, difficulty: string): void {
    if (!workout._id) return;
    const updated: any = { ...workout, status: 'completed', difficulty };
    this.workoutService.updateWorkout(workout._id, updated).subscribe({
      next: () => {
        this.syncGoalProgress();
        this.loadWorkouts();
      },
      error: (e: any) => { console.error(e); }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  navigateTo(path: string): void { this.router.navigate([path]); }

  getWorkoutIcon(type: string): string {
    switch (type) {
      case 'Force': return '💪';
      case 'Cardio': return '🏃';
      case 'Yoga': return '🧘';
      case 'Flexibilité': return '🤸';
      default: return '🏋️';
    }
  }
}
