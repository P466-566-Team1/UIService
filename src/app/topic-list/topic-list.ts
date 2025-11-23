import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Topic, Language, Category } from '../models/models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-topic-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './topic-list.html',
  styleUrls: ['./topic-list.css']
})
export class TopicListComponent implements OnInit {
  topics: Topic[] = [
    { id: '1', categoryId: '2', name: 'Cultural Holidays', imageUrl: 'extended-family-1.webp' },
    { id: '2', categoryId: '2', name: 'National Holidays', imageUrl: 'extended-family-1.webp' },
    { id: '3', categoryId: '4', name: 'Fruits', imageUrl: 'assets/food-fruits.jpg' },
    { id: '4', categoryId: '4', name: 'Vegetables', imageUrl: 'assets/food-vegetables.jpg' }
  ];

  category: Category | null = null;
  selectedLanguage: Language | null = null;
  categoryId: string = '';
  showUserMenu: boolean = false;
  showSettingsModal: boolean = false;
  darkMode: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    const storedLanguage = localStorage.getItem('selectedLanguage');
    if (storedLanguage) {
      this.selectedLanguage = JSON.parse(storedLanguage);
    }

    this.categoryId = this.route.snapshot.paramMap.get('categoryId') || '';
    this.loadCategory();
    this.filterTopics();
    const storedDark = localStorage.getItem('darkMode');
    this.darkMode = storedDark === 'true';

    this.applyTheme();
  }

  loadCategory(): void {
    const categories = [
      { id: '1', name: 'Spaces' },
      { id: '2', name: 'Holidays' },
      { id: '3', name: 'Activities' },
      { id: '4', name: 'Food' },
      { id: '5', name: 'Animals' },
      { id: '6', name: 'Jobs' },
      { id: '7', name: 'Nature' },
      { id: '8', name: 'People' }
    ];
    this.category = categories.find(c => c.id === this.categoryId) || null;
  }


  filterTopics(): void {
    this.topics = this.topics.filter(topic => topic.categoryId === this.categoryId);
  }

  selectTopic(topic: Topic): void {
    this.router.navigate(['/image-viewer', topic.id]);
  }

  goBack(): void {
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