import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Topic } from '../../models/models';
import { EdgeApiService } from '../../services/edge-api.service';

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
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: EdgeApiService
  ) {
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
    if (!this.name.trim() || !this.imageFile || !this.number) {
      alert('Please enter a name, upload an image, and input the number of labels.');
      return;
    }

    this.loading = true;

    // First, get image dimensions for upload
    const img = new Image();
    img.onload = () => {
      const width = img.width;
      const height = img.height;

      // Upload image to MediaService first
      this.apiService.uploadImage(this.imageFile!, Number(this.categoryId), width, height).subscribe({
        next: (imageResponse) => {
          // Create topic with the uploaded image ID
          const topicData = {
            name: this.name,
            categoryId: Number(this.categoryId),
            imageId: imageResponse.id
          };

          this.apiService.createTopic(topicData).subscribe({
            next: (createdTopic) => {
              this.loading = false;
              // Navigate to label editor
              this.router.navigate(['/admin/label-editor', this.number, createdTopic.id]);
            },
            error: (err) => {
              console.error('Failed to create topic', err);
              alert('Failed to create topic. Please try again.');
              this.loading = false;
            }
          });
        },
        error: (err) => {
          console.error('Failed to upload image', err);
          alert('Failed to upload image. Please try again.');
          this.loading = false;
        }
      });
    };

    img.src = this.previewUrl!;
  }
}
