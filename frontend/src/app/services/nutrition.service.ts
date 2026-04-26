import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Meal, DailyMacros } from '../models/nutrition.model';

@Injectable({
  providedIn: 'root'
})
export class NutritionService {
  private apiUrl = 'http://localhost:3000/nutrition';

  constructor(private http: HttpClient) { }

  createMeal(meal: Meal): Observable<Meal> {
    return this.http.post<Meal>(this.apiUrl, meal);
  }

  getMeals(): Observable<Meal[]> {
    return this.http.get<Meal[]>(this.apiUrl);
  }

  getMeal(id: string): Observable<Meal> {
    return this.http.get<Meal>(`${this.apiUrl}/${id}`);
  }

  updateMeal(id: string, meal: Meal): Observable<Meal> {
    return this.http.patch<Meal>(`${this.apiUrl}/${id}`, meal);
  }

  deleteMeal(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  getDailyMacros(year: number, month: number, day: number): Observable<DailyMacros> {
    return this.http.get<DailyMacros>(`${this.apiUrl}/macros/daily/${year}/${month}/${day}`);
  }
}
