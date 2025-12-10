import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Category } from '../../models/models';
import { EdgeApiService } from '../../services/edge-api.service';

@Component({
  selector: 'app-admin-category-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-category-list.html',
  styleUrls: ['./admin-category-list.css']
})
export class AdminCategoryListComponent implements OnInit {
  categories: Category[] = [];
  showDeleteModal = false;
  categoryToDelete: Category | null = null;
  loading = false;

  constructor(
    private router: Router,
    private apiService: EdgeApiService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
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
      }
    });
  }

  goBack() {
    this.router.navigate(['/admin']);
  }

  addCategory() {
    this.router.navigate(['/admin/categories/add']);
  }

  openCategory(category: Category) {
    this.router.navigate([`/admin/categories/${category.id}/add-topic`]);
  }

  editCategory(category: Category) {
    this.router.navigate([`/admin/categories/${category.id}/topics`]);
  }

  confirmDelete(category: Category) {
    this.categoryToDelete = category;
    this.showDeleteModal = true;
  }

  cancelDelete() {
    this.categoryToDelete = null;
    this.showDeleteModal = false;
  }

  deleteCategory() {
    if (this.categoryToDelete) {
      this.apiService.deleteCategory(Number(this.categoryToDelete.id)).subscribe({
        next: () => {
          // Reload categories after deletion
          this.loadCategories();
          this.cancelDelete();
        },
        error: (err) => {
          console.error('Failed to delete category', err);
          alert('Failed to delete category. Please try again.');
          this.cancelDelete();
        }
      });
    }
  }
}
