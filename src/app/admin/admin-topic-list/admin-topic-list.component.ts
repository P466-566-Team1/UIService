import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Topic, Category } from '../../models/models';
import { EdgeApiService } from '../../services/edge-api.service';

@Component({
  selector: 'app-admin-topic-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-topic-list.html',
  styleUrls: ['./admin-topic-list.css']
})
export class AdminTopicListComponent implements OnInit {
  topics: Topic[] = [];
  category: Category | null = null;
  categoryId: string = '';

  showDeleteModal = false;
  topicToDelete: Topic | null = null;
  editingCategoryName = false;
  newCategoryName = '';
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: EdgeApiService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.categoryId = this.route.snapshot.paramMap.get('categoryId') || '';
    this.loadTopics();
  }

  loadTopics(): void {
    if (!this.categoryId) return;

    this.loading = true;
    this.apiService.getTopicsByCategory(Number(this.categoryId)).subscribe({
      next: (topics) => {
        this.topics = topics;
        // Set category from first topic if available
        if (topics.length > 0) {
          this.category = {
            id: this.categoryId,
            name: topics[0].categoryName || 'Topics'
          };
          this.newCategoryName = this.category.name;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load topics', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  saveCategoryName(): void {
    if (this.category && this.newCategoryName.trim()) {
      const categoryData = {
        name: this.newCategoryName.trim(),
        icon: this.category.icon
      };

      this.apiService.updateCategory(Number(this.categoryId), categoryData).subscribe({
        next: () => {
          if (this.category) {
            this.category.name = this.newCategoryName.trim();
          }
          this.editingCategoryName = false;
        },
        error: (err) => {
          console.error('Failed to update category', err);
          alert('Failed to update category name. Please try again.');
        }
      });
    }
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
      this.apiService.deleteTopic(Number(this.topicToDelete.id)).subscribe({
        next: () => {
          // Reload topics after deletion
          this.loadTopics();
          this.cancelDelete();
        },
        error: (err) => {
          console.error('Failed to delete topic', err);
          alert('Failed to delete topic. Please try again.');
          this.cancelDelete();
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/categories']);
  }
}
