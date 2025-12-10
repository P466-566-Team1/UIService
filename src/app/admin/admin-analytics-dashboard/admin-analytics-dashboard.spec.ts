import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAnalyticsDashboard } from './admin-analytics-dashboard';

describe('AdminAnalyticsDashboard', () => {
  let component: AdminAnalyticsDashboard;
  let fixture: ComponentFixture<AdminAnalyticsDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAnalyticsDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAnalyticsDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
