import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  activeTab = 'profile';

  userProfile: any = {
    firstName: '',
    lastName: '',
    email: '',
    gender: '',
    currentWeight: 0,
    targetWeight: 0,
    height: 0,
    age: 0,
    activityLevel: '',
    level: 'beginner',
    photo: null
  };

  currentUser: any;
  successMessage = '';
  isDarkMode = true;
  weightUnit = 'kg';
  distanceUnit = 'km';

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private themeService: ThemeService
  ) {
    this.currentUser = this.authService.currentUserValue;
  }

  ngOnInit(): void {
    const userId = this.currentUser.id || this.currentUser._id;
    this.userProfile.email = this.currentUser.email || '';
    
    this.userService.getProfile(userId).subscribe(profile => {
      this.userProfile = { ...this.userProfile, ...profile };
    });

    this.isDarkMode = this.themeService.isDarkMode;

    const localUnits = localStorage.getItem('units');
    if (localUnits) {
       const units = JSON.parse(localUnits);
       this.weightUnit = units.weight || 'kg';
       this.distanceUnit = units.distance || 'km';
    }
  }

  setTab(tab: string) {
    this.activeTab = tab;
    this.successMessage = '';
  }

  saveProfile(): void {
    const userId = this.currentUser.id || this.currentUser._id;
    this.userService.updateProfile(userId, this.userProfile).subscribe((updatedProfile: any) => {
      this.userProfile = updatedProfile;
      this.authService.updateCurrentUser(updatedProfile);
      this.successMessage = 'Profil mis à jour avec succès.';
      setTimeout(() => this.successMessage = '', 3000);
    });
  }

  savePreferences(): void {
    this.themeService.toggleTheme(this.isDarkMode);
    localStorage.setItem('units', JSON.stringify({ weight: this.weightUnit, distance: this.distanceUnit }));
    this.successMessage = 'Préférences enregistrées !';
    setTimeout(() => this.successMessage = '', 3000);
    // window.location.reload(); // REMOVED to avoid 404 and maintain SPA experience
  }

  handleImageUpload(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.userProfile.photo = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  getInitials(): string {
    const f = this.userProfile?.firstName?.charAt(0) || 'J';
    const l = this.userProfile?.lastName?.charAt(0) || 'H';
    return `${f}${l}`;
  }
}
