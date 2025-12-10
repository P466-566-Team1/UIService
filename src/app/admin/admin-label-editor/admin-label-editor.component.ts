import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EdgeApiService } from '../../services/edge-api.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-label-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-label-editor.html',
  styleUrls: ['./admin-label-editor.css']
})
export class LabelEditorComponent implements OnInit {
  @ViewChild('imageWrapper') imageWrapper!: ElementRef;
  @ViewChild('mainImage') mainImage!: ElementRef;

  topic: any = {};
  labels: any[] = [];
  topicId: string = '';
  categoryId: string = '';

  draggingIndex: number | null = null;
  recording: { [key: string]: boolean } = {};
  loading = false;

  private mediaRecorder!: MediaRecorder;
  private audioChunks: Blob[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: EdgeApiService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const number = Number(this.route.snapshot.paramMap.get('number'));
    this.topicId = this.route.snapshot.paramMap.get('topicId') || '';

    // Load topic details to get image and category info
    this.apiService.getTopicById(Number(this.topicId)).subscribe({
      next: (topic) => {
        this.topic = topic;
        this.categoryId = topic.categoryId;
        if (topic.imageId) {
          this.topic.imageUrl = this.apiService.getImageUrl(topic.imageId);
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load topic', err)
    });

    // Initialize labels for placement
    for (let i = 0; i < number; i++) {
      this.labels.push({
        number: i + 1,
        x: 50,
        y: 50,
        width: 80,
        height: 40,
        translations: { en: '', fa: '', es: '' },
        audioFiles: { fa: null, es: null },
        audioBlobs: { fa: null, es: null }
      });
    }

    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.stopDrag);
  }

  placeMarker(e: MouseEvent) {
    if (this.draggingIndex !== null) return;

    const rect = this.imageWrapper.nativeElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const i = this.labels.findIndex(l => !l.xPlaced);
    if (i !== -1) {
      this.labels[i].x = x;
      this.labels[i].y = y;
      this.labels[i].xPlaced = true;
    }
  }

  startDrag = (e: MouseEvent, index: number) => {
    e.stopPropagation();
    this.draggingIndex = index;
  };

  onMouseMove = (e: MouseEvent) => {
    if (this.draggingIndex === null) return;

    const rect = this.imageWrapper.nativeElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.labels[this.draggingIndex].x = x;
    this.labels[this.draggingIndex].y = y;
  };

  stopDrag = () => {
    this.draggingIndex = null;
  };

  uploadAudio(event: any, i: number, lang: 'fa' | 'es') {
    const file = event.target.files[0];
    if (file) {
      this.labels[i].audioFiles[lang] = file;
      this.labels[i].audioBlobs[lang] = null; // Clear recorded audio if uploading file
    }
  }

  async toggleRecording(i: number, lang: 'fa' | 'es') {
    const key = `${i}-${lang}`;

    if (!this.recording[key]) {
      this.recording[key] = true;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);

      this.audioChunks = [];
      this.mediaRecorder.ondataavailable = e => this.audioChunks.push(e.data);

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/mp3' });
        this.labels[i].audioBlobs[lang] = audioBlob;
        this.labels[i].audioFiles[lang] = null; // Clear uploaded file if recording
      };

      this.mediaRecorder.start();
    } else {
      this.mediaRecorder.stop();
      this.recording[key] = false;
    }
  }

  isRecording(i: number, lang: string) {
    return this.recording[`${i}-${lang}`];
  }

  saveAllLabels() {
    if (!this.validateLabels()) {
      alert('Please fill in all required fields and place all labels.');
      return;
    }

    this.loading = true;

    // Process each label sequentially
    this.processLabelsSequentially(0);
  }

  private validateLabels(): boolean {
    for (const label of this.labels) {
      if (!label.xPlaced) return false;
      if (!label.translations.en.trim()) return false;
      if (!label.translations.fa.trim() && !label.translations.es.trim()) return false;
    }
    return true;
  }

  private processLabelsSequentially(index: number) {
    if (index >= this.labels.length) {
      // All labels processed successfully
      this.loading = false;
      alert('All labels saved successfully!');
      this.router.navigate(['/admin/categories']);
      return;
    }

    const label = this.labels[index];

    // Step 1: Create vocabulary entry
    this.apiService.createVocabulary({ englishText: label.translations.en }).subscribe({
      next: (vocab) => {
        // Step 2: Create translations for this vocabulary
        const translationRequests = [];

        // Persian translation
        if (label.translations.fa.trim()) {
          translationRequests.push(
            this.createTranslationWithAudio(vocab.id, 'fa', label.translations.fa, label.audioFiles.fa, label.audioBlobs.fa)
          );
        }

        // Spanish translation
        if (label.translations.es.trim()) {
          translationRequests.push(
            this.createTranslationWithAudio(vocab.id, 'es', label.translations.es, label.audioFiles.es, label.audioBlobs.es)
          );
        }

        // Wait for all translations to complete
        forkJoin(translationRequests).subscribe({
          next: () => {
            // Step 3: Create label linking everything together
            const labelData = {
              number: label.number,
              xCoordinate: Math.floor(label.x),  // Convert to integer
              yCoordinate: Math.floor(label.y),  // Convert to integer
              vocabularyId: vocab.id,
              topicId: Number(this.topicId),
              categoryId: Number(this.categoryId)
            };

            this.apiService.createLabel(labelData).subscribe({
              next: () => {
                // Move to next label
                this.processLabelsSequentially(index + 1);
              },
              error: (err) => {
                console.error('Failed to create label', err);
                this.loading = false;
                alert(`Failed to save label ${index + 1}. Please try again.`);
              }
            });
          },
          error: (err) => {
            console.error('Failed to create translations', err);
            this.loading = false;
            alert(`Failed to save translations for label ${index + 1}. Please try again.`);
          }
        });
      },
      error: (err) => {
        console.error('Failed to create vocabulary', err);
        this.loading = false;
        alert(`Failed to save vocabulary for label ${index + 1}. Please try again.`);
      }
    });
  }

  private createTranslationWithAudio(vocabularyId: number, languageCode: string, translatedText: string, audioFile: File | null, audioBlob: Blob | null) {
    return new Promise((resolve, reject) => {
      // If we have audio (file or blob), upload it first
      const audio = audioFile || audioBlob;

      if (audio) {
        // Create a temporary translation ID (we'll update it after translation is created)
        // For now, we'll create translation first, then upload audio and update

        const translationData = {
          vocabularyId,
          languageCode,
          translatedText,
          audioId: null
        };

        this.apiService.createTranslation(translationData).subscribe({
          next: (translation) => {
            // Now upload audio with the translation ID
            const audioFileToUpload = audioFile || new File([audioBlob!], `audio-${languageCode}.mp3`, { type: 'audio/mp3' });

            this.apiService.uploadAudio(audioFileToUpload, translation.id).subscribe({
              next: () => resolve(translation),
              error: (err) => {
                console.error('Failed to upload audio', err);
                // Still resolve - translation was created successfully
                resolve(translation);
              }
            });
          },
          error: reject
        });
      } else {
        // No audio - just create translation
        const translationData = {
          vocabularyId,
          languageCode,
          translatedText,
          audioId: null
        };

        this.apiService.createTranslation(translationData).subscribe({
          next: resolve,
          error: reject
        });
      }
    });
  }
}
