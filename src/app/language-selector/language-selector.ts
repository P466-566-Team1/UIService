import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Language } from '../models/models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './language-selector.html',
  styleUrls: ['./language-selector.css']
})
export class LanguageSelectorComponent {
  languages: Language[] = [
    // { id: '1', name: 'English', code: 'en' },
    { id: '2', name: 'Persian', code: 'fa' },
    { id: '3', name: 'Spanish', code: 'es' }
  ];

  selectedLanguage: Language | null = null;
  showUserMenu: boolean = false;
  showSettingsModal: boolean = false;
  darkMode: boolean = false;

  constructor(private router: Router) { }

  selectLanguage(language: Language): void {
    this.selectedLanguage = language;
    localStorage.setItem('selectedLanguage', JSON.stringify(language));
    this.router.navigate(['/categories']);
  }
  
  ngOnInit(): void {

    const storedDark = localStorage.getItem('darkMode');
    this.darkMode = storedDark === 'true';

    this.applyTheme();
  }
   applyTheme() {
      
      if (this.darkMode) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    }

    toggleUserMenu() {
      this.showUserMenu = !this.showUserMenu;
    }
  
    goToAdmin() {
      this.router.navigate(['/admin']);
    }
  
    openSettings() {
      this.showSettingsModal = true;
    }
  
    closeSettings() {
      this.showSettingsModal = false;
    }
  
    saveSettings() {
      localStorage.setItem('darkMode', String(this.darkMode));
      this.applyTheme();
      this.closeSettings();
    }
}