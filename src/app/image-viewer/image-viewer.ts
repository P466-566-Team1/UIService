import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Label, Language, Topic } from '../models/models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-viewer.html',
  styleUrls: ['./image-viewer.css']
})
export class ImageViewerComponent implements OnInit {
  topic: Topic | null = null;
  labels: Label[] = [];
  selectedLanguage: Language | null = null;
  selectedLabel: Label | null = null;
  showTranslation: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    const storedLanguage = localStorage.getItem('selectedLanguage');
    if (storedLanguage) {
      this.selectedLanguage = JSON.parse(storedLanguage);
    }

    this.loadTopicAndLabels();
  }

  loadTopicAndLabels(): void {
    const topicId = this.route.snapshot.paramMap.get('topicId');

    this.topic = {
      id: topicId || '1',
      categoryId: '2',
      name: 'Cultural Holidays',
      imageUrl: 'assets/cultural-holidays.jpg'
    };

    this.labels = [
      {
        id: '1',
        topicId: topicId || '1',
        x: 100,
        y: 150,
        width: 80,
        height: 40,
        translations: {
          en: 'Lantern',
          fa: 'فانوس',
          es: 'Linterna'
        },
        audioUrls: {
          en: 'assets/audio/lantern-en.mp3',
          fa: 'assets/audio/lantern-fa.mp3',
          es: 'assets/audio/lantern-es.mp3'
        }
      },
      {
        id: '2',
        topicId: topicId || '1',
        x: 200,
        y: 250,
        width: 100,
        height: 50,
        translations: {
          en: 'Festival',
          fa: 'جشنواره',
          es: 'Festival'
        },
        audioUrls: {
          en: 'assets/audio/festival-en.mp3',
          fa: 'assets/audio/festival-fa.mp3',
          es: 'assets/audio/festival-es.mp3'
        }
      }
    ];
  }

  onLabelClick(label: Label, event: MouseEvent): void {
    event.stopPropagation();
    this.selectedLabel = label;
    this.showTranslation = true;

    this.playAudio(label);
  }

  playAudio(label: Label): void {
    if (this.selectedLanguage && label.audioUrls[this.selectedLanguage.code]) {
      const audio = new Audio(label.audioUrls[this.selectedLanguage.code]);
      audio.play().catch(e => console.log('Audio play failed:', e));
    }
  }

  getCurrentTranslation(label: Label): string {
    if (!this.selectedLanguage) return 'No translation available';
    return label.translations[this.selectedLanguage.code] || 'Translation not available';
  }

  closeTranslation(): void {
    this.showTranslation = false;
    this.selectedLabel = null;
  }

  goBack(): void {
    this.router.navigate(['/topics', this.topic?.categoryId]);
  }
}