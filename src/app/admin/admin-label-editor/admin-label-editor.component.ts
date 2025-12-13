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
  imageUrl: string = '';

  draggingIndex: number | null = null;
  recording: { [key: string]: boolean } = {};
  loading = false;
  audioUrls: { [key: string]: string } = {}; // Cache for blob URLs

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
          this.imageUrl = this.apiService.getImageUrl(topic.imageId);
        }
        this.cdr.detectChanges();

        // After topic loads, try to load existing labels
        this.loadExistingLabels(number);
      },
      error: (err) => {
        console.error('Failed to load topic', err);
        // Still initialize empty labels if topic loading fails
        this.initializeEmptyLabels(number);
      }
    });

    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.stopDrag);
  }

  private loadExistingLabels(requestedNumber: number): void {
    const topicIdNum = Number(this.topicId);

    const mapLabels = (existingLabels: any[]) => {
      this.labels = existingLabels.map((label: any) => ({
        id: label.id,
        number: label.number,
        x: label.xCoordinate,
        y: label.yCoordinate,
        width: 80,
        height: 40,
        xPlaced: true,
        translations: {
          en: label.englishText,
          fa: '', // Will fill below
          ar: ''  // Will fill below
        },
        audioFiles: { fa: null, ar: null },
        audioBlobs: { fa: null, ar: null },
        vocabularyId: label.vocabularyId
      }));

      // If requested number is more than existing, add empty ones
      while (this.labels.length < requestedNumber) {
        this.labels.push(this.createEmptyLabel(this.labels.length + 1));
      }
    };

    const loadWithLang = (lang: string, fallback?: () => void) => {
      this.apiService.getLabelsByTopic(topicIdNum, lang).subscribe({
        next: (existingLabels) => {
          if (existingLabels && existingLabels.length > 0) {
            mapLabels(existingLabels);
            this.loadTranslationsForLabels();
            this.cdr.detectChanges();
          } else if (fallback) {
            fallback();
          } else {
            this.initializeEmptyLabels(requestedNumber);
            this.cdr.detectChanges();
          }
        },
        error: () => {
          if (fallback) {
            fallback();
          } else {
            this.initializeEmptyLabels(requestedNumber);
            this.cdr.detectChanges();
          }
        }
      });
    };

    // Prefer Persian data (fa), then Arabic (ar), then English (en) as fallback
    loadWithLang('fa', () => loadWithLang('ar', () => loadWithLang('en')));
  }

  private loadTranslationsForLabels(): void {
    // Load Persian and Arabic translations for existing labels
    this.labels.forEach((label, index) => {
      if (label.vocabularyId) {
        // Load Persian translation
        this.apiService.getLabelsByTopic(Number(this.topicId), 'fa').subscribe({
          next: (faLabels: any[]) => {
            const faLabel = faLabels.find((l: any) => l.number === label.number);
            if (faLabel) {
              this.labels[index].translations.fa = faLabel.translatedText;
            }
          },
          error: (err) => console.log('No Persian translation for label', label.number)
        });

        // Load Arabic translation
        this.apiService.getLabelsByTopic(Number(this.topicId), 'ar').subscribe({
          next: (arLabels: any[]) => {
            const arLabel = arLabels.find((l: any) => l.number === label.number);
            if (arLabel) {
              this.labels[index].translations.ar = arLabel.translatedText;
            }
          },
          error: (err) => console.log('No Arabic translation for label', label.number)
        });
      }
    });
  }

  private initializeEmptyLabels(number: number): void {
    this.labels = [];
    for (let i = 0; i < number; i++) {
      this.labels.push(this.createEmptyLabel(i + 1));
    }
  }

  private createEmptyLabel(number: number): any {
    return {
      number: number,
      x: 50,
      y: 50,
      width: 80,
      height: 40,
      xPlaced: false,
      translations: { en: '', fa: '', ar: '' },
      audioFiles: { fa: null, ar: null },
      audioBlobs: { fa: null, ar: null }
    };
  }

  deleteLabel(label: any, index: number) {
    if (!label.id) {
      this.labels.splice(index, 1);
      return;
    }

    if (!confirm('Delete this label?')) return;

    this.apiService.deleteLabel(Number(label.id)).subscribe({
      next: () => {
        this.labels.splice(index, 1);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to delete label', err);
        alert('Failed to delete label.');
      }
    });
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

  uploadAudio(event: any, i: number, lang: 'fa' | 'ar') {
    const file = event.target.files[0];
    if (file) {
      console.log(`[Audio Upload] Label ${i + 1}, ${lang}: file="${file.name}", size=${file.size}, type=${file.type}`);
      this.labels[i].audioFiles[lang] = file;
      this.labels[i].audioBlobs[lang] = null; // Clear recorded audio if uploading file
    } else {
      console.warn(`[Audio Upload] Label ${i + 1}, ${lang}: No file selected`);
    }
  }

  async toggleRecording(i: number, lang: 'fa' | 'ar') {
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

        // Create and cache the blob URL
        const urlKey = `${i}-${lang}`;
        if (this.audioUrls[urlKey]) {
          URL.revokeObjectURL(this.audioUrls[urlKey]); // Clean up old URL
        }
        this.audioUrls[urlKey] = URL.createObjectURL(audioBlob);

        this.cdr.detectChanges(); // Trigger UI update to show audio preview
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

  getAudioUrl(i: number, lang: 'fa' | 'ar'): string | null {
    const urlKey = `${i}-${lang}`;
    return this.audioUrls[urlKey] || null;
  }

  hasRecordedAudio(i: number, lang: 'fa' | 'ar'): boolean {
    return !!this.labels[i]?.audioBlobs[lang];
  }

  deleteRecordedAudio(i: number, lang: 'fa' | 'ar') {
    const urlKey = `${i}-${lang}`;
    if (this.audioUrls[urlKey]) {
      URL.revokeObjectURL(this.audioUrls[urlKey]); // Clean up blob URL
      delete this.audioUrls[urlKey];
    }
    this.labels[i].audioBlobs[lang] = null;
    this.cdr.detectChanges();
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
      if (!Number.isFinite(label.x) || !Number.isFinite(label.y)) return false;
      if (!label.translations.en.trim()) return false;
      if (!label.translations.fa.trim() && !label.translations.ar.trim()) return false;
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
    console.log(`[Label ${index + 1}] Starting save process for label number ${label.number}`);

    // If label already exists, just update coordinates/number and skip recreation
    if (label.id) {
      const xCoord = Number.isFinite(label.x) ? label.x : label.xCoordinate;
      const yCoord = Number.isFinite(label.y) ? label.y : label.yCoordinate;
      const updatePayload = {
        number: label.number,
        xCoordinate: Math.round(xCoord),
        yCoordinate: Math.round(yCoord),
        vocabularyId: label.vocabularyId,
        topicId: Number(this.topicId),
        categoryId: Number(this.categoryId)
      };

      console.log(`[Label ${index + 1}] Updating existing label id=${label.id} with payload:`, updatePayload);
      this.apiService.updateLabel(Number(label.id), updatePayload).subscribe({
        next: () => {
          console.log(`[Label ${index + 1}] Label updated successfully, moving to next`);
          this.processLabelsSequentially(index + 1);
        },
        error: (err) => {
          console.error('Failed to update label', err);
          this.loading = false;
          alert(`Failed to update label ${index + 1}. Please try again.`);
        }
      });
      return;
    }

    // Step 1: Create vocabulary entry
    this.apiService.createVocabulary({ englishText: label.translations.en }).subscribe({
      next: (vocab) => {
        console.log(`[Label ${index + 1}] Vocabulary created: id=${vocab.id}, text="${label.translations.en}"`);
        // Step 2: Create translations for this vocabulary
        const translationRequests = [];

        // Persian translation
        if (label.translations.fa.trim()) {
          console.log(`[Label ${index + 1}] Queueing Persian translation with audio: hasFile=${!!label.audioFiles.fa}, hasBlob=${!!label.audioBlobs.fa}`);
          translationRequests.push(
            this.createTranslationWithAudio(vocab.id, 'fa', label.translations.fa, label.audioFiles.fa, label.audioBlobs.fa)
          );
        }

        // Arabic translation
        if (label.translations.ar.trim()) {
          console.log(`[Label ${index + 1}] Queueing Arabic translation with audio: hasFile=${!!label.audioFiles.ar}, hasBlob=${!!label.audioBlobs.ar}`);
          translationRequests.push(
            this.createTranslationWithAudio(vocab.id, 'ar', label.translations.ar, label.audioFiles.ar, label.audioBlobs.ar)
          );
        }

        console.log(`[Label ${index + 1}] Waiting for ${translationRequests.length} translation(s) to complete...`);
        // Wait for all translations to complete
        forkJoin(translationRequests).subscribe({
          next: () => {
            console.log(`[Label ${index + 1}] All translations completed successfully`);
            // Step 3: Create label linking everything together
            const labelData = {
              number: label.number,
              xCoordinate: Math.round(label.x),  // Ensure finite integer
              yCoordinate: Math.round(label.y),  // Ensure finite integer
              vocabularyId: vocab.id,
              topicId: Number(this.topicId),
              categoryId: Number(this.categoryId)
            };

            console.log(`[Label ${index + 1}] Creating label with payload:`, labelData);

            this.apiService.createLabel(labelData).subscribe({
              next: () => {
                console.log(`[Label ${index + 1}] Label created successfully, moving to next`);
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
      const audio = audioFile || audioBlob;
      console.log(`[Translation ${languageCode}] Starting: vocabId=${vocabularyId}, text="${translatedText}", hasAudio=${!!audio}`);

      if (audio) {
        const translationData = {
          vocabularyId,
          languageCode,
          translatedText,
          audioId: null
        };

        console.log(`[Translation ${languageCode}] Creating translation without audio first`);
        this.apiService.createTranslation(translationData).subscribe({
          next: (translation) => {
            console.log(`[Translation ${languageCode}] Translation created: id=${translation.id}`);
            const audioFileToUpload = audioFile || new File([audioBlob!], `audio-${languageCode}.mp3`, { type: 'audio/mp3' });
            console.log(`[Translation ${languageCode}] Uploading audio: fileName=${audioFileToUpload.name}, size=${audioFileToUpload.size}, translationId=${translation.id}`);

            this.apiService.uploadAudio(audioFileToUpload, translation.id, languageCode).subscribe({
              next: (audioResp) => {
                console.log(`[Translation ${languageCode}] Audio uploaded successfully:`, audioResp);
                const audioId = audioResp?.id;
                if (audioId) {
                  console.log(`[Translation ${languageCode}] Linking audioId=${audioId} to translationId=${translation.id}`);
                  this.apiService.updateTranslationAudio(translation.id, audioId).subscribe({
                    next: (updatedTranslation) => {
                      console.log(`[Translation ${languageCode}] AudioId linked successfully, translation complete`);
                      resolve(updatedTranslation);
                    },
                    error: (err) => {
                      console.error(`[Translation ${languageCode}] Failed to update translation with audioId:`, err);
                      resolve(translation); // Fall back to translation without audioId linked
                    }
                  });
                } else {
                  console.warn(`[Translation ${languageCode}] No audioId returned from upload, skipping link`);
                  resolve(translation);
                }
              },
              error: (err) => {
                console.error(`[Translation ${languageCode}] Failed to upload audio:`, err);
                resolve(translation);
              }
            });
          },
          error: (err) => {
            console.error(`[Translation ${languageCode}] Failed to create translation:`, err);
            reject(err);
          }
        });
      } else {
        console.log(`[Translation ${languageCode}] No audio, creating translation only`);
        const translationData = {
          vocabularyId,
          languageCode,
          translatedText,
          audioId: null
        };

        this.apiService.createTranslation(translationData).subscribe({
          next: (translation) => {
            console.log(`[Translation ${languageCode}] Translation created (no audio): id=${translation.id}`);
            resolve(translation);
          },
          error: (err) => {
            console.error(`[Translation ${languageCode}] Failed to create translation:`, err);
            reject(err);
          }
        });
      }
    });
  }
}
