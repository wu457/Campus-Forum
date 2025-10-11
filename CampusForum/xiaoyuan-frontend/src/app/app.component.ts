import { Component } from '@angular/core';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { LoginComponent } from './user/login/login.component';
import { RegisterComponent } from './user/register/register.component';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { SectionListComponent } from "./section/list/list.component";
import { SectionManagementComponent } from "./admin/section-management/section-management.component";
import { FooterComponent } from './shared/footer/footer.component';
import { UserService } from './user/user.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,
    HttpClientModule,
    NavbarComponent,
    FooterComponent,
  ],
  providers: [UserService],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = '校园论坛管理系统';
}