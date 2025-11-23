import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Category, Language } from '../models/models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category-list.html',
  styleUrls: ['./category-list.css']
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [
    { id: '1', name: 'Spaces', icon: '🏠' },
    { id: '2', name: 'Holidays', icon: '🎊' },
    { id: '3', name: 'Activities', icon: '🎨' },
    { id: '4', name: 'Food', icon: '🍔' },
    { id: '5', name: 'Animals', icon: '🐶' },
    { id: '6', name: 'Jobs', icon: '💼' },
    { id: '7', name: 'Nature', icon: '🌳' },
    { id: '8', name: 'People', icon: '🧑' },
  ];

  selectedLanguage: Language | null = null;
  showUserMenu: boolean = false;
  showSettingsModal: boolean = false;
  darkMode: boolean = false;

  constructor(private router: Router) { }

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
  }


  applyTheme() {
    
    if (this.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }

  selectCategory(category: Category): void {
    this.router.navigate(['/topics', category.id]);
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