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

    // Step 1: Create topic first with a temporary imageId (null)
    const topicData = {
      name: this.name,
      categoryId: Number(this.categoryId),
      imageId: null  // Will be updated after image upload
    };

    this.apiService.createTopic(topicData).subscribe({
      next: (createdTopic) => {
        // Step 2: Now upload image with the created topic ID
        const img = new Image();
        img.onload = () => {
          const width = img.width;
          const height = img.height;

          this.apiService.uploadImage(this.imageFile!, createdTopic.id, width, height).subscribe({
            next: (imageResponse) => {
              // Step 3: Update the topic with the correct imageId
              const updateData = {
                name: this.name,
                categoryId: Number(this.categoryId),
                imageId: imageResponse.id
              };

              this.apiService.updateTopic(createdTopic.id, updateData).subscribe({
                next: (updatedTopic) => {
                  this.loading = false;
                  // Navigate to label editor with the created topic
                  this.router.navigate(['/admin/label-editor', this.number, createdTopic.id]);
                },
                error: (err) => {
                  console.error('Failed to update topic with imageId', err);
                  alert('Topic created but failed to link image. Please try editing the topic.');
                  this.loading = false;
                }
              });
            },
            error: (err) => {
              console.error('Failed to upload image', err);
              alert('Topic created but image upload failed. Please try editing the topic.');
              this.loading = false;
              // Still navigate to label editor since topic was created
              this.router.navigate(['/admin/label-editor', this.number, createdTopic.id]);
            }
          });
        };

        img.src = this.previewUrl!;
      },
      error: (err) => {
        console.error('Failed to create topic', err);
        alert('Failed to create topic. Please try again.');
        this.loading = false;
      }
    });
  }
}
