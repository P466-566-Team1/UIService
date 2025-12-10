import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Category } from '../../models/models';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { EdgeApiService } from '../../services/edge-api.service';

@Component({
  selector: 'app-admin-add-category',
  standalone: true,
  imports: [CommonModule, FormsModule, PickerComponent],
  templateUrl: './admin-add-category.html',
  styleUrls: ['./admin-add-category.css']
})
export class AdminAddCategoryComponent {
  name = '';
  icon = '';
  showPicker = false;
  loading = false;

  constructor(
    private router: Router,
    private apiService: EdgeApiService
  ) { }

  openEmojiPicker() {
    this.showPicker = !this.showPicker;
  }

  selectEmoji(event: any) {
    this.icon = event.emoji.native;
    this.showPicker = false;
  }

  saveCategory() {
    if (!this.name.trim()) {
      alert('Please enter a category name.');
      return;
    }

    this.loading = true;
    const categoryData = {
      name: this.name,
      icon: this.icon || '📁'
    };

    this.apiService.createCategory(categoryData).subscribe({
      next: (createdCategory) => {
        this.loading = false;
        // Navigate to add topic for this category
        this.router.navigate([`/admin/categories/${createdCategory.id}/add-topic`]);
      },
      error: (err) => {
        console.error('Failed to create category', err);
        alert('Failed to create category. Please try again.');
        this.loading = false;
      }
    });
  }
}
