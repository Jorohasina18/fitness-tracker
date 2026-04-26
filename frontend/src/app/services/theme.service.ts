import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkModeStatus = new BehaviorSubject<boolean>(this.getInitialTheme());
  darkMode$ = this.darkModeStatus.asObservable();

  constructor() {}

  private getInitialTheme(): boolean {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme !== 'light';
  }

  toggleTheme(isDark?: boolean): void {
    const newStatus = isDark !== undefined ? isDark : !this.darkModeStatus.value;
    this.darkModeStatus.next(newStatus);
    localStorage.setItem('theme', newStatus ? 'dark' : 'light');
    
    // Apply class to body for global theme variables
    if (newStatus) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }

  get isDarkMode(): boolean {
    return this.darkModeStatus.value;
  }
}
