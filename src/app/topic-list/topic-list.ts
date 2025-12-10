import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Topic, Language, Category } from '../models/models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EdgeApiService } from '../services/edge-api.service';

@Component({
  selector: 'app-topic-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './topic-list.html',
  styleUrls: ['./topic-list.css']
})
export class TopicListComponent implements OnInit {
  topics: Topic[] = [];
  category: Category | null = null;
  selectedLanguage: Language | null = null;
  categoryId: string = '';
  showUserMenu: boolean = false;
  showSettingsModal: boolean = false;
  darkMode: boolean = false;
  loading: boolean = false;

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

    this.categoryId = this.route.snapshot.paramMap.get('categoryId') || '';
    this.loadTopics();

    const storedDark = localStorage.getItem('darkMode');
    this.darkMode = storedDark === 'true';
    this.applyTheme();
  }

  loadTopics(): void {
    if (!this.categoryId) return;

    this.loading = true;
    this.apiService.getTopicsByCategory(Number(this.categoryId)).subscribe({
      next: (topics) => {
        this.topics = topics;
        // Set category name from first topic if available
        if (topics.length > 0) {
          this.category = {
            id: this.categoryId,
            name: topics[0].categoryName || 'Topics'
          };
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load topics', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  selectTopic(topic: Topic): void {
    this.router.navigate(['/image-viewer', topic.id]);
  }

  goBack(): void {
    this.router.navigate(['/categories']);
  }

  applyTheme() {
    if (this.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
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