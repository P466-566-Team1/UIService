import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Category, Language } from '../models/models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-list.html',
  styleUrls: ['./category-list.css']
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [
    { id: '1', name: 'Spaces' },
    { id: '2', name: 'Holidays' },
    { id: '3', name: 'Activities' },
    { id: '4', name: 'Food' },
    { id: '5', name: 'Animals' },
    { id: '6', name: 'Jobs' },
    { id: '7', name: 'Nature' },
    { id: '8', name: 'People' }
  ];

  selectedLanguage: Language | null = null;

  constructor(private router: Router) { }

  ngOnInit(): void {
    const storedLanguage = localStorage.getItem('selectedLanguage');
    if (storedLanguage) {
      this.selectedLanguage = JSON.parse(storedLanguage);
    } else {
      this.router.navigate(['/']);
    }
  }

  selectCategory(category: Category): void {
    this.router.navigate(['/topics', category.id]);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}