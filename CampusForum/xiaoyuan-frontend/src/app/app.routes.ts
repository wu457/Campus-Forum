import { Routes } from "@angular/router";
import { LoginComponent } from "./user/login/login.component";
import { RegisterComponent } from "./user/register/register.component";
import { SectionListComponent } from "./section/list/list.component";
import { PostListComponent } from "./post/list/list.component";
import { CreateComponent } from "./post/create/create.component";
import { DetailComponent } from "./post/detail/detail.component";
import { EditComponent } from "./post/edit/edit.component";
import { ProfileComponent } from "./user/profile/profile.component";
import { ChangePasswordComponent } from "./user/change-password/change-password.component";

export const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path:'home', component:SectionListComponent},
    { path:'section/:id', component:PostListComponent},
    { path:'post/create',component:CreateComponent},
    { path:'post/:id', component:DetailComponent},
    { path:'post/edit/:id', component:EditComponent},
    { path:'user/profile', component:ProfileComponent},
    { path:'user/change-password', component:ChangePasswordComponent},
    { 
      path: 'admin', 
      loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) 
    }
  ];
