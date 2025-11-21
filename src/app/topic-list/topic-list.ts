import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Topic, Language, Category } from '../models/models';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-topic-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topic-list.html',
  styleUrls: ['./topic-list.css']
})
export class TopicListComponent implements OnInit {
  topics: Topic[] = [
    { id: '1', categoryId: '2', name: 'Cultural Holidays', imageUrl: 'assets/holidays-cultural.jpg' },
    { id: '2', categoryId: '2', name: 'National Holidays', imageUrl: 'assets/holidays-national.jpg' },
    { id: '3', categoryId: '4', name: 'Fruits', imageUrl: 'assets/food-fruits.jpg' },
    { id: '4', categoryId: '4', name: 'Vegetables', imageUrl: 'assets/food-vegetables.jpg' }
  ];

  category: Category | null = null;
  selectedLanguage: Language | null = null;
  categoryId: string = '';

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
}