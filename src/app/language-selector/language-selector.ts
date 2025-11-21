import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Language } from '../models/models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule],
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

  constructor(private router: Router) { }

  selectLanguage(language: Language): void {
    this.selectedLanguage = language;
    localStorage.setItem('selectedLanguage', JSON.stringify(language));
    this.router.navigate(['/categories']);
  }
}