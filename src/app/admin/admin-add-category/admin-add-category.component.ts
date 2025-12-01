import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Category } from '../../models/models';
import { v4 as uuid } from 'uuid';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';

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

  constructor(private router: Router) {}

  openEmojiPicker() {
    this.showPicker = !this.showPicker;
  }

  selectEmoji(event: any) {
    this.icon = event.emoji.native;  // inserts emoji
    this.showPicker = false;
  }

  saveCategory() {
    const cat: Category = {
      id: uuid(),
      name: this.name,
      icon: this.icon || '📁'
    };

    const stored = localStorage.getItem('categories');
    const cats = stored ? JSON.parse(stored) : [];
    cats.push(cat);
    localStorage.setItem('categories', JSON.stringify(cats));

    this.router.navigate([`/admin/categories/${cat.id}/add-topic`]);
  }
}
