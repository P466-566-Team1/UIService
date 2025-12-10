import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Language } from '../models/models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EdgeApiService } from '../services/edge-api.service';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './language-selector.html',
  styleUrls: ['./language-selector.css']
})
export class LanguageSelectorComponent implements OnInit {
  languages: Language[] = [];
  selectedLanguage: Language | null = null;
  showUserMenu: boolean = false;
  showSettingsModal: boolean = false;
  darkMode: boolean = false;
  loading: boolean = false;

  constructor(
    private router: Router,
    private apiService: EdgeApiService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const storedDark = localStorage.getItem('darkMode');
    this.darkMode = storedDark === 'true';
    this.applyTheme();
    this.loadLanguages();
  }

  loadLanguages(): void {
    this.loading = true;
    this.apiService.getLanguages().subscribe({
      next: (languages) => {
        // Filter out English - only show Persian and Spanish
        this.languages = languages.filter(l => l.code !== 'en');
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load languages', err);
        this.loading = false;
        this.cdr.detectChanges();
        // Show error to user - languages will remain empty
      }
    });
  }

  selectLanguage(language: Language): void {
    this.selectedLanguage = language;
    localStorage.setItem('selectedLanguage', JSON.stringify(language));
    this.router.navigate(['/categories']);
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