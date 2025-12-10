import { Routes } from '@angular/router';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { AdminCategoryListComponent } from './admin-category-list/admin-category-list.component';
import { AdminAddCategoryComponent } from './admin-add-category/admin-add-category.component';
import { AdminAddTopicComponent } from './admin-add-topic/admin-add-topic.component';
import { LabelEditorComponent } from './admin-label-editor/admin-label-editor.component';


export const routes: Routes = [
  { path: 'admin', component: AdminLoginComponent },
  { path: 'admin/categories', component: AdminCategoryListComponent },
  { path: 'admin/categories/add', component: AdminAddCategoryComponent },
  { path: 'admin/categories/:categoryId/add-topic', component: AdminAddTopicComponent },
  { path: 'admin/topics/:topicId/labels', component: LabelEditorComponent },
];
