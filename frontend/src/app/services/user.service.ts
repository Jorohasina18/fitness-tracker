import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  getProfile(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  updateProfile(id: string, profileData: any): Observable<any> {
    // Sanitize data to avoid backend validation errors
    const sanitized = { ...profileData };
    delete sanitized._id;
    delete sanitized.__v;
    delete sanitized.userId;
    delete sanitized.username;
    delete sanitized.password;
    delete sanitized.createdAt;
    
    return this.http.put(`${this.apiUrl}/${id}`, sanitized);
  }
}
