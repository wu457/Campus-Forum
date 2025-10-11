import { Routes } from '@angular/router';
import { AdminGuard } from './admin.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { PostManagementComponent } from './post-management/post-management.component';
import { SectionManagementComponent } from './section-management/section-management.component';
import { PermissionManagementComponent } from './permission-management/permission-management.component';
import { StatisticsComponent } from './statistics/statistics.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    canActivate: [AdminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'statistics', component: StatisticsComponent },
      { path: 'users', component: UserManagementComponent },
      { path: 'posts', component: PostManagementComponent },
      { path: 'sections', component: SectionManagementComponent },
      { path: 'permissions', component: PermissionManagementComponent }
    ]
  }
];