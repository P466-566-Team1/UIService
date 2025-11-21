import { Routes } from '@angular/router';
import { LanguageSelectorComponent } from './language-selector/language-selector';
import { CategoryListComponent } from './category-list/category-list';
import { TopicListComponent } from './topic-list/topic-list';
import { ImageViewerComponent } from './image-viewer/image-viewer';

export const routes: Routes = [
    { path: '', component: LanguageSelectorComponent },
    { path: 'categories', component: CategoryListComponent },
    { path: 'topics/:categoryId', component: TopicListComponent },
    { path: 'image-viewer/:topicId', component: ImageViewerComponent },
    { path: '**', redirectTo: '' }
];