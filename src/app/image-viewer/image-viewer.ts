import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Label, Language, Topic } from '../models/models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EdgeApiService } from '../services/edge-api.service';

@Component({
  selector: 'app-image-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './image-viewer.html',
  styleUrls: ['./image-viewer.css']
})
export class ImageViewerComponent implements OnInit {
  topic: Topic | null = null;
  labels: Label[] = [];
  selectedLanguage: Language | null = null;
  selectedLabel: Label | null = null;
  showTranslation: boolean = false;
  showUserMenu: boolean = false;
  showSettingsModal: boolean = false;
  darkMode: boolean = false;
  loading: boolean = false;
  imageUrl: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: EdgeApiService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const storedLanguage = localStorage.getItem('selectedLanguage');
    if (storedLanguage) {
      this.selectedLanguage = JSON.parse(storedLanguage);
    }

    this.loadTopicAndLabels();

    const storedDark = localStorage.getItem('darkMode');
    this.darkMode = storedDark === 'true';
    this.applyTheme();
  }

  loadTopicAndLabels(): void {
    const topicId = this.route.snapshot.paramMap.get('topicId');
    if (!topicId || !this.selectedLanguage) return;

    this.loading = true;

    // Load labels for the topic with translations in selected language
    this.apiService.getLabelsByTopic(Number(topicId), this.selectedLanguage.code).subscribe({
      next: (labels) => {
        this.labels = labels;

        // Get topic info from first label if available
        if (labels.length > 0) {
          const firstLabel = labels[0];
          this.topic = {
            id: topicId,
            categoryId: firstLabel.categoryId?.toString() || '',
            name: 'Topic', // You might want to add topicName to LabelDTO
            imageUrl: '',
            number: labels.length
          };

          // Set image URL if we have an image ID (you may need to add this to your topic/label response)
          // For now, we'll construct it from the topic endpoint
          this.apiService.getTopicById(Number(topicId)).subscribe({
            next: (topic) => {
              if (topic.imageId) {
                this.imageUrl = this.apiService.getImageUrl(topic.imageId);
                if (this.topic) {
                  this.topic.imageUrl = this.imageUrl;
                }
              }
              this.cdr.detectChanges();
            },
            error: (err) => console.error('Failed to load topic details', err)
          });
        }

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load labels', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onLabelClick(label: Label, event: MouseEvent): void {
    event.stopPropagation();
    this.selectedLabel = label;
    this.showTranslation = true;
    this.playAudio(label);
  }

  playAudio(label: Label): void {
    if (label.audioId) {
      const audioUrl = this.apiService.getAudioUrl(label.audioId);
      const audio = new Audio(audioUrl);
      audio.play().catch(e => console.log('Audio play failed:', e));
    }
  }

  getCurrentTranslation(label: Label): string {
    // The label already has the translated text for the selected language
    return label.translatedText || label.englishText || 'Translation not available';
  }

  closeTranslation(): void {
    this.showTranslation = false;
    this.selectedLabel = null;
  }

  applyTheme() {
    if (this.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }

  goBack(): void {
    this.router.navigate(['/topics', this.topic?.categoryId]);
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  goToAdmin() {
    this.router.navigate(['/admin']);
  }

  openSettings() {
    this.showSettingsModal = true;
  }

  closeSettings() {
    this.showSettingsModal = false;
  }

  goToLanguage() {
    localStorage.removeItem('selectedLanguage');
    this.router.navigate(['/']);
  }

  saveSettings() {
    localStorage.setItem('darkMode', String(this.darkMode));
    this.applyTheme();
    this.closeSettings();
  }
}