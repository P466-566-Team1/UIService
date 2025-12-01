import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Topic, Category } from '../../models/models';

@Component({
  selector: 'app-admin-topic-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-topic-list.html',
  styleUrls: ['./admin-topic-list.css']
})
export class AdminTopicListComponent {
  topics: Topic[] = [
    { id: '1', categoryId: '2', name: 'Cultural Holidays', imageUrl: 'extended-family-1.webp', number: 4},
    { id: '2', categoryId: '2', name: 'National Holidays', imageUrl: 'extended-family-1.webp', number: 5 },
    { id: '3', categoryId: '4', name: 'Fruits', imageUrl: 'assets/food-fruits.jpg', number: 2},
    { id: '4', categoryId: '4', name: 'Vegetables', imageUrl: 'assets/food-vegetables.jpg', number: 7}
  ];

  category: Category | null = null;
  categoryId: string = '';

  showDeleteModal = false;
  topicToDelete: Topic | null = null;
  editingCategoryName = false;
  newCategoryName = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
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
    this.newCategoryName = this.category?.name || '';
  }

  filterTopics(): void {
    this.topics = this.topics.filter(topic => topic.categoryId === this.categoryId);
  }

  saveCategoryName(): void {
    if (this.category) {
      this.category.name = this.newCategoryName.trim();
    }
    this.editingCategoryName = false;
  }

  openAddTopic(): void {
    this.router.navigate([`/admin/categories/${this.categoryId}/add-topic`]);
  }

  editTopic(topic: Topic) {
    this.router.navigate([`/admin/topics/${topic.id}/labels`]);
  }

  confirmDeleteTopic(topic: Topic): void {
    this.topicToDelete = topic;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.topicToDelete = null;
  }

  deleteTopic(): void {
    if (this.topicToDelete) {
      this.topics = this.topics.filter(t => t.id !== this.topicToDelete!.id);
    }
    this.cancelDelete();
  }

  goBack(): void {
    this.router.navigate(['/admin/categories']);
  }
}
