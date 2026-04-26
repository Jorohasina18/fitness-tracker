import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Workout } from '../models/workout.model';

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  private apiUrl = 'http://localhost:3000/workouts';

  constructor(private http: HttpClient) { }

  createWorkout(workout: Workout): Observable<Workout> {
    return this.http.post<Workout>(this.apiUrl, workout);
  }

  getWorkouts(): Observable<Workout[]> {
    return this.http.get<Workout[]>(this.apiUrl);
  }

  getWorkout(id: string): Observable<Workout> {
    return this.http.get<Workout>(`${this.apiUrl}/${id}`);
  }

  updateWorkout(id: string, workout: Workout): Observable<Workout> {
    return this.http.patch<Workout>(`${this.apiUrl}/${id}`, workout);
  }

  deleteWorkout(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  getMonthlyStats(year: number, month: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/stats/monthly/${year}/${month}`);
  }
}
