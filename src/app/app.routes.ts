import { Routes } from '@angular/router';
import { LanguageSelectorComponent } from './language-selector/language-selector';
import { CategoryListComponent } from './category-list/category-list';
import { TopicListComponent } from './topic-list/topic-list';
import { ImageViewerComponent } from './image-viewer/image-viewer';
import { AdminLoginComponent } from './admin/admin-login/admin-login.component';
import { AdminCategoryListComponent } from './admin/admin-category-list/admin-category-list.component';
import { AdminAddCategoryComponent } from './admin/admin-add-category/admin-add-category.component';
import { AdminAddTopicComponent } from './admin/admin-add-topic/admin-add-topic.component';
import { LabelEditorComponent } from './admin/admin-label-editor/admin-label-editor.component';
import { AdminTopicListComponent } from './admin/admin-topic-list/admin-topic-list.component';
import { AdminAnalyticsDashboardComponent } from './admin/admin-analytics-dashboard/admin-analytics-dashboard.component';

export const routes: Routes = [
    { path: '', component: LanguageSelectorComponent },
    { path: 'categories', component: CategoryListComponent },
    { path: 'topics/:categoryId', component: TopicListComponent },
    { path: 'image-viewer/:topicId', component: ImageViewerComponent },
    { path: 'admin', component: AdminLoginComponent },
    { path: 'admin/categories', component: AdminCategoryListComponent },
    { path: 'admin/categories/add', component: AdminAddCategoryComponent },
    { path: 'admin/categories/:categoryId/topics', component: AdminTopicListComponent },
    { path: 'admin/categories/:categoryId/add-topic', component: AdminAddTopicComponent },
    { path: 'admin/label-editor/:number/:topicId', component: LabelEditorComponent },
    { path: 'admin/analytics', component: AdminAnalyticsDashboardComponent },
    { path: '**', redirectTo: '' }
];