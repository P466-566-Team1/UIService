import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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

  draggingIndex: number | null = null;
  recording: { [key: string]: boolean } = {};

  private mediaRecorder!: MediaRecorder;
  private audioChunks: Blob[] = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const number = Number(this.route.snapshot.paramMap.get('number'));
    const topicId = this.route.snapshot.paramMap.get('topicId');

    this.topic = {
      id: topicId,
      name: 'New Topic',
      imageUrl: 'assets/nothing.png'
    };

    //labels
    for (let i = 0; i < number; i++) {
      this.labels.push({
        x: 50,
        y: 50,
        width: 80,
        height: 40,
        translations: { en: '', fa: '', es: '' },
        audioUrls: { fa: null, es: null }
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
      this.labels[i].audioUrls[lang] = URL.createObjectURL(file);
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
        this.labels[i].audioUrls[lang] = URL.createObjectURL(audioBlob);
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
    console.log('Saved labels:', this.labels);
  }
}
