import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EdgeApiService } from '../../services/edge-api.service';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Component({
    selector: 'app-admin-analytics-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './admin-analytics-dashboard.component.html',
    styleUrls: ['./admin-analytics-dashboard.component.css']
})
export class AdminAnalyticsDashboardComponent implements OnInit {
    topCategories: any[] = [];
    topTopics: any[] = [];
    summary: any = null;
    loading = false;
    lastRefreshed: Date | null = null;

    constructor(
        private router: Router,
        private apiService: EdgeApiService,
        private cdRef: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.loadAnalytics();
    }

    loadAnalytics(): void {
        this.loading = true;

        // Use forkJoin with catchError to handle individual failures gracefully
        forkJoin({
            categories: this.apiService.getTopCategories(10).pipe(
                catchError(err => {
                    console.error('Failed to load categories:', err);
                    return of([]);
                })
            ),
            topics: this.apiService.getTopTopics(10).pipe(
                catchError(err => {
                    console.error('Failed to load topics:', err);
                    return of([]);
                })
            ),
            summary: this.apiService.getAnalyticsSummary().pipe(
                catchError(err => {
                    console.error('Failed to load summary:', err);
                    return of({
                        totalCategoryViews: 0,
                        totalTopicViews: 0,
                        uniqueCategoriesViewed: 0,
                        uniqueTopicsViewed: 0
                    });
                })
            )
        }).pipe(
            finalize(() => {
                this.loading = false;
                this.cdRef.detectChanges();
            })
        ).subscribe({
            next: (result) => {
                this.topCategories = result.categories || [];
                this.topTopics = result.topics || [];
                this.summary = result.summary;
                this.lastRefreshed = new Date();
            },
            error: (err) => {
                console.error('Unexpected error in analytics dashboard:', err);
                alert('Error loading analytics: ' + err.message);
            }
        });
    }

    refreshAnalytics(): void {
        this.loadAnalytics();
    }

    goBack(): void {
        this.router.navigate(['/admin']);
    }
}
