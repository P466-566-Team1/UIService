import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Category, Language } from '../models/models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EdgeApiService } from '../services/edge-api.service';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category-list.html',
  styleUrls: ['./category-list.css']
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];
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
    const storedLanguage = localStorage.getItem('selectedLanguage');
    if (storedLanguage) {
      this.selectedLanguage = JSON.parse(storedLanguage);
    } else {
      this.router.navigate(['/']);
    }
    const storedDark = localStorage.getItem('darkMode');
    this.darkMode = storedDark === 'true';
    this.applyTheme();
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.apiService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load categories', err);
        this.loading = false;
        this.cdr.detectChanges();
        // Show error to user - categories will remain empty
      }
    });
  }

  selectCategory(category: Category): void {
    this.router.navigate(['/topics', category.id]);
  }

  applyTheme() {
    if (this.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
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

  goToLanguage() {
    localStorage.removeItem('selectedLanguage');
    this.router.navigate(['/']);
  }

  saveSettings() {
    localStorage.setItem('darkMode', String(this.darkMode));
    this.applyTheme();
    this.closeSettings();
  }
}