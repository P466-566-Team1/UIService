import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Category } from '../../models/models';

@Component({
  selector: 'app-admin-category-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-category-list.html',
  styleUrls: ['./admin-category-list.css']
})
export class AdminCategoryListComponent {
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

  showDeleteModal = false;
  categoryToDelete: Category | null = null;

  constructor(private router: Router) { }

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
      this.categories = this.categories.filter(c => c.id !== this.categoryToDelete!.id);
      localStorage.setItem('categories', JSON.stringify(this.categories));
    }
    this.cancelDelete();
  }
}
