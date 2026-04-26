import { Injectable } from '@angular/core';
import { Goal } from '../models/goal.model';
import { Workout, Exercise } from '../models/workout.model';

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {

  private exerciseDatabase: { [key: string]: Exercise[] } = {
    'weight_loss': [
      { name: 'Course à pied', sets: 1, reps: 30, unit: 'min' },
      { name: 'Corde à sauter', sets: 3, reps: 5, unit: 'min' },
      { name: 'HIIT', sets: 4, reps: 10, unit: 'min' },
      { name: 'Velo elliptique', sets: 1, reps: 45, unit: 'min' }
    ],
    'muscle_gain': [
      { name: 'Développé couché', sets: 4, reps: 10, weight: 0 },
      { name: 'Squat', sets: 4, reps: 12, weight: 0 },
      { name: 'Deadlift', sets: 3, reps: 8, weight: 0 },
      { name: 'Curls haltères', sets: 3, reps: 12, weight: 0 }
    ],
    'toning': [
      { name: 'Pompes', sets: 3, reps: 15 },
      { name: 'Fentes', sets: 3, reps: 20 },
      { name: 'Planche', sets: 3, reps: 60, unit: 'sec' },
      { name: 'Burpees', sets: 3, reps: 12 }
    ],
    'Arms': [
      { name: 'Curls haltères', sets: 3, reps: 12 },
      { name: 'Triceps Dips', sets: 3, reps: 15 },
      { name: 'Hammer Curls', sets: 3, reps: 12 }
    ],
    'Legs': [
      { name: 'Squats', sets: 4, reps: 15 },
      { name: 'Fentes alternées', sets: 3, reps: 20 },
      { name: 'Leg Press', sets: 3, reps: 12 }
    ]
  };

  // ─── Exercise Suggestions ────────────────────────────────────────────
  getExerciseSuggestions(
    goalCategory?: string,
    targetMuscle?: string,
    userLevel: string = 'beginner',
    lastWorkout?: Workout,
    completedSessions: number = 0
  ): Exercise[] {
    let suggestions: Exercise[] = [];

    if (goalCategory && this.exerciseDatabase[goalCategory]) {
      suggestions = [...suggestions, ...this.exerciseDatabase[goalCategory]];
    }

    if (targetMuscle && this.exerciseDatabase[targetMuscle]) {
      suggestions = [...suggestions, ...this.exerciseDatabase[targetMuscle]];
    }

    suggestions = suggestions.filter((v, i, a) => a.findIndex(t => (t.name === v.name)) === i);
    return suggestions.map(ex => this.scaleExercise(ex, userLevel, lastWorkout, completedSessions));
  }

  private scaleExercise(ex: Exercise, level: string, lastWorkout?: Workout, completedSessions: number = 0): Exercise {
    const scaled = { ...ex };

    if (level === 'intermediate') {
      scaled.sets = (scaled.sets || 3) + 1;
      scaled.reps = (scaled.reps || 10) + 2;
    } else if (level === 'advanced') {
      scaled.sets = (scaled.sets || 3) + 2;
      scaled.reps = (scaled.reps || 10) + 5;
    }

    // Progressive Overload Logic based on history length!
    // For every 2 sessions completed, add +1 rep (max +10 extra)
    const extraReps = Math.floor(Math.min(completedSessions / 2, 10));
    scaled.reps = (scaled.reps || 10) + extraReps;

    // For every 3 sessions completed, add +2 weight (max +30 extra)
    if (scaled.weight !== undefined) {
      const extraWeight = Math.floor(Math.min(completedSessions / 3, 15)) * 2;
      scaled.weight += extraWeight;
    }

    if (lastWorkout && lastWorkout.difficulty) {
      if (lastWorkout.difficulty === 'easy') {
        scaled.reps += 2;
        if (scaled.weight !== undefined) scaled.weight += 2;
      } else if (lastWorkout.difficulty === 'hard') {
        scaled.reps = Math.max(5, scaled.reps - 2);
      }
    }

    return scaled;
  }

  // ─── Goal Progress Calculation (Activity-Aware) ───────────────────────
  /**
   * Calculates goal progress using:
   *   70% weight  →  actual value progress (currentValue → targetValue)
   *   30% weight  →  activity consistency (completed workouts out of 12)
   * This ensures the gauge moves even when the raw value hasn't changed yet.
   */
  calculateGoalProgress(goal: any, workouts: any[] = []): number {
    if (!goal || goal.targetValue == null) return 0;

    const totalDiff = Math.abs(goal.targetValue - goal.startValue);
    const currentDiff = Math.abs((goal.currentValue ?? goal.startValue) - goal.startValue);
    const valueProgress = totalDiff === 0 ? 0 : (currentDiff / totalDiff) * 100;

    const completedWorkouts = workouts.filter((w: any) => w.status === 'completed').length;
    const activityProgress = Math.min((completedWorkouts / 12) * 100, 100);

    const combined = (valueProgress * 0.7) + (activityProgress * 0.3);
    return Math.min(Math.round(combined), 100);
  }

  // ─── Coach Status ────────────────────────────────────────────────────
  getCoachStatus(userProfile: any, activeGoal: Goal | null, workouts: Workout[]): any {
    if (!userProfile?.firstName || !userProfile?.age) {
      return {
        state: 'PROFILE_MISSING',
        message: 'Complétez votre profil (Prénom, Âge, Genre) pour activer le coach.',
        action: 'Modifier le profil',
        icon: '👤'
      };
    }
    if (!activeGoal) {
      const suggested = this.getSuggestedGoal(userProfile);
      if (suggested) {
        return {
          state: 'GOAL_PROPOSED',
          message: `Le système vous suggère un objectif de : ${suggested.name}. Voulez-vous commencer ?`,
          action: 'Accepter l\'objectif',
          icon: '💡',
          suggestedGoal: suggested
        };
      }
      return {
        state: 'GOAL_MISSING',
        message: 'Définissez un objectif pour recevoir des séances personnalisées.',
        action: 'Créer un objectif',
        icon: '🎯'
      };
    }
    if (workouts.length === 0) {
      const name = userProfile.firstName || 'Champion';
      return {
        state: 'FIRST_WORKOUT_PENDING',
        message: `Prêt pour votre première séance, ${name} ? Votre objectif ${activeGoal.name} vous attend.`,
        action: 'Démarrer ma séance',
        icon: '🚀'
      };
    }
    return {
      state: 'READY',
      message: 'Le coach analyse vos performances. Continuez comme ça !',
      action: 'Voir mes progrès',
      icon: '📈'
    };
  }

  // ─── Nutrition Guidance ──────────────────────────────────────────────
  getNutritionGuidance(goalCategory?: string, workoutType?: string): any {
    if (goalCategory === 'weight_loss') {
      return {
        tip: 'Privilégiez un repas léger riche en fibres et protéines.',
        targetMacros: { protein: 30, carbs: 40, fat: 30 },
        message: 'Objectif Perte de Poids actif : Focus sur le déficit calorique.'
      };
    } else if (goalCategory === 'muscle_gain') {
      return {
        tip: 'Repas riche en protéines et glucides complexes pour la récupération.',
        targetMacros: { protein: 40, carbs: 40, fat: 20 },
        message: 'Objectif Prise de Masse actif : Assurez un surplus calorique.'
      };
    }
    if (workoutType === 'Force') {
      return { tip: 'Assurez un apport élevé en protéines pour la reconstruction musculaire.' };
    }
    return { tip: 'Équilibrez vos apports pour maintenir votre énergie.' };
  }

  // ─── AI Session Generation ───────────────────────────────────────────
  generateFullAISession(
    goalCategory?: string, 
    userLevel: string = 'beginner', 
    lastWorkout?: Workout,
    completedSessions: number = 0
  ): Workout {
    const type = goalCategory === 'weight_loss' ? 'Cardio' : 'Force';
    const suggestions = this.getExerciseSuggestions(goalCategory, undefined, userLevel, lastWorkout, completedSessions);

    return {
      date: new Date(),
      type: type,
      exercises: suggestions.slice(0, 4),
      notes: `Séance générée par le Coach pour objectif ${goalCategory || 'fitness'}.`,
      status: 'planned'
    } as Workout;
  }

  // ─── Daily Meal Plan ─────────────────────────────────────────────────
  getDailyMealPlan(goalCategory?: string, userLevel: string = 'beginner', workoutType: string = 'Autre'): any {
    const isWeightLoss = goalCategory === 'weight_loss';
    const isForce = workoutType === 'Force';
    const isCardio = workoutType === 'Cardio';

    let calBase = isWeightLoss ? 400 : 600;
    if (isForce && !isWeightLoss) calBase += 100;

    let breakfastProtein = isWeightLoss ? 25 : 40;
    let breakfastCarbs = isWeightLoss ? 10 : 60;
    let lunchProtein = isWeightLoss ? 35 : 45;
    let lunchCarbs = isWeightLoss ? 20 : 50;
    
    if (isForce) {
      breakfastProtein += 10;
      lunchProtein += 15;
    } else if (isCardio) {
      breakfastCarbs += 20;
      lunchCarbs += 30;
    }

    return {
      breakfast: {
        name: isWeightLoss 
          ? (isForce ? 'Omelette (4 blancs d\'œufs) + Fromage blanc' : 'Muesli léger + Yaourt nature + Myrtilles')
          : (isForce ? 'Pancakes protéinés + Oeufs brouillés' : 'Grand bol d\'avoine + Banane + Miel'),
        type: 'Petit-déjeuner',
        calories: calBase,
        protein: breakfastProtein,
        carbs: breakfastCarbs,
        fat: isWeightLoss ? 15 : 20
      },
      lunch: {
        name: isWeightLoss 
          ? (isForce ? 'Poulet grillé (200g) + Haricots verts' : 'Salade Quinoa + Thon + Vinaigrette légère')
          : (isForce ? 'Steak de bœuf + Pâtes complètes + Sauce tomate' : 'Riz basmati + Escalope de dinde + Légumes'),
        type: 'Déjeuner',
        calories: calBase + 100,
        protein: lunchProtein,
        carbs: lunchCarbs,
        fat: isWeightLoss ? 10 : 15
      },
      dinner: {
        name: isWeightLoss 
          ? (isForce ? 'Poisson blanc + Épinards + Citron' : 'Soupe de légumes + Tranche de dinde')
          : (isForce ? 'Saumon rôti + Patate douce + Asperges' : 'Poulet + Boulgour + Courgettes'),
        type: 'Dîner',
        calories: calBase,
        protein: isForce ? (isWeightLoss ? 35 : 45) : (isWeightLoss ? 25 : 35),
        carbs: isCardio ? (isWeightLoss ? 20 : 45) : (isWeightLoss ? 10 : 30),
        fat: isWeightLoss ? 8 : 20
      },
      snack: {
        name: isForce ? 'Shaker de Whey + Amandes' : 'Fruit (Pomme/Banane) + Fromage blanc',
        type: 'Snack',
        calories: isWeightLoss ? 150 : 250,
        protein: isForce ? 30 : 10,
        carbs: isCardio ? 25 : 10,
        fat: isWeightLoss ? 5 : 12
      }
    };
  }

  // ─── Auto Goal Suggestion ────────────────────────────────────────────
  getSuggestedGoal(userProfile: any): any {
    if (!userProfile?.currentWeight || !userProfile?.targetWeight) return null;

    const diff = userProfile.targetWeight - userProfile.currentWeight;
    if (Math.abs(diff) < 0.5) return null;

    const isLoss = diff < 0;
    const category = isLoss ? 'weight_loss' : 'muscle_gain';
    const name = isLoss ? `Perdre ${Math.abs(diff)}kg` : `Prendre ${diff}kg (Masse)`;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 30);

    return {
      name,
      category,
      startValue: userProfile.currentWeight,
      targetValue: userProfile.targetWeight,
      currentValue: userProfile.currentWeight,
      unit: 'kg',
      startDate,
      endDate,
      frequency: 3,
      status: 'active'
    };
  }
}
