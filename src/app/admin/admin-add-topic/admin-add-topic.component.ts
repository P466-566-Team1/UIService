import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Topic } from '../../models/models';
import { v4 as uuid } from 'uuid';

@Component({
  selector: 'app-admin-add-topic',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-add-topic.html',
  styleUrls: ['./admin-add-topic.css']
})
export class AdminAddTopicComponent {
  categoryId = '';
  name = '';
  number = 0;
  imageFile: File | null = null;
  previewUrl: string | null = null;

  constructor(private route: ActivatedRoute, private router: Router) {
    this.categoryId = this.route.snapshot.params['categoryId'];
  }

  onImageSelect(event: any) {
    this.imageFile = event.target.files[0];
  
    if (!this.imageFile) return;

    const reader = new FileReader();
    reader.onload = () => (this.previewUrl = reader.result as string);
    reader.readAsDataURL(this.imageFile);
  }

  saveTopic() {
    if (!this.name.trim() || !this.previewUrl || !this.number) {
      alert('Please enter a name, upload an image, and input the number of labels.');
      return;
    }

    const topic: Topic = {
      id: uuid(),
      categoryId: this.categoryId,
      name: this.name,
      imageUrl: this.previewUrl!,
      number: this.number
    };

    const stored = localStorage.getItem('topics');
    const list = stored ? JSON.parse(stored) : [];
    list.push(topic);
    localStorage.setItem('topics', JSON.stringify(list));

   this.router.navigate([ '/admin/label-editor', this.number, topic.id]);
  }
}
