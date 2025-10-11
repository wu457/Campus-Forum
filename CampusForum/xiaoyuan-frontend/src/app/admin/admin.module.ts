import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ADMIN_ROUTES } from './admin.routes';
import { AdminGuard } from './admin.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { PostManagementComponent } from './post-management/post-management.component';
import { SectionManagementComponent } from './section-management/section-management.component';
import { PermissionManagementComponent } from './permission-management/permission-management.component';
import { StatisticsComponent } from './statistics/statistics.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(ADMIN_ROUTES),
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    DashboardComponent,
    UserManagementComponent,
    PostManagementComponent,
    SectionManagementComponent,
    PermissionManagementComponent,
    StatisticsComponent
  ],
  providers: [AdminGuard]
})
export class AdminModule { }
